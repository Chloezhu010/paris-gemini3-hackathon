import { GoogleGenAI } from "@google/genai";
import type { AuditReport, AuditIssue } from "@/types/audit";

const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-pro";

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenAI({ apiKey });
}

const PROMPT = `You are a senior UI/UX designer and conversion rate optimization expert.
Analyze the desktop and mobile screenshots of this website's landing/onboarding page.
Return ONLY a raw JSON object — no markdown, no code fences, no explanation.

Required JSON structure:
{
  "productGuess": "one-sentence description of what this product does",
  "primaryGoal": "the primary conversion goal of this page (e.g. sign up, download, buy)",
  "score": 74,
  "quickWins": ["Quick win 1", "Quick win 2", "Quick win 3"],
  "issues": [
    {
      "title": "Issue title",
      "severity": 3,
      "evidence": "What you specifically observe in the screenshot",
      "recommendation": "Concrete, actionable fix"
    }
  ]
}

Rules:
- score: 0–100 overall UI/UX quality for onboarding/conversion
- severity: 1 (nit) → 5 (critical conversion blocker)
- Return 3–6 issues ordered by severity descending
- Return exactly 3 quick wins
- Reference specific visual details you see in the screenshots`;

export async function analyzeScreenshots(
  desktop: Buffer,
  mobile: Buffer,
): Promise<AuditReport> {
  const ai = getClient();

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { text: PROMPT },
          { text: "Desktop screenshot (1280×800):" },
          { inlineData: { mimeType: "image/png", data: desktop.toString("base64") } },
          { text: "Mobile screenshot (390×844):" },
          { inlineData: { mimeType: "image/png", data: mobile.toString("base64") } },
          { text: "Return the JSON audit report now." },
        ],
      },
    ],
  });

  const raw = (response.text ?? "").trim();
  // Strip markdown code fences if the model wraps output
  const json = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsed = JSON.parse(json) as Record<string, any>;

  return {
    generatedAt: new Date().toISOString(),
    productGuess: String(parsed.productGuess ?? ""),
    primaryGoal: String(parsed.primaryGoal ?? ""),
    score: Math.min(100, Math.max(0, Number(parsed.score ?? 50))),
    quickWins: Array.isArray(parsed.quickWins)
      ? parsed.quickWins.map(String)
      : [],
    issues: Array.isArray(parsed.issues)
      ? parsed.issues.map((i: Record<string, unknown>) => ({
          title: String(i.title ?? ""),
          severity: (Math.min(5, Math.max(1, Number(i.severity ?? 3))) as AuditIssue["severity"]),
          evidence: String(i.evidence ?? ""),
          recommendation: String(i.recommendation ?? ""),
        }))
      : [],
  };
}
