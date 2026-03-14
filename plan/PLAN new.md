# Competitor Research Agent for Designers (Gemini3) — Hackathon Plan (3 Hours MVP)

## Goal

Build a **multimodal competitor research tool** that helps designers gather design inspiration by analyzing competitors. Users can input either:

- a **feature/idea description** (e.g., "email subscription popup")
- a **website URL** (to analyze a specific product)

The system automatically finds relevant competitors and extracts **design reference cards** that directly inform **vibe coding**:

- **User Flow diagrams** (key steps extracted from screenshots)
- **Design Language** (colors, typography, components, animation vibe)
- **Design Decisions** (why competitors made certain choices)
- **Vibe Keywords** (emotional tone to guide implementation)

The core value is: **designers get all competitor research in 2 minutes**, ready to inform their own design without manual screenshots and Figma organization.

## MVP Scope (Designer-Centric Workflow)

MVP focuses on two input modes with identical output quality:

### Mode 1: Feature Idea → Competitor Discovery
1. User describes a feature idea (text input)
2. Gemini recommends 3 competitor URLs
3. System captures desktop + mobile screenshots (key flow stages)
4. Gemini extracts user flows + design language
5. UI renders 3 competitor reference cards + common patterns

### Mode 2: URL → Direct Analysis
1. User provides a URL to a specific product
2. System captures desktop + mobile screenshots (full flow)
3. Gemini extracts design structure + patterns
4. UI renders design reference card + design decisions

Fallbacks:

- If Playwright screenshot fails (login wall, timeout), allow user to upload 3 screenshots manually
- If competitor search fails, allow user to paste 3 competitor URLs directly

## Product Output (What the Designer Sees)

One clean reference dashboard with **3 competitor cards** + synthesis:

**Each Competitor Card:**
- **Screenshots**: curated flow stages (3-4 key steps in mobile + desktop side-by-side)
- **User Flow Diagram**: visual flow showing key steps and decision points
  ```
  Entry Point → Step 1 → Decision A → Step 2 → Step 3 → Completion
  ```
- **Design Language**:
  - Primary colors (with hex codes if possible)
  - Typography (font family, size, weight)
  - Component patterns ("floating action button", "bottom sheet modal", etc.)
  - Animation vibe (descriptive: "snappy transitions", "immersive fullscreen", etc.)
- **Design Decisions** (Q&A format):
  - Why full-screen editing? → Increases creative freedom, reduces constraint feeling
  - Why hide advanced settings? → Lower barrier to entry, encourage daily usage
- **Vibe Keywords**: 3-5 adjectives capturing emotional tone (e.g., "vibrant, youthful, social, instant")

**Synthesis Section:**
- **Common Patterns**: What all 3 competitors share (e.g., "floating action button for entry", "minimal text")
- **Design Direction**: Recommended approach based on patterns
  - Emotional tone to adopt
  - What to copy (specific patterns)
  - What to avoid (anti-patterns)

## Architecture (Fast + Designer-Focused)

Principle: keep orchestration deterministic; use Gemini for **visual analysis + synthesis**, not tool planning. Every output must be immediately useful for design decisions.

- Frontend: Next.js (App Router) + React + TypeScript + Tailwind
- Backend: Next.js route handlers (Node runtime) as the orchestrator
- Tools (server-side):
  - `captureScreenshot(url, viewport)` using Playwright (desktop + mobile)
  - `extractKeySteps(screenshots, context)` - client-side UI hint for which screenshots matter most
  - `searchCompetitors(query)` via Gemini or web search to get 3 relevant competitor URLs
  - `captureCompetitorScreenshots(urls)` for full flow documentation

Data flow:

1. Frontend submits either:
   - `idea` (text): "email subscription popup"
   - `url` (direct analysis): "https://example.com"
2. Backend executes based on input mode:
   - **Idea mode**: Gemini suggests 3 competitors → capture screenshots for each
   - **URL mode**: Capture screenshots of provided URL → extract design analysis
3. Backend calls Gemini with:
   - user input (idea or URL context)
   - all competitor screenshots (desktop + mobile, key flow stages)
   - strict JSON schema (user flow + design language + decisions)
4. Backend returns structured JSON report
5. Frontend renders competitor reference cards + vibe synthesis

## Prompt + Output Contract (Design Reference Format)

Require Gemini to output strict JSON (no freeform markdown):

For each competitor, extract:

```json
{
  "competitors": [
    {
      "name": "string",
      "url": "string",
      "user_flow": "flowchart description",
      "user_flow_steps": [
        {
          "step": 1,
          "action": "User taps + button",
          "decision_point": false,
          "screenshot_reference": "image_index"
        }
      ],
      "design_language": {
        "colors": [
          {"hex": "#FFFFFF", "usage": "background"},
          {"hex": "#E1306C", "usage": "primary CTA"}
        ],
        "typography": {
          "headline_font": "SF Pro",
          "headline_size": 18,
          "body_font": "SF Pro",
          "body_size": 14
        },
        "components": ["circular avatar", "floating action button", "bottom sheet modal"],
        "animation_vibe": "snappy transitions, immersive fullscreen, energetic"
      },
      "design_decisions": [
        {
          "question": "Why full-screen editing?",
          "answer": "Increases creative freedom, reduces constraint feeling"
        }
      ],
      "vibe_keywords": ["vibrant", "youthful", "social", "instant"]
    }
  ],
  "common_patterns": ["all use floating action button", "all minimize text"],
  "design_direction": {
    "recommended_tone": "friendly, encouraging creativity, instant feedback",
    "what_to_copy": ["FAB entry pattern", "fullscreen edit experience"],
    "what_to_avoid": ["complex forms", "multiple confirmation steps"]
  }
}
```

Rule: every design element must include:

- **What** (the actual design choice)
- **Why** (the underlying intent)
- **How** (visual examples via screenshots)

## 3-Hour Timebox (Execution Plan)

**Phase 1: Core Infrastructure (0:00-0:45)**
- 0:00-0:15: Scaffold Next.js UI shell + input form (idea + URL toggle)
- 0:15-0:45: Implement Playwright screenshot capture (desktop + mobile, key stages only)

**Phase 2: Pipeline (0:45-1:45)**
- 0:45-1:00: Implement competitor discovery (Gemini suggests 3 URLs)
- 1:00-1:30: Capture all competitor screenshots (parallel batch)
- 1:30-1:45: First Gemini call: extract user flows + design language from all screenshots → JSON

**Phase 3: Rendering + Polish (1:45-3:00)**
- 1:45-2:15: Frontend rendering of 3 competitor reference cards
  - Competitor name + screenshots grid
  - User flow diagram (simple visual)
  - Design language card (colors + typography + components)
  - Design decisions Q&A
  - Vibe keywords
- 2:15-2:45: Render synthesis section (common patterns + design direction)
- 2:45-3:00: Demo polish + fallback UX (manual URL input, example case pre-loaded)

## Risks + De-risking (Hard Fallbacks)

- Competitor search fails:
  - fallback: show UI "suggest 3 competitor URLs" with text input form
- Screenshot capture timeout:
  - fallback: ask user to upload 3 key screenshots manually
- Gemini JSON parsing fails:
  - show partial card (whatever parsed correctly) + error message
- URL mode on complex SPA:
  - capture main viewport only, let Gemini work with what’s available

## Demo Script (2 Minutes)

**Scenario 1: Idea Mode**
1. Designer types: "Email subscription popup"
2. System finds 3 competitors automatically (Substack, Beehiiv, Ghost)
3. Show 3 competitor screenshots auto-captured (desktop + mobile)
4. Show user flow diagrams extracted from screenshots
5. Show design language cards (colors, typography, components, animation vibe)
6. Show vibe keywords + common patterns
7. Punchline: "2 minutes to gather competitor research. Now start vibe coding."

**Scenario 2: URL Mode (Backup)**
1. Designer pastes a URL (e.g., their own product)
2. System captures and analyzes the design language
3. Designer can see exactly what design decisions were made
4. Use for: "What did we build?" self-reflection

The punchline: "Competitors research → Design language extraction → Ready for vibe coding. No manual screenshot. No Figma chaos."

## Post-MVP (If Time Remains)

- Add design language comparison (highlight differences between competitors)
- Add interactive flow diagram (click to jump to relevant screenshot)
- Add "export to Figma library" integration (auto-create color + component reference)
- Add "save reference board" for team collaboration

