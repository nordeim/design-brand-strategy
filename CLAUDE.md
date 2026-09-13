---
IMPORTANT: File is read fresh for every conversation. Be brief and practical.
project_type: nextjs
version: 1.0.0
framework_version: "16.3"
last_updated: 2026-09-13
---

# design-brand-strategy

Editorial portfolio website for a designer & brand strategist persona — an original implementation of the reference site's information architecture and design language. Maintained by nordeim; pushed to `git@github.com:nordeim/design-brand-strategy.git`.

**Tech stack**: Next.js 16 (App Router), React 19, TypeScript 5.9 (strict), Tailwind CSS 4 (CSS-first), Vitest 4, Playwright 1.62 (e2e), zod 3, lucide-react. No database. No auth. Five client components total.

## Foundational Principles

### Meticulous Approach (Six-Phase Workflow)

1. **ANALYZE** — Never make surface-level assumptions; mine explicit requirements, implicit needs, and ambiguities before touching code.
2. **PLAN** — Create a structured, sequential execution plan; present it before implementing.
3. **VALIDATE** — Confirm the plan against the codebase (commands exist, types check, patterns match reality) before writing.
4. **IMPLEMENT** — Build in logical, testable components; document alongside code.
5. **VERIFY** — Run `lint → typecheck → test → build → e2e` plus a production smoke test before claiming anything works.
6. **DELIVER** — Hand off with evidence: what was verified, what was deferred, what remains.

### Project-Specific Principles

- **Content lives in `src/data/`, not in markup.** Pages compose from `site.ts` / `projects.ts`; copy edits never touch JSX.
- **The design language is the product.** Cream/ink palette, Instrument Serif + Inter, 12-column grid, generous vertical rhythm — visual changes are architectural changes; make them in tokens (`globals.css`), not ad-hoc classes.
- **Deterministic where hydration can see.** Anything rendered both server- and client-side (character block, marquee sequence) must be derived from pure functions.
- **Motion is a progressive enhancement.** Every animated element has a CSS-level `prefers-reduced-motion` escape hatch; content must never depend on JS firing to become visible in a scrolled viewport.

## Implementation Standards

### Next.js 16 Specific

- App Router conventions only (`src/app/`); no `pages/`.
- Server Components by default; `"use client"` only where interactivity demands it (currently: `site-header`, `theme-toggle`, `reveal`, `estimator`, `contact-form`).
- `next/image` for all raster imagery (build runs with `images.unoptimized: true` — still use the component for layout + lazy-loading).
- `next/font/google` for Instrument Serif + Inter; no external font links (CSP `font-src 'self'`).
- Metadata API + `generateMetadata` on dynamic routes; sitemap and robots from `app/sitemap.ts` / `app/robots.ts`.
- Route handlers (`app/api/*/route.ts`) for API endpoints; no custom server.

### TypeScript Strict Mode

- `strict: true`; never `any` — use `unknown` and narrow.
- Explicit return types on exported functions.
- Domain unions (e.g., `EstimatorServiceId`) typed at the data layer and flowed downstream — no stringly-typed ids crossing module boundaries.
- `readonly` on exported data arrays so accidental mutation fails at compile time.

### Tailwind CSS 4 (CSS-first)

- **No `tailwind.config.js`.** Tokens are CSS custom properties in `globals.css`, exposed to utilities via `@theme inline`.
- Dark mode via `@custom-variant dark (&:where(.dark, .dark *))` — class-based, not media-based.
- Prefer semantic utilities (`bg-background`, `text-muted-foreground`, `border-border`) over raw colors; the palette changes only in `:root` / `.dark`.
- Arbitrary values only for one-off editorial scales (e.g., `text-[clamp(3rem,8vw,6.5rem)]`).

### React 19

- No `forwardRef`; function components + refs as props.
- Forms are controlled via native `<form>` + `FormData`, validated with a shared zod schema — not per-field ad-hoc checks.
- Reading DOM/external state: `useSyncExternalStore` (see `theme-toggle`), never setState-in-effect (ESLint blocks it).

## Development Workflow

### Environment Setup

```bash
bun install            # bun is the package manager; bun.lock is committed
bun run dev            # http://localhost:3000
```

Node ≥ 20 / Bun ≥ 1.1. No database, no migrations, no env required to run locally (only `NEXT_PUBLIC_SITE_URL` affects metadata URLs).

### Build Commands

| Command | Purpose |
|---------|---------|
| `bun run dev` | Development server |
| `bun run build` | Production build (compiles + type-checks + prerenders 20 routes) |
| `bun run start` | Serve production build (`-p <port>` to change) |
| `bun run lint` | ESLint (next/core-web-vitals + react-hooks rules) |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run test` | Vitest unit tests |
| `bun run test:coverage` | Coverage report |
| `bun run e2e` | Playwright e2e — chromium project against the production build |
| `bun run e2e:all` | Both projects (chromium + Pixel-7 mobile emulation) |
| `bun run e2e:report` | Open the Playwright HTML report |

## Testing Strategy

### Test Pyramid

- **Unit (present)**: pure logic — estimator math (`estimator.test.ts`), contact schema + option labels (`contact.test.ts`), data contracts (project aspect alternation, marquee shapes, process/FAQ data, image-path integrity — `src/data/*.test.ts`), sitemap determinism (`src/app/sitemap.test.ts`), and source-reading markup guards for the no-JS reveal fallback and skip link (`src/lib/reveal-guard.test.ts`).
- **Integration/API (pinned in e2e)**: the `POST /api/contact` contract (202 valid / 400 invalid with field errors / 429 over-limit with Retry-After) and route health run inside `e2e/contact.spec.ts` against the managed production webServer.
- **E2E (present — 81 specs)**: Playwright suite in `e2e/` (config adapted from the home-financing reference): `smoke` (critical surfaces + security-header contract + axe critical gates), `seo` (sitemap/robots/title pins/per-case OG), `assets` (data-driven image inventory), `contact` (API contract + form funnel + honeypot), `estimator` (static-group wiring, gated estimate, deep-links), `parity` (no-JS reveal opacity, skip-link keyboard reveal, aspect rhythm, marquee motion contract, theme persistence), `mobile` (hamburger overlay, scroll lock, Escape focus return). Runs `next start` on :3002 — the shipped artifact, never dev HMR.

### Test Commands

```bash
bun run test                      # all unit tests
bunx vitest run estimator         # a single file
bunx vitest run -t "rounds"       # tests matching a name
bun run build && bun run e2e:all  # full e2e (needs a fresh production build)
```

Tests live beside their modules as `*.test.ts`; vitest config resolves `@` → `./src`.

### Writing tests

- Derive numeric expectations from the multiplier tables with the arithmetic written in a comment beside the assertion (see `estimator.test.ts`).
- Test the public API of pure functions; do not test React markup. For markup/CSS contracts that vitest cannot mount (no jsdom), use source-reading tests — see `reveal-guard.test.ts` for the pattern.
- Schema tests must cover: valid baseline, each invalid field, optional-field defaults, trimming, and the field-error flattening contract used by both client and API. Enum label maps must be exhaustiveness-tested against their enums.
- Data-contract tests fail loudly when content is added without required fields (aspect orientation, image files) — extend them when introducing new data invariants.

## Code Quality Standards

### Linting & Formatting

```bash
bun run lint        # must be clean before every commit
bun run typecheck   # must be clean before every commit
```

ESLint flat config (`eslint.config.mjs`) extends `next/core-web-vitals`; the `react-hooks/set-state-in-effect` rule is treated as a hard error.

### Review gates (pre-push)

1. `bun run lint` — zero errors.
2. `bun run typecheck` — zero errors.
3. `bun run test` — all green.
4. `bun run build` — compiles; expected route table appears.
5. Content changes: spot-check the affected route with `curl` or a browser (scroll reveals hide below-fold content in naive full-page screenshots — scroll first).

## Git & Version Control

### Branching

- `main` is the release branch; feature branches as `feat/<topic>`, fixes as `fix/<topic>`; short-lived.
- Remote pushes over SSH (`git@github.com:nordeim/design-brand-strategy.git`).

### Commit Standards

- Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`); atomic commits; body explains why when non-obvious.
- Never commit secrets — `.env*` is ignored; SSH keys live outside the repo (`~/.ssh/`), never in the tree.

## Error Handling & Debugging

### Error Handling Approach

- API routes validate input authoritatively (zod) and return structured errors: `{ ok: false, errors: {field: message} }` with correct status codes (400/429). The client maps these onto the same field-error contract it computes locally.
- Route-level boundaries: `app/error.tsx` (client reset panel), `app/not-found.tsx`, `app/loading.tsx`.
- Fail fast on programmer error: estimator throws `RangeError` on unknown ids (the UI can only emit valid ids).

### Debugging

- `bun run start` + `curl -i localhost:3000/api/health` for server sanity; check response headers for the security set.
- Hydration mismatch? Suspect anything non-deterministic reaching render (the character block and marquee sequence are the canonical deterministic patterns — compare against them).
- Blank sections in screenshots are usually the `Reveal` pattern not firing, not missing DOM — verify with `curl` first, then scroll the page.

## Communication & Documentation

- Explain "why" in commit bodies and ADRs, not "what" (the diff shows what).
- `Project_Architecture_Document.md` is the deep reference (ADRs, security, topology); this file is the working contract; `README.md` is the public face. Update the right one, don't duplicate.

## Project-Specific Standards

### Architecture

Three layers, one direction:

```
src/data     → typed content + estimator config (source of truth)
src/lib      → pure logic (estimator math, zod schemas, char block, rate limit)
src/app + src/components → rendering (Server Components by default)
```

Data flows down; events (form submit, theme toggle, estimator choices) stay in the leaf client components.

### API Design

- `POST /api/contact`: 202 on success (accepted — async semantics), 400 with field errors, 429 with `Retry-After`. Rate limit: 5 / 10 min / IP, in-memory bounded map.
- `GET /api/health`: `{ ok, service, uptimeSeconds }`, `Cache-Control: no-store`.
- No other endpoints; no auth anywhere (public marketing site).

### Data Layer

None, intentionally (see PAD ADR-002). Validated inquiries emit a structured JSON log line — that console.info call is the integration point for email/CRM delivery in production.

### Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadataBase, sitemap, robots | `https://elenavance.com` |

## Anti-Patterns to Avoid

- Hard-coding copy in JSX instead of `src/data/`.
- `Math.random()`, `Date.now()`, or `new Date()` in component render paths (breaks SSG determinism; `SiteFooter` computes year at render on the server only — acceptable, but extend cautiously).
- Adding a state library for the estimator's four selections — it is leaf-local `useState`.
- Replacing CSS reduced-motion guards with JS checks.
- "Tightening" CSP without testing hydration in a browser first.
