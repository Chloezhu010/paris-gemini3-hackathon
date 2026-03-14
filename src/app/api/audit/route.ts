import { NextResponse } from "next/server";
import { z } from "zod";
import type { DesignResponse } from "@/types/audit";
import { captureOnboardingScreenshots } from "@/server/captureScreenshot";
import { analyzeScreenshots } from "@/server/geminiClient";

export const runtime = "nodejs";

const requestSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("url"), url: z.string().url() }),
  z.object({ mode: z.literal("text"), idea: z.string().min(1).max(2000) }),
  z.object({ mode: z.literal("screenshot") }),
]);


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

  if (input.mode !== "url") {
    return NextResponse.json({ error: "Only URL mode is supported." }, { status: 400 });
  }

  try {
    const screenshots = await captureOnboardingScreenshots(input.url);
    const report = await analyzeScreenshots(screenshots.desktop, screenshots.mobile, input.url);

    const response: DesignResponse = {
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
