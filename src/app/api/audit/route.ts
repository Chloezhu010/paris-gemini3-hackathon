import { NextResponse } from "next/server";
import { z } from "zod";
import type { DesignResponse } from "@/types/audit";
import { captureWithAgent } from "@/server/auditAgent";
import { analyzeScreenshots } from "@/server/geminiClient";

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
    const { flowSteps, mobile } = await captureWithAgent(url);

    // Use landing page screenshot (step 0) + mobile for Gemini analysis
    const report = await analyzeScreenshots(flowSteps[0].screenshot, mobile, url);

    const response: DesignResponse = {
      report,
      screenshots: {
        desktop: `data:image/png;base64,${flowSteps[0].screenshot.toString("base64")}`,
        mobile: `data:image/png;base64,${mobile.toString("base64")}`,
      },
    };

    return NextResponse.json(response);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
