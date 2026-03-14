import { NextResponse } from "next/server";
import { z } from "zod";
import type { DesignResponse, OnboardingStep } from "@/types/audit";
import { captureOnboardingFlow } from "@/server/captureScreenshot";
import { analyzeScreenshots } from "@/server/geminiClient";

// Verdicts/notes are mock until per-step Gemini analysis is wired
const STEP_VERDICTS: OnboardingStep["verdict"][] = ["needs-work", "issue", "needs-work"];
const STEP_NOTES = [
  "First impression — assess hero clarity, CTA visibility, and trust signals above the fold.",
  "Post-CTA destination — check whether users land on a value page or are immediately asked to commit.",
  "Sign-up form — evaluate field count, friction, and available auth options.",
];

export const runtime = "nodejs";

const requestSchema = z.object({
  url: z.url(),
});

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

    // Use landing page screenshot (step 0) + mobile for Gemini analysis
    const report = await analyzeScreenshots(flowSteps[0].screenshot, mobile, url);

    const onboardingSteps: OnboardingStep[] = flowSteps.map((step, i) => ({
      name: step.name,
      screenshotUrl: `data:image/png;base64,${step.screenshot.toString("base64")}`,
      verdict: STEP_VERDICTS[i] ?? "needs-work",
      notes: STEP_NOTES[i] ?? "Captured by Playwright.",
    }));

    const response: DesignResponse = {
      report,
      screenshots: {
        desktop: `data:image/png;base64,${flowSteps[0].screenshot.toString("base64")}`,
        mobile: `data:image/png;base64,${mobile.toString("base64")}`,
      },
      onboardingSteps,
    };

    return NextResponse.json(response);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
