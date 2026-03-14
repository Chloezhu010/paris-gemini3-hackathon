import { NextResponse } from "next/server";
import { z } from "zod";
import type { AuditResponse, OnboardingStep } from "@/types/audit";
import { captureOnboardingFlow } from "@/server/captureScreenshot";
import { analyzeScreenshots } from "@/server/geminiClient";

export const runtime = "nodejs";

const requestSchema = z.object({
  url: z.url(),
});

// Verdict is mock until Gemini per-step analysis is wired
const STEP_VERDICTS: OnboardingStep["verdict"][] = ["needs-work", "issue", "needs-work"];
const STEP_NOTES = [
  "Hero headline is vague. Primary CTA competes visually with nav links — no clear focal point above the fold.",
  "CTA navigates to a pricing page before showing product value. Users are asked to choose a plan without understanding what they're signing up for.",
  "Form requests 6 fields including phone number on step 1. No social login option and no progress indicator.",
];

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
      { error: "Invalid request: `url` is required and must be a valid URL.", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { url } = parsed.data;

  try {
    const { flowSteps, mobile } = await captureOnboardingFlow(url);

    // Use landing page (step 0) + mobile for Gemini analysis
    const report = await analyzeScreenshots(flowSteps[0].screenshot, mobile);

    // Map captured flow steps to OnboardingStep — verdicts are mock until
    // per-step Gemini analysis is wired
    const onboardingSteps: OnboardingStep[] = flowSteps.map((step, i) => ({
      name: step.name,
      screenshotUrl: `data:image/png;base64,${step.screenshot.toString("base64")}`,
      verdict: STEP_VERDICTS[i] ?? "needs-work",
      notes: STEP_NOTES[i] ?? "Captured by Playwright.",
    }));

    const response: AuditResponse = {
      report,
      onboardingSteps,
    };

    return NextResponse.json(response);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
