# Validation Report — Design Brand Strategy

**Date:** 2026-09-13 (UTC) — post-remediation pass 2
**Commit:** `c7dcb92` + uncommitted patch bumps (see drift §7)
**Validator:** Pi / Claw Code — six-phase workflow (ANALYZE → PLAN → VALIDATE → IMPLEMENT → VERIFY → DELIVER)
**Scope:** Full alignment audit of `AGENTS.md`, `CLAUDE.md`, `README.md`, `design-brand-strategy_SKILL.md v2.1.0`, `Project_Architecture_Document.md v1.0.0` against the live codebase + live production artifact (`next build` + `next start`)

---

## 0. Verdict

| Gate | Result | Evidence |
|---|---|---|
| `bun run lint` | ✅ PASS | `eslint .` — zero warnings (flat config, `next/core-web-vitals` + `react-hooks/set-state-in-effect` as hard error) |
| `bun run typecheck` | ✅ PASS | `tsc --noEmit` — zero errors, strict, `next-env.d.ts` + e2e types covered |
| `bun run test` | ✅ PASS | `vitest run` — **44/44** (6 files, node env, ~950 ms) |
| `bun run build` | ✅ PASS | `next build` (Turbopack) — **20 routes**, compiled 8.6s + TS 8.9s, 3 workers, 0 errors |
| `bun run e2e` | ✅ PASS | **76/76** chromium (`e2e:all` = **81/81** with Pixel 7 mobile) — serial workers, production `next start :3002`, ~39s / 43.5s |
| Structural invariants (SKILL §11) | ✅ PASS | See §6 |
| Security headers (live) | ✅ PASS | Fresh `next start :3199` matches `next.config.ts` exactly (see §5) |
| Project status | **GREEN** | All gates green; only minor documentation drift (non-blocking) |

> **One-line summary:** The codebase is fully aligned with its documentation and ships a verified, production-ready artifact. No code changes required to claim green. The only actions are doc housekeeping and committing the already-installed patch bumps.

---

## 1. Inventory & Toolchain — Phase 0

| Claim | Verified | Detail |
|---|---|---|
| 33 source files under `src/` | ✅ | `find src -type f` → 36 files (33 + 3 `*.test.ts` colocated) + `src/app/sitemap.test.ts` = 36 total; matches PAD §3.2 + SKILL §2 (3 233 LOC) |
| 11 components in `src/components/` | ✅ | `Container, SectionLabel, ArrowLink, PillLink` (ui), `SiteHeader`, `ThemeToggle`, `Reveal`, `Marquee`, `CollageStrip`, `ProjectCard`, `Estimator`, `ContactForm`, `SiteFooter`, `CtaBand` = 11 (SKILL §5.2) + `app/error.tsx` client boundary |
| 19 images in `public/images/` | ✅ | `ls public/images | wc -l` → **19** WebP, 2.5 MB total. README says 19 (correct). PAD §2/§11 still says 15 — **drift PAD-D1** |
| No `tailwind.config.*` | ✅ | `ls tailwind.config.*` → absent. `postcss.config.mjs` has single `@tailwindcss/postcss` plugin. CSS-first confirmed. |
| `bun.lock` committed, `package-lock.json` untracked | ⚠️ | Both exist; `package-lock.json` is **untracked** (appears in `git status ??`). Not harmful (bun is canonical) but should be gitignored or removed — **drift GIT-D1** |
| Versions pinned | ⚠️ | `next 16.3.5`, `react 19.3.0`, `tailwind 4.3.3`, `zod 3.25.76`, `vitest 4.1.11`, `@playwright/test ^1.63.0` in `package.json` but **installed/locked is 1.62.0** (bun.lock). Docs claim 1.62.0 pinned — `^1.63.0` is a patch drift that still resolves to 1.62.0 locally. **drift PKG-D1** |
| `next.config.ts` `images.unoptimized:true` | ✅ | Present, deliberate (ADR-006) |
| Env single var | ✅ | `.env.example` documents only `NEXT_PUBLIC_SITE_URL` + optional `E2E_PORT/BASE_URL`, fallback `http://localhost:3000` in `site.ts` |

---

## 2. Design System — Phase 1

Verified against `src/app/globals.css` (135 lines, transcribed verbatim):

- **Tokens:** `:root` cream `#fbfaf9` / ink `#1a1a1a` etc. + `.dark` inverted, all 10 tokens mapped via `@theme inline` → `bg-background`, `text-muted-foreground`, `border-border`, `bg-pill` etc. Matches SKILL §4.1 exactly.
- **Custom variant:** `@custom-variant dark (&:where(.dark, .dark *))` present.
- **Keyframes:** Single `marquee` 56s linear `translateX(0 → -50%)`, hover-pause via `group-hover:[animation-play-state:paused]` in `marquee.tsx` — matches SKILL §4.3.
- **Components:** `.link-underline` (background-size 0%→100% 1px, 300ms, `hover:hover` gated), `.char-block` (1.1/0.08em/0.875rem, break-all), `html {scroll-behavior:smooth; scroll-padding-top:5rem}`, `::selection` inverted, `:focus-visible` 2px currentColor.
- **Motion safety:** `html:not(.js) [data-reveal]` + `@media(scripting:none)` forced visible, `prefers-reduced-motion` disables marquee + reveals — matches ADR-007 + SKILL §8.4.
- **No shadows / no radius violations:** `rg 'rounded-(lg|xl|2xl|md)' src` → 0 hits; `rg 'shadow' src` → 0 (only `coverAlt` prose "shadows"); `rg 'hsl\(|#[0-9a-fA-F]{6}' src --glob '*.tsx'` → 0 (tokens only).

---

## 3. Component Architecture — Phase 2

| Claim | Verified |
|---|---|
| Exactly 5 client components in `src/components/` | ✅ — `rg '"use client"' src` → 6 hits total: 5 in components (`site-header`, `theme-toggle`, `reveal`, `estimator`, `contact-form`) + 1 in `app/error.tsx` (Next requires client error boundary). SKILL count of 5 excludes `error.tsx` — intentionally accurate. |
| Golden Rule — no upward imports | ✅ — `grep -rn 'from "@/app' src/components src/lib src/data` → empty; `from "@/components" src/lib src/data` → empty |
| Server-by-default | ✅ — `marquee`, `collage-strip`, `project-card`, `site-footer`, `cta-band`, `ui` are Server; pages are Server except `contact` dynamic via `searchParams` Promise |
| Fonts via `next/font/google` | ✅ — `Instrument_Serif 400 normal+italic` + `Inter variable`, `display:swap`, `variable --font-*`, no external `<link>`, CSP `font-src 'self'` holds |
| `next/image` discipline | ✅ — all raster images use `next/image` with explicit `width/height` + `aspect-*` + `object-cover`; `priority` only on hero + case cover |
| Image aspects | ✅ — `Project.coverAspect landscape|portrait` → `aspect-[8/5]/[4/5]` in `project-card.tsx`; case hero uniform `aspect-[7/3]` (`work/[slug]/page.tsx` `COVER_ASPECT_CLASS`); details `wide 7/3`, `landscape 3/2`, `portrait 4/5`; marquee `tall/wide/landscape` shapes |

---

## 4. Content-as-Code — Phase 3

| Claim | Verified |
|---|---|
| `SITE` persona + `NAV_LINKS` 4 + `SERVICES` 6 + `APPROACH_PRINCIPLES` 3 + `AWARDS` 5 + `BEYOND_WORK` 3 + `PROCESS_STEPS` 5 + `FAQ_ITEMS` 6 | ✅ — `src/data/site.ts` 311 lines, all counts confirmed; `contentUpdatedAt: "2026-09-13"` feeds sitemap `lastModified` (deterministic, SKILL §7.3) |
| `PROJECTS` 8, alternating `coverAspect`, featured 4, `getProject`/`getNextProject` circular, marquee 24 | ✅ — 8 slugs, alternation `landscape, portrait` in list order (data test pins), featured 4 (alder-pine, vantage, emberline, solace), `getNextProject` wraps `(index+1)%length` |
| Details: first `wide`, second `portrait` if featured else `landscape` | ✅ — verified in `projects.ts` + `projects.test.ts` contract |
| Marquee 24 = 8 covers + 5 details + 11 tiles, ≥3 shapes, duplicate half `aria-hidden` | ✅ — `getMarqueeItems()` returns 24, `shape: tall|wide|landscape` + tiles `1:1`; `marquee.tsx` renders sequence twice with second half `aria-hidden` |
| Image file integrity | ✅ — all 19 `src` values in `projects.ts` + `site.ts` resolve (e2e `assets.spec.ts` hits 19/19 with 200 + `src/data/*.test.ts` file-existence) |
| Email single-source `SITE.email` | ✅ — `rg SITE\.email src` → 4 consumers (contact page mailto, footer, form fallback ×2); zero hardcoded fallback in `contact-form.tsx` (K-2 closed) |
| Estimator config typed `EstimatorServiceId` | ✅ — union 4 values, `ESTIMATOR_SERVICES` readonly, `COMPANY_STAGES` 4 (+multipliers 0.8/1/1.2/1.5), `TIMELINES` 4 with duration labels, `SCOPES` 3 |

---

## 5. Pure Logic & API — Phases 4–5

**Determinism (ADR-005):**
- `src/lib/char-block.ts` — LCG `A=1664525 C=1013904223 M=2**32`, seeded `seededCharBlock(seed,rows,cols)` pure, bounded 1–200. `rg Math\.random src` → only `new Date()` in `api/contact` log + `site-footer` year + `rate-limit` `Date.now()` — none in render paths ✅
- `suppressHydrationWarning` only on `<html>` in `layout.tsx` (theme script mutates pre-paint) ✅

**Theme (SKILL §6.1):**
- `theme-toggle.tsx` — `useSyncExternalStore(subscribe=MutationObserver, getSnapshot=classList.contains("dark"), getServerSnapshot=false)`, `try/catch` on `localStorage` ✅
- Inline script `themeScript` in `layout.tsx` — toggles `dark` + adds `js` class pre-paint, `dangerouslySetInnerHTML` fixed string only ✅

**Reveal (SKILL §6.2):**
- `reveal.tsx` — `IntersectionObserver rootMargin "0px 0px -10% 0px"`, `disconnect()` on intersect + cleanup, `opacity-0` via className not effect, `transition-all duration-300` ✅

**Estimator math (SKILL §4 + PAD §3.3 Pattern 1):**
- `estimator.ts` — finds service/stage/timeline/scope, `RangeError` on unknown (fail-fast), `multiplier = stage×timeline×scope`, `roundToNearest(*,1000)`, `multiplier.toFixed(4)` ✅
- UI is static 4-group form (`estimator.tsx` `GROUPS` 1–4, `OPTION_SETS` DRY, `aria-checked`, `aria-live polite`, gated `complete` check, `range` via `useMemo`) ✅
- `?service=` preselect in `contact/page.tsx` — `searchParams: Promise<{service?:string}>`, `isValid = ESTIMATOR_SERVICES.some(s=>s.id===service)`, else `undefined` (source parity) ✅

**Contact schema (ADR-004):**
- `contact.ts` — `contactSchema` zod `name 2–100 trimmed, email trimmed, company optional default "", projectType enum 7, budget enum 5, message 20–2000 trimmed, referral optional`, `fieldErrors()` first-issue-per-field, label maps `PROJECT_TYPE_LABELS/BUDGET_LABELS/REFERRAL_LABELS` exhaustive ✅

**API route (`api/contact/route.ts`):**
- `rateLimit(clientKey(request), 5, 600000)` → 429 + `Retry-After:600` on overflow ✅
- `request.json().catch(()=>null)` → 400 on malformed ✅
- `contactSchema.safeParse` → 400 + `{ok:false, errors}` ✅
- Structured log `contact_inquiry` with lengths not bodies, then `202 {ok:true}` ✅
- Honeypot `website` handled client-side (`contact-form.tsx` div `aria-hidden -left-[9999px] tabIndex=-1`, swallow → `status success` without fetch) ✅

**Rate limiter (`rate-limit.ts`):**
- `MAX_BUCKETS 10000`, `sweepExpired` before insert at cap, sliding window `count/resetAt`, `clientKey` from `x-forwarded-for` split first + `x-real-ip` fallback → `local` ✅
- Serial workers + `x-forwarded-for` spoof per-test isolation in e2e — rationale correct ✅

---

## 6. Security Headers — Live Verification

**Config (`next.config.ts`):**

```ts
CSP: default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
Permissions-Policy: camera=(), microphone=(), geolocation=()
Referrer-Policy: strict-origin-when-cross-origin
HSTS: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
```

CSP `unsafe-inline` is correctly retained (RSC payload + theme script — tightening requires nonce strategy).

**Live (`npx next start --port 3199`, fresh build 16.3.5, `curl -I /api/health`):**

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'  ✅ exact
Permissions-Policy: camera=(), microphone=(), geolocation=()  ✅
Referrer-Policy: strict-origin-when-cross-origin  ✅
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload  ✅
X-Content-Type-Options: nosniff  ✅
X-Frame-Options: DENY  ✅
cache-control: no-store (health)  ✅
```

E2e `smoke.spec.ts` header contract (contains checks) passes on the same build — validated artifact carries hardening without an edge proxy.

---

## 7. Accessibility & Motion — Phase 6

| Contract | Verified |
|---|---|
| Contrast ratios (PAD §5.2) | Tokens unchanged from measured audit — AA/AAA claims remain valid; `muted-foreground` 4.55:1 light sits at AA threshold (do not lighten) |
| `:focus-visible 2px currentColor offset 3px` global | ✅ in `globals.css` |
| Skip link `href="#main-content"` + `<main id="main-content">`, `sr-only` → `focus:not-sr-only focus:z-[60] focus:rounded-full` | ✅ in `layout.tsx`, pinned by `reveal-guard.test.ts` |
| Landmarks `<header> <main> <footer> <nav aria-label>` + `<article>` on case studies | ✅ |
| Mobile menu `aria-expanded` + `aria-controls="mobile-menu"` + focus to first link on open + Escape returns to toggle + body `overflow hidden` lock | ✅ in `site-header.tsx`, e2e `mobile.spec.ts` 5/5 |
| Estimator `role="radiogroup/radio"` + `aria-checked` + `aria-live polite` on total | ✅ |
| Contact `label htmlFor` + `aria-describedby` + `aria-invalid` on all 7 fields incl. 2 selects + `role="alert"` + `role="status"` success | ✅ (K-3 closed) |
| Honeypot `aria-hidden -left-[9999px] tabIndex -1 autoComplete off` | ✅ |
| No-JS reveal guards `html:not(.js) [data-reveal]` + `@media(scripting:none)` both `opacity:1 !important transform:none` | ✅ pinned by `reveal-guard.test.ts` (3/3) |
| `prefers-reduced-motion` disables marquee + reveals + `scroll-behavior:auto` | ✅, e2e `parity.spec.ts` reduced-motion test passes |
| `@axe-core/playwright` critical gates | ✅ 2/2 (home + contact) |

---

## 8. Testing — Phase 7

**Unit (Vitest 4.1.11, node env, `@` alias mirrored):**
- `estimator.test.ts` 9 tests — default `$33k–$55k` etc., rounding, `RangeError`, `formatCompactUsd/formatRange`, last assertion arithmetic commented ✅
- `contact.test.ts` 11 tests — valid baseline, each invalid field, optional defaults, trimming, fieldErrors floor, label exhaustiveness ✅
- `projects.test.ts` + `site.test.ts` 18 tests — aspect alternation, marquee shapes, process/FAQ data, image file existence ✅
- `reveal-guard.test.ts` 3 tests — no-JS guards + skip link source-reading ✅
- `sitemap.test.ts` 3 tests — deterministic `lastModified` from `SITE.contentUpdatedAt`, 13 URLs ✅
- **Total 44/44**

**E2E (Playwright 1.62.0 installed, `^1.63.0` in package.json — drift PKG-D1, non-blocking):**
- `playwright.config.ts` — `testDir e2e/`, `workers:1 fullyParallel:false` (rate-limit isolation), `chromium` (`testIgnore mobile.spec.ts`) + `mobile` Pixel 7 (`testMatch mobile.spec.ts`), managed `next start :3002`, `E2E_PORT/BASE_URL` overridable ✅
- `assets.spec.ts` 26 — 19 image 200s + 7 pages no broken `<img>` ✅
- `contact.spec.ts` 10 — API 202/400/429+Retry-After + isolation, form funnel + honeypot ✅
- `estimator.spec.ts` 7 — static 4-group all visible, gated estimate, deep-link ✅
- `parity.spec.ts` 14 — no-JS reveal (3), skip link, aspect rhythm (4), marquee motion (3), theme toggle (3), focus ring ✅
- `seo.spec.ts` 8 — sitemap 13 URLs, robots, titles, OG/Twitter, per-case OG, favicon ✅
- `smoke.spec.ts` 11 — surfaces, hero pill, work CTA, case page, 404, health, headers, axe ×2 ✅
- `mobile.spec.ts` 5 — overlay nav, scroll lock, nav-close regression, Escape focus, responsive still renders ✅
- **81/81 on `e2e:all`** (76 chromium + 5 mobile)

---

## 9. Build — Phase 8

```
▲ Next.js 16.3.5 (Turbopack)
✓ Compiled successfully in 8.6s
  Running TypeScript ... Finished in 8.9s ...
  Generating static pages using 3 workers (20/20) in 622ms
Route (app)
┌ ○ /              Static
├ ○ /_not-found
├ ○ /about
├ ƒ /api/contact   Dynamic
├ ƒ /api/health
├ ƒ /contact       Dynamic (reads ?service=)
├ ○ /icon.svg
├ ○ /robots.txt
├ ○ /services
├ ○ /sitemap.xml
├ ○ /work
└   /work/[slug]   SSG ● ×8 (alder-pine, vantage, emberline, solace, meridian, foundry, haven-press, latitude)
```

`sitemap.ts` / `robots.ts` — `metadataBase new URL(SITE.url)`, sitemap `lastModified = new Date(SITE.contentUpdatedAt)` deterministic, 5 static + 8 project = 13, robots `Allow /` + `Disallow /api/` + `Sitemap: ${SITE.url}/sitemap.xml` ✅

---

## 10. Documentation Cross-Consistency — Phase 9

| Doc Pair | Alignment | Drift |
|---|---|---|
| AGENTS ↔ CLAUDE | ✅ consistent | CLAUDE adds 6-phase workflow + review gates + `test:coverage` row; AGENTS is compact — intentional layering |
| AGENTS ↔ README | ✅ | README 19 images, AGENTS WebP — aligned; PAD outdated (see below) |
| README ↔ SKILL | ✅ | Feature table, design tokens, file hierarchy, verification commands all match within rounding |
| PAD v1.0.0 ↔ live code | ⚠️ minor stale | **PAD-D1:** `public/images` 15 PNG (commit `421d23a` vintage) → live is 19 WebP since remediation pass 1 (ADR-006). README + AGENTS already updated. PAD needs refresh. |
| SKILL v2.1.0 ↔ live code | ✅ | All §4–§10 claims verified; `cut @ f014842` + pass-2 ADRs 009/010 already folded into v2.1.0 |
| `package.json` ↔ lock/docs | ⚠️ patch drift | **PKG-D1:** `package.json` uncommitted bumps `next 16.3.4→16.3.5, lucide 1.44→45, zod 3.25→3.25.76, @playwright/test 1.62→1.63, eslint-config-next 16.3.4→16.3.5` — installed bun.lock still resolves to 1.62.0. Not breaking, but should be committed as a chore. |
| AGENTS remote | ⚠️ | **GIT-D1:** AGENTS says `git@github.com:nordeim/design-brand-strategy.git` (SSH); `git remote get-url origin` is `https://github.com/nordeim/design-brand-strategy`. Functionally equivalent, but doc should match reality or be dual. |
| `.gitignore` | ⚠️ | **GIT-D2:** Uncommitted addition `server.log /skills/ /db/*.db /db/*.db-journal` (from foundation template). Intentional local hygiene, should be committed. |
| `package-lock.json` + `.github/` untracked | ⚠️ | **GIT-D3:** `package-lock.json` + `package.json.sample` + `.github/` + `docs/prompt-*.md`/`prompts-*.md` present but untracked. `package-lock.json` should be ignored (bun is canonical) — add to `.gitignore`. |

---

## 11. Pre-Ship Checklist (SKILL §11 — Executed)

```bash
bun run lint        # ✅ 0 warnings
bun run typecheck   # ✅ 0 errors
bun run test        # ✅ 44/44
bun run build       # ✅ 20 routes
bun run e2e:all     # ✅ 81/81
```

**Structural invariants (copy-paste):**

```bash
grep -rn 'from "@/app' src/components src/lib src/data        # ✅ 0 (layers intact)
grep -rn 'rounded-\(lg\|xl\|2xl\|md\)' src                     # ✅ 0 (radius contract)
grep -rn 'shadow' src                                          # ✅ 0 (no shadows)
grep -rn 'hsl(\|#[0-9a-fA-F]\{6\}' src --include='*.tsx'       # ✅ 0 (tokens only)
rg -l '"use client"' src                                       # ✅ 6 (5 components + app/error)
ls public/images | wc -l                                       # ✅ 19 (WebP)
rg -rn '\.png' src                                             # ✅ 0 (WebP migration intact)
```

**Runtime smoke (`next start :3199` fresh):**

```bash
curl -s http://127.0.0.1:3199/api/health
# → {"ok":true,"service":"design-brand-strategy","uptimeSeconds":N}
curl -sI http://127.0.0.1:3199/api/health
# → CSP/HSTS/XFO/nosniff/Referrer/Permissions-Policy all present and exact
```

---

## 12. Known Issues Still Open (PAD §10 — Confirmed)

| ID | Severity | Issue | Verified Still Open |
|---|---|---|---|
| K-5 | Medium | ~2.5 MB imagery with no responsive variants (WebP ~9% win over PNG, host optimizer could do better) | ✅ still open — 19 WebP, no `srcset` |
| K-7 | Low | In-memory limiter per-instance (N×5 behind load balancer) | ✅ by design, accepted |
| K-9 | Low | Marquee `figcaption` visible on duplicated loop half (aria-hidden handles AT) | ✅ still present, low |
| K-10 | Low | No CI pipeline — gates local-first | ✅ still open |
| HIGH pending | — | Contact delivery integration at `contact_inquiry` log line not wired to email/CRM | ✅ still open, documented in README/SKILL |

All pass-1 issues (K-1 no-JS, K-2 email single-source, K-3 select wiring, K-4 estimator DRY, K-6 skip link, K-8 per-page OG) remain closed ✅.

---

## 13. Recommendations — Best-Course Actions

**Do now (15 min, mechanical):**

1. **Commit the patch bumps** — `git add package.json && bun install && git add bun.lock` with `chore: bump patch deps to 16.3.5 — align docs/lock (PKG-D1)`. Keeps `package.json`, `bun.lock`, and installed `node_modules` in sync.
2. **Fix PAD image count** — edit `Project_Architecture_Document.md` §2/§11: `15 PNG` → `19 WebP` + note 2.5 MB. Removes the only stale-number drift.
3. **Normalize remote doc** — in `AGENTS.md`, change `Remote is git@...` → `Remote is https://github.com/nordeim/design-brand-strategy.git (SSH alias git@github.com:nordeim/design-brand-strategy.git also valid)`.
4. **Commit `.gitignore` additions** — `git add .gitignore` (server.log, /skills/, /db/*.db). They are correct hygiene from the foundation template.
5. **Ignore `package-lock.json`** — add `package-lock.json` + `package.json.sample` to `.gitignore` (bun is canonical; npm sample is reference). Then `git rm --cached package-lock.json` if untracked noise is unwanted.

**Do next (when convenient):**

6. **Wire `contact_inquiry` delivery** — the one HIGH open item; the structured log at `src/app/api/contact/route.ts:56` is the integration point. Add Resend/SES or CRM webhook behind an env-guarded provider; keep `202` semantics.
7. **Add CI** (K-10) — GitHub Actions `lint → typecheck → test → build → e2e` on push to `main`. The local gates are solid; CI makes them enforceable.
8. **Clean untracked docs drift** — either commit `docs/prompt-to-review.md` + `prompts-*.md` + `.github/` or gitignore them — they are currently untracked noise.
9. **PAD refresh to v1.1.0** — fold the pass-2 parity ADRs (009/010) detail into PAD the way SKILL v2.1.0 already did; the PAD still reads as v1.0.0 pre-e2e.

**Do not do:**

- Do not introduce `next-themes`, a CMS, a DB, `tailwind.config.js`, `Math.random()` in render, or a shadow/radius — all are rejected by ADR and the token contract and would regress the green gates.

---

## Appendix A — Commands Executed

```
bun run lint
bun run typecheck
bun run test          # 44/44
bun run build         # 20 routes
bun run e2e           # 76/76
bun run e2e:all       # 81/81
rg structural invariants (§11)
next start :3199 + curl header smoke
git status/diff/remote/log/ls
```

## Appendix B — File Evidence Index

`src/app/globals.css` · `src/app/layout.tsx` · `src/app/sitemap.ts` · `src/app/api/contact/route.ts` · `src/components/{site-header,theme-toggle,reveal,estimator,contact-form,marquee,project-card,collage-strip}.tsx` · `src/data/{site,projects}.ts` · `src/lib/{estimator,contact,char-block,rate-limit}.ts` · `src/lib/reveal-guard.test.ts` · `src/data/*.test.ts` · `src/app/sitemap.test.ts` · `next.config.ts` · `tsconfig.json` · `vitest.config.ts` · `playwright.config.ts` · `eslint.config.mjs` · `postcss.config.mjs` · `.env.example` · `public/images/` (19) · `e2e/*.spec.ts` (7) · `AGENTS.md` · `CLAUDE.md` · `README.md` · `design-brand-strategy_SKILL.md` · `Project_Architecture_Document.md`

