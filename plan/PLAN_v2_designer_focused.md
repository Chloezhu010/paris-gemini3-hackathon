# URL UI/UX Audit Agent (Designer‑Focused, Gemini3) — Hackathon Plan (3 Hours MVP)

## Goal

Build a **URL‑only UI/UX audit tool** that helps designers quickly understand what’s working, what’s broken, and what to ship next on a landing/onboarding page.

Users paste a **website URL**. The system captures **desktop + mobile screenshots** and returns a **structured, renderable report** that directly informs iteration and “vibe coding”:

- **Top issues** (severity + evidence + concrete fix)
- **Quick wins** (exactly 3)
- **Design language cues** (colors/typography/components/vibe keywords — optional stretch)

The core value is: **2 minutes from URL → actionable design fixes**, no manual screenshots or note‑taking.

## MVP Scope (URL‑Only Workflow)

MVP focuses on a single happy path:

1. User provides a URL to a specific product
2. System captures desktop + mobile screenshots (full flow)
3. Gemini produces a strict JSON audit report
4. UI renders screenshots + score + issues + quick wins

Fallbacks:

- If Playwright screenshot fails (login wall, timeout), show a clear error and allow retry with a different URL (screenshot upload is post‑MVP).
- If Gemini JSON parsing fails, show a recoverable error state and allow “Regenerate”.

## Product Output (What the Designer Sees)

One clean report dashboard:

- **Screenshots**: desktop + mobile side‑by‑side
- **Score + Context**: product guess + primary goal + overall score (0–100)
- **Top Issues (3–6)**: ordered by severity
  - severity (1–5), evidence (what we see), recommendation (what to change)
- **Quick Wins (exactly 3)**: immediate edits the team can ship today
- **Optional (stretch)**: Design language card for “vibe coding”
  - colors (hex + usage), typography (headline/body), component patterns, vibe keywords

## Architecture (Fast + URL‑Only)

Principle: keep orchestration deterministic; use Gemini for **visual analysis + synthesis**, not tool planning. Every output must be renderable and stable.

- Frontend: Next.js (App Router) + React + TypeScript + Tailwind
- Backend: Next.js route handlers (Node runtime) as the orchestrator
- Tools (server-side):
  - `captureScreenshot(url, viewport)` using Playwright (desktop + mobile)
  - `analyzeScreenshots(desktop, mobile)` via Gemini with strict JSON schema

Data flow:

1. Frontend submits `url`
2. Backend captures desktop + mobile screenshots
3. Backend calls Gemini with both screenshots + strict JSON schema
4. Backend returns structured JSON
5. Frontend renders the audit report + screenshots

## Prompt + Output Contract (Renderable Audit JSON)

Require Gemini to output strict JSON (no freeform markdown):

```json
{
  "productGuess": "string",
  "primaryGoal": "string",
  "score": 74,
  "quickWins": ["string", "string", "string"],
  "issues": [
    {
      "title": "string",
      "severity": 3,
      "evidence": "string",
      "recommendation": "string"
    }
  ]
}
```

Rules:

- Return 3–6 issues ordered by severity descending
- Return exactly 3 quick wins
- Evidence must reference specific visual details from the screenshots
- Keep recommendations concrete (copy changes, layout adjustments, hierarchy, trust signals, accessibility basics)

## 3-Hour Timebox (Execution Plan)

**Phase 1: UI Shell (0:00-0:30)**
- URL input + submit
- Loading / error / success states
- Report renderer skeleton

**Phase 2: Screenshot Capture (0:30-1:30)**
- Playwright capture: desktop + mobile
- Timeouts + basic retry + deterministic error handling

**Phase 3: Gemini + Rendering (1:30-2:30)**
- Gemini call with strict JSON schema
- Server-side validation and safe parsing
- Render score + issues + quick wins + screenshots

**Phase 4: Demo Polish (2:30-3:00)**
- Caching (optional)
- Example URL prefill
- “Regenerate” button + better error copy

## Risks + De-risking (Hard Fallbacks)

- Screenshot capture timeout:
  - fallback: clear error + allow retry (screenshot upload post‑MVP)
- Gemini JSON parsing fails:
  - fallback: show error + allow regenerate; keep raw text only for dev debugging (avoid logging user data)
- URL mode on complex SPA:
  - capture main viewport only; avoid trying to click through flows in MVP

## Demo Script (2 Minutes)

1. Paste a URL → Generate
2. Show desktop + mobile screenshots captured automatically
3. Show score + top 3 issues (evidence + fix)
4. Show quick wins as a checklist
5. Punchline: “URL → screenshots → actionable fixes in 2 minutes.”

## Post-MVP (If Time Remains)

- Add screenshot upload fallback
- Add “design language” extraction as a dedicated card (colors/typography/components/vibe keywords)
- Add exports (Markdown / checklist)
- Re-introduce competitor comparison (optional, after URL-only MVP is solid)
