import { NextResponse } from "next/server";
import { z } from "zod";
import type { AuditReport, AuditResponse } from "@/types/audit";
import { captureOnboardingScreenshots } from "@/server/captureScreenshot";
import { analyzeScreenshots } from "@/server/geminiClient";

export const runtime = "nodejs";

const requestSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("url"), url: z.string().url() }),
  z.object({ mode: z.literal("text"), idea: z.string().min(1).max(2000) }),
  z.object({ mode: z.literal("screenshot") }),
]);

// Kept for text/screenshot fallback modes
function makeMockReport(hint?: string): AuditReport {
  return {
    generatedAt: new Date().toISOString(),
    productGuess: hint ? `Product: ${hint}` : "B2C landing page",
    primaryGoal: "Increase sign-ups / conversions",
    score: 76,
    quickWins: [
      "Tighten hero headline to 1 clear promise + 1 proof line.",
      "Make primary CTA visually dominant; demote secondary actions.",
      "Add trust signals above the fold (logos, stats, security).",
    ],
    issues: [
      {
        title: "Weak visual hierarchy in the hero",
        severity: 4,
        evidence: "Headline, subcopy, and CTA have similar visual weight.",
        recommendation:
          "Increase headline size/contrast, reduce paragraph density, add more spacing.",
      },
      {
        title: "Primary CTA lacks specificity",
        severity: 3,
        evidence: "CTA label is generic and doesn't communicate outcome.",
        recommendation: 'Rewrite to outcome-based label e.g. "Get my audit".',
      },
      {
        title: "Low trust on first screen",
        severity: 3,
        evidence: "No credibility markers near the conversion point.",
        recommendation: "Add logos, a short testimonial, or a measurable stat.",
      },
    ],
  };
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", details: parsed.error.format() },
      { status: 400 },
    );
  }

  const input = parsed.data;

  // — URL mode: real Playwright + Gemini pipeline —
  if (input.mode === "url") {
    try {
      const screenshots = await captureOnboardingScreenshots(input.url);
      const report = await analyzeScreenshots(screenshots.desktop, screenshots.mobile);

      const response: AuditResponse = {
        report,
        screenshots: {
          desktop: `data:image/png;base64,${screenshots.desktop.toString("base64")}`,
          mobile: `data:image/png;base64,${screenshots.mobile.toString("base64")}`,
        },
      };

      return NextResponse.json(response);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unexpected error.";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // — Fallback: mock for text/screenshot modes —
  const hint = input.mode === "text" ? input.idea.slice(0, 80) : undefined;
  return NextResponse.json({ report: makeMockReport(hint) } satisfies AuditResponse);
}
