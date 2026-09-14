# AGENTS.md

Editorial portfolio site (Elena Vance — Designer & Brand Strategist). Next.js 16 App Router + React 19 + Tailwind CSS 4 + TypeScript strict + Prisma SQLite (ADR-011). **No auth, no client state library** — a mostly-static marketing site with two API routes and a single `ContactInquiry` table.

## Commands

| Command | Purpose |
|---------|---------|
| `bun install` | Install dependencies (bun.lock is the lockfile — do not switch to npm/yarn) |
| `bun run dev` | Dev server on :3000 |
| `bun run build` | Production build (also type-checks) |
| `bun run start` | Serve the production build |
| `bun run test` | Vitest unit tests (`src/**/*.test.ts`) |
| `bun run e2e` | Playwright e2e — chromium project against the production build (needs `bun run build` first) |
| `bun run e2e:all` | Both projects (chromium + Pixel-7 mobile emulation) — 83 specs total |
| `bun run e2e:report` | Open the Playwright HTML report |
| `bun run lint` | ESLint (flat config, next/core-web-vitals) |
| `bun run typecheck` | `tsc --noEmit` — strict; covers `e2e/` specs and `scripts/` (tsconfig excludes only `node_modules` + `skills`) |
| `bun run db:generate` | Generate Prisma Client (run after `prisma/schema.prisma` changes) |
| `bun run db:push` | Push schema to `db/custom.db` (wrapper via `scripts/db.ts` + shared `src/lib/wcc/db-url.ts` resolver) |

Verification order before pushing: `cp .env.example .env → db:generate → db:push → lint → typecheck → test → build → e2e`. All six are green; keep them that way. CI (`.github/workflows/verify-gate.yml`) runs the same gate on every push.

## Architecture facts an agent would guess wrong

- **Content is data, not markup.** Nearly all copy lives in `src/data/site.ts` (persona, services, estimator config, process steps, FAQ, awards) and `src/data/projects.ts` (8 case studies + marquee items). Edit content there; pages compose from it.
- **Image orientation is data too.** `Project.coverAspect` (`landscape|portrait`) and `details[].aspect` (`wide|landscape|portrait`) drive the render classes (`aspect-[8/5]`, `aspect-[4/5]`, `aspect-[7/3]`) and the marquee shapes; tests pin the alternation and file-existence invariants. Every case study hero renders a uniform `aspect-[7/3]` wide banner regardless of cover aspect (source-measured parity). Portrait artwork files carry `-portrait` in the name; assets are WebP.
- **Tailwind v4, CSS-first.** There is NO `tailwind.config.js`. Design tokens are CSS variables in `src/app/globals.css` mapped through `@theme inline`. Change colors there, nowhere else.
- **Dark mode is class-based** (`@custom-variant dark (&:where(.dark, .dark *))`), set pre-hydration by an inline script in `src/app/layout.tsx`, toggled by `ThemeToggle` via `useSyncExternalStore` + `MutationObserver` on `<html>`'s class. Do not introduce `next-themes`.
- **Only 5 files are client components** (`"use client"`): `site-header`, `theme-toggle`, `reveal`, `estimator`, `contact-form`. Everything else is a Server Component. Keep it that way — the estimator/form need interactivity, pages don't.
- **`/work/[slug]` is SSG** via `generateStaticParams` over `PROJECTS` with `dynamicParams = false` — unknown slugs hard-404 at the router (never a 200 shell; ADR-012). Adding a project = adding an object to `src/data/projects.ts`. `/contact` is dynamic because it reads `searchParams` (`?service=<id>` preselects the estimator).
- **The estimator is a static four-group form, not a wizard** (pass-2 parity redesign): all four numbered groups (`Project type / Business stage / Timeline / Deliverables`) render simultaneously; the estimate is gated ("Complete all selections…") until every group has a selection; `?service=<id>` preselects only the service group. Timeline labels carry durations ("Standard (8-12 weeks)"); the referral field is a select. e2e specs in `e2e/estimator.spec.ts` pin all of this.
- **Hydration-sensitive code:** the collage character block (`src/lib/char-block.ts`) is a deterministic seeded LCG — never replace it with `Math.random()`. Scroll reveals (`Reveal`) start `opacity-0` and depend on `IntersectionObserver`; `prefers-reduced-motion` AND scripting-disabled are handled **in CSS only** (globals.css forces `[data-reveal]` visible via `html:not(.js)` + `@media (scripting: none)`; the boot script adds the `js` class). Source-reading tests pin these guards.
- **There is deliberately NO root `app/loading.tsx`** (ADR-012): a root loading boundary splits the HTML stream into shell-then-content; Chrome paints the partial shell during delivery gaps and the footer jumps ~5400px (measured cold-load CLS 0.31 on the live deploy) — and streamed `notFound()` renders inside a 200 response. The e2e stream-order guard in `smoke.spec.ts` pins the document-order contract; `scripts/cls-regression.mjs` is the gap-proxy harness.
- **`next.config.ts` sets `images.unoptimized: true`** deliberately (portable builds without sharp) — use `next/image` anyway for layout/lazy-loading benefits. Assets are committed as pre-encoded WebP.
- **Security headers (CSP, HSTS, X-Frame-Options, …) are emitted by the app** in `next.config.ts`. CSP allows `'unsafe-inline'` for scripts/styles because Next's RSC payload and `next/font` require it — don't "tighten" this without testing hydration. `script-src` also allows `https://static.cloudflareinsights.com` because the deployment host (Cloudflare) injects its Web Analytics beacon; without the allowance the beacon is CSP-blocked on every page.
- **ESLint enforces `react-hooks/set-state-in-effect`** — sync setState in effects fails lint. The theme toggle is the reference pattern for reading DOM state legally.

## API contract

- `POST /api/contact` — zod-validated (shared schema `src/lib/contact.ts`), rate-limited 5 req / 10 min / IP, honeypot field `website` handled client-side, persisted to `ContactInquiry` via Prisma SQLite (fail-open: DB error still returns `202` and logs `contact_inquiry_db_failed`). Returns `202` (structured log remains the delivery integration point; see README + ADR-011).
- `GET /api/health` — liveness probe.

## Gotchas

- Unit tests import config from `@/data/site` — the estimator test derives expectations from the multiplier tables, so changing a multiplier requires re-checking `estimator.test.ts` (comments carry the arithmetic). Data-contract tests (`src/data/*.test.ts`) will fail if you add a project without an aspect field or a non-existent image path — that is their job.
- **Remote is `https://github.com/nordeim/design-brand-strategy.git` (SSH alias `git@github.com:nordeim/design-brand-strategy.git` also valid; pushes use `docs/ssh_git_wrapper_v3.py` — see `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`). The first commit on `main` is the repo owner's prompt stub (`docs/prompt-to-create.md`) — do not delete it.
- `.env.example` documents `DATABASE_URL` (SQLite `file:../db/custom.db`, resolved via `src/lib/wcc/db-url.ts` for CLI/runtime/standalone) + `NEXT_PUBLIC_SITE_URL` (metadataBase, sitemap, robots) + optional Playwright `E2E_PORT` / `E2E_BASE_URL`. The DB file `db/custom.db` is gitignored (PII) — it was force-committed once and untracked in remediation pass 3; keep it out. `.env` and `package-lock.json` are also gitignored (bun.lock is canonical).

## Playwright e2e suite

`playwright.config.ts` (adapted from the home-financing reference) runs a managed `next start` webServer on :3002 against the production build — never dev HMR. Projects: `chromium` (Desktop Chrome, `testIgnore: mobile.spec.ts`) and `mobile` (Pixel 7 emulation, `testMatch: mobile.spec.ts` — the hamburger-overlay fork). Serial workers: contact-API tests mutate shared in-memory rate-limit state; tests spoof unique `x-forwarded-for` values to stay isolated — **on self-managed origins only** (P4-F1): when the suite runs against an edge-fronted external server (`E2E_BASE_URL`, e.g. the live Cloudflare deploy), AUD-1 keying (`cf-connecting-ip` first) makes spoofing ineffective from one machine, so the isolation-dependent contact specs classify the observed statuses (`classifyBurstStatuses` in `src/lib/rate-limit.ts`, unit-tested) and **skip loudly with evidence** instead of failing; the local run remains the authoritative contract check. `@playwright/test` resolves to 1.63.0 (Chromium 153; bun.lock locks it — keep playwright-core deduped at one copy, see remediation pass 3). Specs import `src/data/*` / `src/lib/*` directly for data-driven assertions (slugs, images, titles, burst classification) — the data layer is the single source of truth for both the site and its tests. Note: with `javaScriptEnabled: false`, Playwright locators cannot resolve (no injected script) — no-JS specs assert through `page.evaluate` instead. Deploy-state (as opposed to code-contract) checks live in `scripts/live-deploy-audit.mjs` (health, headers, hard-404, robots, email-obfuscation, cold-load CLS against a running deployment).
