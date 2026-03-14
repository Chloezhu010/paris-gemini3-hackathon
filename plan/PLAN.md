# UI/UX Audit Agent (Gemini3) — Hackathon Plan (5 Hours MVP)

## Goal

Build a **multimodal UI/UX audit agent** that takes one of:

- a user website **URL**
- an **uploaded screenshot**
- an **idea / product description** (fallback mode)

and returns a **structured, actionable UI/UX report** with:

- prioritized issues (severity, evidence, impact, effort)
- competitor research (3 comps) and pattern extraction
- concrete improvements (copy rewrites, layout guidance, design tokens)
- at least one **copy-pasteable** UI snippet (e.g. redesigned hero section)

The core value is: **fast, specific, and directly usable** recommendations for what the user built.

## MVP Scope (Do One Strong Vertical Slice)

MVP focuses on a single best path:

1. URL input
2. system captures desktop + mobile screenshots
3. Gemini analyzes and produces a JSON report
4. system finds 3 competitors, captures their screenshots
5. Gemini compares and extracts patterns + recommendations
6. UI renders a clean scorecard + top issues + quick wins + examples

Fallbacks:

- If URL capture fails (login wall, timeout), switch to screenshot upload mode.
- If competitor search fails, allow the user to paste 3 competitor URLs.

## Product Output (What the User Sees)

One report page:

- **Scorecard**: hierarchy, usability, conversion, trust, consistency, accessibility (simple 0-100 + 5 sub-scores)
- **Top 5 Issues**:
  - severity (1-5), evidence (what we see), impact (why it matters), fix (what to change), effort (S/M/L)
- **Competitor Patterns** (3 competitors):
  - common patterns and why they work
  - what the user is missing and what to add next
- **Direct Artifacts**:
  - hero headline/subcopy/CTA rewrites (3 variants)
  - information architecture suggestions
  - design tokens (type scale, spacing scale, color palette, button styles)
  - one revised hero section snippet (HTML/Tailwind) for demo impact

## Architecture (Fast + Demoable)

Principle: keep orchestration deterministic; use Gemini for **understanding + synthesis**, not for planning the entire tool chain.

- Frontend: Next.js (App Router) + React + TypeScript + Tailwind
- Backend: Next.js route handlers (Node runtime) as the orchestrator
- Tools (server-side):
  - `captureScreenshot(url, viewport)` using Playwright
  - `runLighthouse(url)` (optional) for objective baseline numbers
  - `searchCompetitors(query)` to get 3 competitor URLs
  - `captureCompetitorScreenshots(urls)` for side-by-side comparison

Data flow:

1. Frontend submits `URL | idea | screenshot`
2. Backend runs tool pipeline (screenshots + optional lighthouse + competitor URLs)
3. Backend calls Gemini with:
  - user input
  - user screenshots (and competitor screenshots)
  - optional objective metrics
  - a strict JSON schema
4. Backend returns JSON report
5. Frontend renders report with stable components

## Prompt + Output Contract (Make It Renderable)

Require Gemini to output strict JSON (no freeform markdown in MVP):

- `product_guess`, `primary_goal`, `audience_guess`
- `scorecard` with sub-scores and 1-sentence rationale each
- `issues[]`: `{title, severity, evidence, impact, recommendation, effort, example_copy?, example_layout?}`
- `competitors[]`: `{name, url, observed_patterns[], why_it_works}`
- `action_plan[]`: grouped by "today / this week / design system"
- `design_tokens`: `{font_pairing, color_palette, spacing_scale, button_styles}`

Rule: every recommendation must include:

- **Why** (impact)
- **What to change** (action)
- **How** (a concrete example: copy rewrite, layout change, token)

## 5-Hour Timebox (Execution Plan)

1. 0:00-0:30
   - Scaffold Next.js UI shell and report renderer
   - URL input happy path, loading/error states
2. 0:30-1:30
   - Implement Playwright screenshot capture (desktop + mobile)
   - Basic retries + timeouts
3. 1:30-2:30
   - First Gemini call: screenshot + minimal context -> JSON report
   - Render scorecard + top issues reliably
4. 2:30-3:30
   - Competitor discovery (search -> 3 URLs)
   - Capture competitor screenshots
5. 3:30-4:30
   - Second Gemini step: compare against competitors
   - Generate "hero rewrite + CTA variants + tokens + snippet"
6. 4:30-5:00
   - Polish demo experience: caching, empty states, example case, export to Markdown
   - Prepare 2-minute demo script

## Risks + De-risking (Hard Fallbacks)

- Search API/key issues:
  - fallback to "Gemini suggests competitor names" + user pastes 3 URLs
- URL capture fails:
  - screenshot upload mode continues the audit
- Lighthouse install/runtime issues:
  - omit lighthouse; screenshots + structured report still sell the product
- Model output shape drifts:
  - enforce JSON schema, validate server-side, show partial results instead of failing hard

## Demo Script (2 Minutes)

1. Paste a URL, click "Generate"
2. Show desktop + mobile screenshots captured automatically
3. Show scorecard + top 3 issues with evidence + impact + fix
4. Show competitor comparison: 3 thumbnails + 3 shared patterns
5. Show "copy-paste artifacts": hero rewrite + CTA variants + a revised hero snippet

The punchline: "It doesn’t just critique, it gives you the next version you can ship."

## Post-MVP (If Time Remains)

- Add a "regenerate" with targeted constraints (e.g. B2B vs B2C, premium vs playful)
- Add accessibility checks (contrast, tap targets) and output fixes
- Add a "download report" and "create GitHub issue checklist" export

