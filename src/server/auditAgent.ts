import { chromium, type Page } from "playwright";
import { GoogleGenAI, type GenerateContentResponse } from "@google/genai";
import type { AgentEvent } from "@/types/audit";
import type { CapturedFlowStep } from "./captureScreenshot";

const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-pro";
const DEFAULT_TIMEOUT_MS = 30_000;
const MODEL_TIMEOUT_MS = (() => {
  const value = Number(process.env.GEMINI_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_TIMEOUT_MS;
})();
const DESKTOP = { width: 1280, height: 800 };
const MOBILE = { width: 390, height: 844 };
const GOTO_TIMEOUT = 25_000;
const NAV_TIMEOUT = 8_000;
const MAX_AGENT_STEPS = 5;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenAI({ apiKey });
}

// Tool declarations — Gemini decides which to call each turn
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TOOLS: any[] = [
  {
    functionDeclarations: [
      {
        name: "click_text",
        description:
          "Click the button or link whose visible text best matches the given string. " +
          "Use for primary CTAs (Get Started, Sign Up, Try Free, Start Now, etc.) and navigation links.",
        parameters: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "Exact visible text of the element to click as it appears on screen",
            },
          },
          required: ["text"],
        },
      },
      {
        name: "scroll_page",
        description:
          "Scroll the viewport down to reveal content below the fold. " +
          "Use when the signup CTA is not yet visible in the current screenshot.",
        parameters: {
          type: "object",
          properties: {
            pixels: {
              type: "number",
              description: "Pixels to scroll down (default: 400)",
            },
          },
          required: [],
        },
      },
      {
        name: "done",
        description:
          "Signal that the flow capture is complete. Call this when: " +
          "(a) you have reached a sign-up / account creation / auth form, " +
          "(b) you have completed 2+ successful click actions, or " +
          "(c) no clear signup CTA exists on the page.",
        parameters: {
          type: "object",
          properties: {
            reason: {
              type: "string",
              description: "Brief explanation of why capture is done",
            },
          },
          required: ["reason"],
        },
      },
    ],
  },
];

const AGENT_PROMPT =
  "You are a browser agent capturing the signup onboarding flow of a product website.\n\n" +
  "Goal: from the landing page, find the primary signup or 'get started' CTA, click through it, " +
  "and follow the flow until you reach a sign-up form or authentication screen.\n\n" +
  "Rules:\n" +
  "- Call click_text with the EXACT text visible in the screenshot\n" +
  "- Call scroll_page if the CTA is not yet visible in the viewport\n" +
  "- Call done once you have reached a signup/auth form, or after 2+ CTA clicks\n" +
  "- Never invent text that is not visible in the current screenshot\n" +
  "- Prefer the most prominent trial or signup CTA over secondary navigation links";

async function executeToolCall(
  page: Page,
  name: string,
  args: Record<string, unknown>,
): Promise<string> {
  if (name === "click_text") {
    const text = String(args.text ?? "");
    try {
      const byRole = page
        .getByRole("button", { name: text, exact: false })
        .or(page.getByRole("link", { name: text, exact: false }))
        .first();

      if ((await byRole.count()) > 0) {
        await Promise.all([
          page.waitForLoadState("networkidle", { timeout: NAV_TIMEOUT }).catch(() => {}),
          byRole.click(),
        ]);
        return `Clicked "${text}"`;
      }

      const byText = page.getByText(text, { exact: false }).first();
      if ((await byText.count()) > 0) {
        await Promise.all([
          page.waitForLoadState("networkidle", { timeout: NAV_TIMEOUT }).catch(() => {}),
          byText.click(),
        ]);
        return `Clicked "${text}" via text match`;
      }

      return `Element "${text}" not found on page`;
    } catch (e) {
      return `Click error: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  if (name === "scroll_page") {
    const px = Number(args.pixels ?? 400);
    await page.evaluate((scrollPx: number) => window.scrollBy(0, scrollPx), px);
    await page.waitForTimeout(300);
    return `Scrolled ${px}px down`;
  }

  return `Unknown tool: ${name}`;
}

async function runDesktopAgent(
  page: Page,
  url: string,
  ai: GoogleGenAI,
  onEvent: (e: AgentEvent) => void,
): Promise<CapturedFlowStep[]> {
  const steps: CapturedFlowStep[] = [];

  onEvent({ type: "navigating", url });
  await page.goto(url, { waitUntil: "load", timeout: GOTO_TIMEOUT });

  let screenshot = await page.screenshot({ type: "png", fullPage: false });
  steps.push({ name: "Landing page", screenshot });
  onEvent({ type: "screenshot_taken", name: "Landing page", index: 0 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages: any[] = [
    {
      role: "user",
      parts: [
        { text: AGENT_PROMPT },
        { text: `Website URL: ${url}` },
        { text: "Current page screenshot:" },
        { inlineData: { mimeType: "image/png", data: screenshot.toString("base64") } },
      ],
    },
  ];

  let agentSteps = 0;

  while (agentSteps < MAX_AGENT_STEPS) {
    onEvent({ type: "agent_thinking" });

    const response = await (async (): Promise<GenerateContentResponse> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);
      try {
        return await ai.models.generateContent({
          model: MODEL,
          contents: messages,
          config: {
            tools: TOOLS,
            abortSignal: controller.signal,
            httpOptions: { timeout: MODEL_TIMEOUT_MS },
          },
        });
      } finally {
        clearTimeout(timeoutId);
      }
    })().catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      const isTimeout = /timeout|abort/i.test(message);
      onEvent({
        type: "agent_done",
        reason: isTimeout
          ? `Gemini request timed out after ${Math.round(MODEL_TIMEOUT_MS / 1000)}s`
          : `Gemini error: ${message}`,
      });
      return null;
    });

    if (!response) break;

    const candidate = response.candidates?.[0];
    if (!candidate?.content) break;

    messages.push({ role: "model", parts: candidate.content.parts });

    const calls = response.functionCalls;
    if (!calls || calls.length === 0) break;

    const call = calls[0];
    const callName = call.name ?? "";
    const callArgs = (call.args ?? {}) as Record<string, unknown>;

    if (callName === "done") {
      onEvent({ type: "agent_done", reason: String(callArgs.reason ?? "") });
      messages.push({
        role: "user",
        parts: [
          { functionResponse: { id: call.id, name: "done", response: { acknowledged: true } } },
        ],
      });
      break;
    }

    onEvent({ type: "agent_action", tool: callName, args: callArgs });

    const result = await executeToolCall(page, callName, callArgs);
    agentSteps++;

    screenshot = await page.screenshot({ type: "png", fullPage: false });
    const stepName =
      callName === "click_text"
        ? `Clicked "${callArgs.text}"`
        : callName === "scroll_page"
          ? "Scrolled page"
          : callName;
    steps.push({ name: stepName, screenshot });
    onEvent({ type: "screenshot_taken", name: stepName, index: steps.length - 1 });

    messages.push({
      role: "user",
      parts: [
        { functionResponse: { id: call.id, name: callName, response: { result } } },
        { text: `Screenshot after "${callName}":` },
        { inlineData: { mimeType: "image/png", data: screenshot.toString("base64") } },
      ],
    });
  }

  return steps;
}

/**
 * Captures the onboarding flow using a Gemini function-calling agent to drive
 * the browser, eliminating hardcoded CTA selectors.
 *
 * Emits AgentEvent callbacks as each step completes so callers can stream
 * real-time progress to clients.
 */
export async function captureWithAgent(
  url: string,
  onEvent: (e: AgentEvent) => void = () => {},
): Promise<{
  flowSteps: CapturedFlowStep[];
  mobile: Buffer;
}> {
  const ai = getClient();
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const [flowSteps, mobile] = await Promise.all([
      (async (): Promise<CapturedFlowStep[]> => {
        const ctx = await browser.newContext({ viewport: DESKTOP });
        const page = await ctx.newPage();
        try {
          return await runDesktopAgent(page, url, ai, onEvent);
        } finally {
          await ctx.close();
        }
      })(),

      (async (): Promise<Buffer> => {
        const ctx = await browser.newContext({
          viewport: MOBILE,
          userAgent:
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        });
        const page = await ctx.newPage();
        try {
          await page.goto(url, { waitUntil: "load", timeout: GOTO_TIMEOUT });
          const buf = await page.screenshot({ type: "png", fullPage: false });
          onEvent({ type: "screenshot_taken", name: "Mobile landing", index: -1 });
          return buf;
        } finally {
          await ctx.close();
        }
      })(),
    ]);

    return { flowSteps, mobile };
  } finally {
    await browser.close();
  }
}
