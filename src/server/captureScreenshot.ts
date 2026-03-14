import { chromium } from "playwright";

const DESKTOP = { width: 1280, height: 800 };
const MOBILE = { width: 390, height: 844 };
const GOTO_TIMEOUT = 25_000;

export type CapturedScreenshots = {
  desktop: Buffer;
  mobile: Buffer;
};

export async function captureOnboardingScreenshots(
  url: string,
): Promise<CapturedScreenshots> {
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const [desktopBuffer, mobileBuffer] = await Promise.all([
      (async () => {
        const ctx = await browser.newContext({ viewport: DESKTOP });
        const page = await ctx.newPage();
        await page.goto(url, { waitUntil: "load", timeout: GOTO_TIMEOUT });
        const buf = await page.screenshot({ type: "png", fullPage: false });
        await ctx.close();
        return buf;
      })(),
      (async () => {
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

    return { desktop: desktopBuffer, mobile: mobileBuffer };
  } finally {
    await browser.close();
  }
}
