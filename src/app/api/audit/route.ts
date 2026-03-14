import { z } from "zod";
import type { AgentEvent } from "@/types/audit";
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
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request: `url` is required and must be a valid URL.", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { url } = parsed.data;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function emit(event: AgentEvent) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }

      try {
        const { flowSteps, mobile } = await captureWithAgent(url, emit);

        emit({ type: "analysis_start" });
        const report = await analyzeScreenshots(flowSteps[0].screenshot, mobile, url);

        emit({
          type: "done",
          report,
          screenshots: {
            desktop: `data:image/png;base64,${flowSteps[0].screenshot.toString("base64")}`,
            mobile: `data:image/png;base64,${mobile.toString("base64")}`,
          },
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Unexpected error.";
        emit({ type: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
