import { GoogleGenAI, type GenerateContentResponse } from "@google/genai";
import type {
  DesignReport,
  DesignColor,
  DesignDecision,
  FlowStep,
} from "@/types/audit";

const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-pro";
const DEFAULT_TIMEOUT_MS = 30_000;
const MODEL_TIMEOUT_MS = (() => {
  const value = Number(process.env.GEMINI_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_TIMEOUT_MS;
})();

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenAI({ apiKey });
}

const RESPONSE_SCHEMA = {
  type: "object",
  required: [
    "name",
    "userFlow",
    "userFlowSteps",
    "designLanguage",
    "designDecisions",
    "vibeKeywords",
  ],
  properties: {
    name: { type: "string", description: "Product or page name inferred from the UI" },
    userFlow: { type: "string", description: "One paragraph describing the overall user flow visible in the screenshots" },
    userFlowSteps: {
      type: "array",
      items: {
        type: "object",
        required: ["step", "action", "decisionPoint"],
        properties: {
          step: { type: "number" },
          action: { type: "string", description: "Short description of what the user does or sees" },
          decisionPoint: { type: "boolean" },
        },
      },
    },
    designLanguage: {
      type: "object",
      required: ["colors", "typography", "components", "animationVibe"],
      properties: {
        colors: {
          type: "array",
          items: {
            type: "object",
            required: ["hex", "usage"],
            properties: {
              hex: { type: "string", description: "Hex color code e.g. #E1306C" },
              usage: { type: "string", description: "Where this color is used e.g. primary CTA" },
            },
          },
        },
        typography: {
          type: "object",
          required: ["headlineFont", "headlineSize", "bodyFont", "bodySize"],
          properties: {
            headlineFont: { type: "string" },
            headlineSize: { type: "number" },
            bodyFont: { type: "string" },
            bodySize: { type: "number" },
          },
        },
        components: {
          type: "array",
          items: { type: "string" },
          description: "Notable UI components visible e.g. sticky header, card grid, floating CTA",
        },
        animationVibe: {
          type: "string",
          description: "Descriptive phrase for motion style e.g. snappy transitions, energetic",
        },
      },
    },
    designDecisions: {
      type: "array",
      items: {
        type: "object",
        required: ["question", "answer"],
        properties: {
          question: { type: "string", description: "Why [specific design choice]?" },
          answer: { type: "string", description: "Inferred intent or user benefit" },
        },
      },
    },
    vibeKeywords: {
      type: "array",
      items: { type: "string" },
      description: "3–5 adjectives capturing the emotional tone e.g. vibrant, youthful, instant",
    },
  },
};

const PROMPT = `You are a senior UX designer and design systems expert.
You are given a sequence of desktop screenshots captured step-by-step as a browser agent navigated the signup/onboarding flow, plus a mobile landing page screenshot.
Extract a complete design reference card to help other designers understand and replicate this design language and onboarding flow.

Guidelines:
- Extract 3–6 colors actually visible in the screenshots (approximate hex values)
- Return 3–7 userFlowSteps describing the actual navigation journey shown across the desktop screenshots
- Return 2–4 designDecisions explaining notable choices you observe
- Return exactly 3–5 vibeKeywords capturing the emotional tone
- List concrete UI components you can see (e.g. "sticky header", "card grid", "floating CTA", "auth form")
- Reference what you actually see across all screenshots; do not invent elements not present`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseReport(parsed: Record<string, any>, url: string): DesignReport {
  const lang = parsed.designLanguage ?? {};

  const colors: DesignColor[] = Array.isArray(lang.colors)
    ? lang.colors.map((c: Record<string, unknown>) => ({
        hex: String(c.hex ?? "#000000"),
        usage: String(c.usage ?? ""),
      }))
    : [];

  const typography = {
    headlineFont: String(lang.typography?.headlineFont ?? "system-ui"),
    headlineSize: Number(lang.typography?.headlineSize ?? 24),
    bodyFont: String(lang.typography?.bodyFont ?? "system-ui"),
    bodySize: Number(lang.typography?.bodySize ?? 14),
  };

  const userFlowSteps: FlowStep[] = Array.isArray(parsed.userFlowSteps)
    ? parsed.userFlowSteps.map((s: Record<string, unknown>, i: number) => ({
        step: Number(s.step ?? i + 1),
        action: String(s.action ?? ""),
        decisionPoint: Boolean(s.decisionPoint ?? false),
      }))
    : [];

  const designDecisions: DesignDecision[] = Array.isArray(parsed.designDecisions)
    ? parsed.designDecisions.map((d: Record<string, unknown>) => ({
        question: String(d.question ?? ""),
        answer: String(d.answer ?? ""),
      }))
    : [];

  return {
    generatedAt: new Date().toISOString(),
    name: String(parsed.name ?? ""),
    url,
    userFlow: String(parsed.userFlow ?? ""),
    userFlowSteps,
    designLanguage: {
      colors,
      typography,
      components: Array.isArray(lang.components) ? lang.components.map(String) : [],
      animationVibe: String(lang.animationVibe ?? ""),
    },
    designDecisions,
    vibeKeywords: Array.isArray(parsed.vibeKeywords) ? parsed.vibeKeywords.map(String) : [],
  };
}

export async function analyzeScreenshots(
  desktopSteps: { name: string; screenshot: Buffer }[],
  mobile: Buffer,
  url: string,
): Promise<DesignReport> {
  const ai = getClient();

  // Build parts: include each desktop step screenshot with its label
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stepParts: any[] = desktopSteps.flatMap((step, i) => [
    { text: `Desktop step ${i + 1} — "${step.name}":` },
    { inlineData: { mimeType: "image/png", data: step.screenshot.toString("base64") } },
  ]);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);
  let response: GenerateContentResponse;
  try {
    response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { text: PROMPT },
            ...stepParts,
            { text: "Mobile screenshot (390×844) — landing page:" },
            { inlineData: { mimeType: "image/png", data: mobile.toString("base64") } },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: RESPONSE_SCHEMA,
        abortSignal: controller.signal,
        httpOptions: { timeout: MODEL_TIMEOUT_MS },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isTimeout = /timeout|abort/i.test(message);
    throw new Error(
      isTimeout
        ? `Gemini request timed out after ${Math.round(MODEL_TIMEOUT_MS / 1000)}s`
        : `Gemini error: ${message}`,
    );
  } finally {
    clearTimeout(timeoutId);
  }

  const raw = (response.text ?? "").trim();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsed = JSON.parse(raw) as Record<string, any>;
  return parseReport(parsed, url);
}
