# AI Engineering Rules (Next.js/React) — Non‑Negotiables

This repo is a multimodal UI/UX audit agent built with **Next.js (App Router) + React + TypeScript**.

These rules are written for AI coding agents. If a tradeoff is needed, prefer **shipping a stable, demoable vertical slice** over scope creep, while keeping the codebase maintainable.

## 0) Golden Rules

- Keep changes **small, reviewable, and reversible**.
- Prefer **simple, explicit code** over clever abstractions.
- Avoid breaking changes to public contracts (API routes, types, env vars) unless required.
- Don’t introduce new dependencies unless they unlock a critical capability.

## 1) Repo Structure (Max 3 Levels)

**Default limit**: file paths must not exceed **3 directory levels** from the repo root.

Allowed exceptions:
- `src/app/**` may exceed 3 levels **only because route segments can be nested**.
- No other directory tree may exceed 3 levels without a strong reason.

### Canonical Layout

- `src/app/` Next.js routes, layouts, route handlers
- `src/components/` UI components (pure view)
- `src/lib/` shared utilities + domain logic (pure, testable)
- `src/server/` server-only orchestration (Gemini calls, scraping, tool runners)
- `src/styles/` global styles / tokens (if not using Tailwind exclusively)
- `src/types/` shared TypeScript types

Rules:
- Avoid “misc” folders. Name by responsibility.
- No barrel exports (`index.ts`) by default; import directly to reduce bundle risk.

## 2) Module Boundaries (Separation of Concerns)

Keep a strict layering:

- **UI layer**: `src/components/**`, `src/app/**` (rendering only)
  - No direct network calls to third-party APIs from client components.
  - No business logic beyond formatting, conditional rendering, and wiring.
- **Domain layer**: `src/lib/**`
  - Pure functions, schema validation, scoring logic, report shaping.
  - Must not depend on Next.js runtime APIs.
- **Adapters / Tools**: `src/server/**`
  - Gemini client, screenshot capture, search, Lighthouse, storage.
  - All side effects live here.

Enforce boundaries:
- UI imports from `lib` are allowed; UI importing from `server` is not allowed.
- `server` can import from `lib`; `lib` must never import from `server`.

## 3) Next.js / React Performance Rules (Vercel-aligned)

Non-negotiables for App Router:

- Prefer **Server Components**; add `"use client"` only when required.
- Keep Client Components small: push heavy logic to server or `lib`.
- Avoid async waterfalls:
  - Start independent promises early; `await` late.
  - Use `Promise.all()` for independent work.
- Minimize data sent to the client:
  - Don’t pass large objects through props to Client Components.
- Bundle hygiene:
  - Avoid barrel imports; import the exact file you need.
  - Dynamically import heavy components (`next/dynamic`) and defer non-critical UI.
  - Defer third-party scripts until after hydration when possible.
- Rendering:
  - For non-urgent UI state changes, prefer `startTransition`.
  - Don’t memoize trivial values; only memoize when it’s measurable and expensive.

## 4) API & Runtime Rules

- Route handlers must be deterministic and typed.
- Server-only capabilities (Playwright/Lighthouse) require `runtime = "nodejs"` for the route.
- Every API route must have:
  - Input validation (e.g. `zod`)
  - Timeouts / cancellation where possible
  - Clear error shape (no raw stack traces to clients)

## 5) TypeScript, Style, and Code Hygiene

- TypeScript only. No `any` unless there is no alternative (document why).
- Each file should stay focused; if it grows too large, split by responsibility.
- Avoid global singletons unless explicitly necessary (use `React.cache()` or scoped caches server-side).
- Use consistent naming:
  - Components: `PascalCase`
  - Functions/vars: `camelCase`
  - Types: `PascalCase` (`AuditReport`, `CompetitorFinding`)

## 6) Git Workflow (Atomic Commits)

keep commits clean:

- **Atomic commits**: one logical change per commit (no drive-by refactors).
- Commit messages: `feat:`, `fix:`, `chore:`, `docs:` prefixes.
- If a refactor is needed to enable a feature, split into:
  - `chore/refactor` commit first
  - `feat` commit second

## 7) Secrets, Privacy, and Logging

- Never commit secrets. Use `.env.local` and document keys in `.env.example`.
- Don’t log full screenshots, raw HTML, or user-provided URLs in production logs.
- Store only what is needed for the demo; add deletion/expiry if storing artifacts.

## 8) Definition of Done (Per Feature)

- Works end-to-end for at least one happy path.
- Has at least one basic error path (timeout/invalid URL) handled.
- Types compile; lint passes if configured.
- UI is demo-ready: loading, success, and failure states are visible.

