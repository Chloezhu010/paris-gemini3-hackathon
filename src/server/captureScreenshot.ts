import { chromium } from "playwright";

const DESKTOP = { width: 1280, height: 800 };
const MOBILE = { width: 390, height: 844 };
const GOTO_TIMEOUT = 30_000;
const NAV_TIMEOUT = 15_000;

// Ordered by priority — first match wins
const CTA_PATTERNS = [
  /get[\s-]?started/i,
  /start[\s-]?free/i,
  /try[\s-]?free/i,
  /sign[\s-]?up/i,
  /create[\s-]?account/i,
  /join[\s-]?free/i,
  /join now/i,
  /start now/i,
  /register/i,
];

export type CapturedFlowStep = {
  name: string;
  screenshot: Buffer;
};

export type CapturedScreenshots = {
  desktop: Buffer;
  mobile: Buffer;
};

/**
 * Navigates the signup onboarding flow and screenshots each step:
 * 1. Landing page
 * 2. Page after clicking the primary CTA (e.g. pricing or signup)
 * 3. Sign-up form (if a further step is found)
 *
 * Also captures a mobile landing screenshot in parallel for Gemini analysis.
 */
export async function captureOnboardingFlow(url: string): Promise<{
  flowSteps: CapturedFlowStep[];
  mobile: Buffer;
}> {
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const [flowSteps, mobile] = await Promise.all([
      // Desktop: follow the signup flow
      (async (): Promise<CapturedFlowStep[]> => {
        const ctx = await browser.newContext({ viewport: DESKTOP });
        const page = await ctx.newPage();
        const steps: CapturedFlowStep[] = [];

        // Step 1: Landing page
        await page.goto(url, { waitUntil: "load", timeout: GOTO_TIMEOUT });
        steps.push({
          name: "Landing page",
          screenshot: await page.screenshot({ type: "png", fullPage: false }),
        });

        // Find primary CTA
        let ctaLabel: string | null = null;
        for (const pattern of CTA_PATTERNS) {
          const el = page
            .getByRole("link", { name: pattern })
            .or(page.getByRole("button", { name: pattern }))
            .first();
          if ((await el.count()) > 0) {
            ctaLabel = (await el.textContent())?.trim() ?? null;
            try {
              await Promise.all([
                page.waitForLoadState("networkidle", { timeout: NAV_TIMEOUT }),
                el.click(),
              ]);
            } catch {
              // networkidle timed out — page likely navigated anyway
            }
            break;
          }
        }

        if (!ctaLabel) {
          await ctx.close();
          return steps;
        }

        // Step 2: Page after CTA click (pricing or signup)
        steps.push({
          name: `Clicked "${ctaLabel}"`,
          screenshot: await page.screenshot({ type: "png", fullPage: false }),
        });

        // Step 3: If we're on a pricing page, try to find a signup link
        const signupPattern = /sign[\s-]?up|create[\s-]?account|get[\s-]?started/i;
        const signupEl = page
          .getByRole("link", { name: signupPattern })
          .or(page.getByRole("button", { name: signupPattern }))
          .first();

        if ((await signupEl.count()) > 0) {
          try {
            await Promise.all([
              page.waitForLoadState("networkidle", { timeout: NAV_TIMEOUT }),
              signupEl.click(),
            ]);
          } catch {
            // continue regardless
          }
          steps.push({
            name: "Sign-up form",
            screenshot: await page.screenshot({ type: "png", fullPage: false }),
          });
        }

        await ctx.close();
        return steps;
      })(),

      // Mobile: landing page only (for Gemini analysis)
      (async (): Promise<Buffer> => {
        const ctx = await browser.newContext({
          viewport: MOBILE,
          userAgent:
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        });
        const page = await ctx.newPage();
        await page.goto(url, { waitUntil: "load", timeout: GOTO_TIMEOUT });
        const buf = await page.screenshot({ type: "png", fullPage: false });
        await ctx.close();
        return buf;
      })(),
    ]);

    return { flowSteps, mobile };
  } finally {
    await browser.close();
  }
}
