# AGENTS.md

Editorial portfolio site (Elena Vance — Designer & Brand Strategist). Next.js 16 App Router + React 19 + Tailwind CSS 4 + TypeScript strict. **No database, no auth, no client state library** — a mostly-static marketing site with two API routes.

## Commands

| Command | Purpose |
|---------|---------|
| `bun install` | Install dependencies (bun.lock is the lockfile — do not switch to npm/yarn) |
| `bun run dev` | Dev server on :3000 |
| `bun run build` | Production build (also type-checks) |
| `bun run start` | Serve the production build |
| `bun run test` | Vitest unit tests (`src/**/*.test.ts`) |
| `bun run lint` | ESLint (flat config, next/core-web-vitals) |
| `bun run typecheck` | `tsc --noEmit` |

Verification order before pushing: `lint → typecheck → test → build`. All four are green as of the initial commit; keep them that way.

## Architecture facts an agent would guess wrong

- **Content is data, not markup.** Nearly all copy lives in `src/data/site.ts` (persona, services, estimator config, process steps, FAQ, awards) and `src/data/projects.ts` (8 case studies + marquee items). Edit content there; pages compose from it.
- **Image orientation is data too.** `Project.coverAspect` (`landscape|portrait`) and `details[].aspect` (`wide|landscape|portrait`) drive the render classes (`aspect-[8/5]`, `aspect-[3/4]`, `aspect-[7/3]`) and the marquee shapes; tests pin the alternation and file-existence invariants. Portrait artwork files carry `-portrait` in the name; assets are WebP.
- **Tailwind v4, CSS-first.** There is NO `tailwind.config.js`. Design tokens are CSS variables in `src/app/globals.css` mapped through `@theme inline`. Change colors there, nowhere else.
- **Dark mode is class-based** (`@custom-variant dark (&:where(.dark, .dark *))`), set pre-hydration by an inline script in `src/app/layout.tsx`, toggled by `ThemeToggle` via `useSyncExternalStore` + `MutationObserver` on `<html>`'s class. Do not introduce `next-themes`.
- **Only 5 files are client components** (`"use client"`): `site-header`, `theme-toggle`, `reveal`, `estimator`, `contact-form`. Everything else is a Server Component. Keep it that way — the estimator/form need interactivity, pages don't.
- **`/work/[slug]` is SSG** via `generateStaticParams` over `PROJECTS`; adding a project = adding an object to `src/data/projects.ts`. `/contact` is dynamic because it reads `searchParams` (`?service=<id>` preselects the estimator).
- **Hydration-sensitive code:** the collage character block (`src/lib/char-block.ts`) is a deterministic seeded LCG — never replace it with `Math.random()`. Scroll reveals (`Reveal`) start `opacity-0` and depend on `IntersectionObserver`; `prefers-reduced-motion` AND scripting-disabled are handled **in CSS only** (globals.css forces `[data-reveal]` visible via `html:not(.js)` + `@media (scripting: none)`; the boot script adds the `js` class). Source-reading tests pin these guards.
- **`next.config.ts` sets `images.unoptimized: true`** deliberately (portable builds without sharp) — use `next/image` anyway for layout/lazy-loading benefits. Assets are committed as pre-encoded WebP.
- **Security headers (CSP, HSTS, X-Frame-Options, …) are emitted by the app** in `next.config.ts`. CSP allows `'unsafe-inline'` for scripts/styles because Next's RSC payload and `next/font` require it — don't "tighten" this without testing hydration.
- **ESLint enforces `react-hooks/set-state-in-effect`** — sync setState in effects fails lint. The theme toggle is the reference pattern for reading DOM state legally.

## API contract

- `POST /api/contact` — zod-validated (shared schema `src/lib/contact.ts`), rate-limited 5 req / 10 min / IP, honeypot field `website` handled client-side. Returns `202` (no persistence — structured log is the delivery integration point; see README).
- `GET /api/health` — liveness probe.

## Gotchas

- Unit tests import config from `@/data/site` — the estimator test derives expectations from the multiplier tables, so changing a multiplier requires re-checking `estimator.test.ts` (comments carry the arithmetic). Data-contract tests (`src/data/*.test.ts`) will fail if you add a project without an aspect field or a non-existent image path — that is their job.
- Remote is `git@github.com:nordeim/design-brand-strategy.git` (SSH). The first commit on `main` is the repo owner's prompt stub (`docs/prompt-to-create.md`) — do not delete it.
- `.env.example` documents the single env var: `NEXT_PUBLIC_SITE_URL` (metadataBase, sitemap, robots).
