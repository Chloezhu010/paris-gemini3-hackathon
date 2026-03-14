# Frontend Plan: Onboarding Flow Analyzer

Based on current `AuditApp.tsx` implementation + `PLAN_v2_designer_focused.md`.

---

## What to Keep (Unchanged)

- Severity badge helpers (`severityLabel`, `severityClass`) — perfect as-is
- Error state UI (`bg-red-50` block)
- `submit()` fetch logic — just change the payload shape
- Overall card/panel layout (2-column grid)

---

## What to Change

### 1. Simplify Input Panel

Current: 3-mode switcher (URL / Idea / Screenshot)
New: URL-only. Remove `InputMode` type and mode buttons entirely. One input, one job.

```
[ https://example.com          ] → [ Analyze onboarding flow → ]
  "We'll follow the signup flow automatically."
```

### 2. Replace Static Loading Spinner → Step Progress Indicator

Current: a spinner + one static message.
New: show the agent's live progress through the flow steps. The backend can stream or return step metadata. Even with no streaming, show animated step indicators:

```
● Capturing landing page...
● Finding signup CTA...
● Following auth flow...
○ Analyzing with Gemini...
```

This is the most impactful UX change — it makes the agent feel alive.

### 3. Replace Screenshots Panel → Flow Steps Timeline

Current: `{ desktop, mobile }` side-by-side.
New: a vertical timeline of steps, each with:
- Step name ("Landing page", "Clicked: Get Started", "Sign up page")
- Screenshot thumbnail (click to expand)
- Per-step verdict chip (Good / Needs work / Issue)

```
Step 1: Landing page           [screenshot] → Good: clear hero, visible CTA
Step 2: Clicked "Get Started"  [screenshot] → Issue: redirect takes 3 seconds
Step 3: Sign-up form           [screenshot] → Needs work: 8 required fields
```

### 4. Report Section: Onboarding-Specific Analysis

Current: generic `score + issues[] + quickWins[]`
New: keep the same components but the content changes to be onboarding-focused:

- **Score** → "Onboarding friction score" (lower = more friction)
- **Issues** → already maps perfectly to per-step problems (reuse the issue cards)
- **Quick wins** → already maps to easy fixes (keep as-is)
- **Add** → "Onboarding funnel summary" — 1-paragraph Gemini narrative at the top of the report

---

## State Shape Change

Current:
```ts
screenshots: { desktop: string; mobile: string } | null
report: AuditReport
```

New:
```ts
steps: FlowStep[] | null   // [{ name, screenshotUrl, verdict, notes }]
report: AuditReport         // same shape, content is onboarding-focused
progress: string[]          // for the live step progress indicator
```

New type to add in `src/types/audit.ts`:
```ts
export type FlowStep = {
  name: string;           // "Landing page", "Clicked: Get Started", etc.
  screenshotUrl: string;  // base64 data URL or served path
  verdict: "good" | "needs-work" | "issue";
  notes: string;          // short observation from Gemini
};
```

---

## Component Split

Right now everything is in one 461-line `AuditApp.tsx`. Once step timeline + progress + report all land, split into:

| Component | Responsibility |
|---|---|
| `AuditApp.tsx` | State, form, orchestration only |
| `FlowTimeline.tsx` | Step-by-step screenshot timeline |
| `ProgressSteps.tsx` | Loading state with live step names |
| `ReportPanel.tsx` | Score + issues + quick wins (already extractable) |

---

## Implementation Order

1. **Simplify input** — remove mode switcher, URL-only input (~10 min)
2. **Wire `FlowStep[]` type** into `src/types/audit.ts` and update mock data in `route.ts`
3. **Build `ProgressSteps`** — loading UI with animated step names (most demo-impactful)
4. **Build `FlowTimeline`** — renders step screenshots + per-step verdicts
5. **Update report copy** — change header text to "Onboarding flow analysis"
6. **Wire Playwright** — actually navigate + capture steps (backend)
7. **Wire Gemini** — analyze the step array and return structured JSON
