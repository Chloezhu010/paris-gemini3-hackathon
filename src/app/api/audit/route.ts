import { NextResponse } from "next/server";

export const runtime = "nodejs";

type InputMode = "url" | "text" | "screenshot";

type AuditIssue = {
  title: string;
  severity: 1 | 2 | 3 | 4 | 5;
  evidence: string;
  recommendation: string;
};

type AuditReport = {
  generatedAt: string;
  productGuess: string;
  primaryGoal: string;
  score: number;
  quickWins: string[];
  issues: AuditIssue[];
};

function makeMockReport(mode: InputMode, hint?: string): AuditReport {
  const hintLabel = hint ? ` (${hint})` : "";
  const now = new Date().toISOString();

  const base: AuditReport = {
    generatedAt: now,
    productGuess:
      mode === "text"
        ? `B2C product landing${hintLabel}`
        : mode === "screenshot"
          ? `UI screenshot review${hintLabel}`
          : `Website landing page${hintLabel}`,
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
        evidence: "Headline, subcopy, and CTA have similar weight at first glance.",
        recommendation:
          "Increase headline size/contrast, reduce paragraph density, and add more spacing between hero blocks.",
      },
      {
        title: "Primary CTA lacks specificity",
        severity: 3,
        evidence: "CTA label is generic and doesn’t communicate outcome.",
        recommendation:
          "Rewrite CTA to an outcome-based label (e.g. “Get my audit” / “Generate report”).",
      },
      {
        title: "Low trust on first screen",
        severity: 3,
        evidence: "No credibility markers near the conversion point.",
        recommendation:
          "Add a compact credibility row: customer logos, a short testimonial, or a measurable stat.",
      },
    ],
  };

  return base;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { mode?: InputMode; url?: string; idea?: string; screenshot?: unknown }
    | null;

  const mode = body?.mode;
  if (mode !== "url" && mode !== "text" && mode !== "screenshot") {
    return NextResponse.json(
      { error: "Invalid request: missing `mode`." },
      { status: 400 },
    );
  }

  const hint =
    mode === "url"
      ? body?.url?.slice(0, 80)
      : mode === "text"
        ? body?.idea?.slice(0, 80)
        : undefined;

  return NextResponse.json({ report: makeMockReport(mode, hint) });
}

