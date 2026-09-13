---
name: design-brand-strategy
description: >
  Comprehensive engineering skill for the Elena Vance editorial portfolio
  codebase (Next.js 16 App Router + React 19 + Tailwind CSS 4, CSS-first
  tokens, no database). Use when extending, debugging, auditing, onboarding
  onto, or remediating this codebase — or when replicating its architecture
  for another editorial marketing site. Captures the design system contract,
  component architecture, content-as-code data layer, accessibility
  implementation, anti-patterns, debugging procedures, and hard-won lessons
  from the build and every subsequent remediation pass.
version: 2.1.0
last_updated: 2026-09-13
project_state: 44/44 unit tests green · 81/81 Playwright e2e specs green · tsc --noEmit clean · eslint clean · next build 20 routes · main @ post-remediation pass 2 (see Appendix B)
---

# design-brand-strategy — Engineering SKILL

> **What this is:** a single-source-of-truth engineering reference for the
> `nordeim/design-brand-strategy` repository. Every claim below is verifiable
> against a specific file, command, or measured value. It was produced by
> following the six-phase distillation process
> (`to-distill-project-into-skill` meta-skill) on the codebase as it stood at
> commit `f014842`.

> **How to use this document:**
> - **Onboarding?** Read §1, §2, §5, §7 in order — fifteen minutes to a mental model.
> - **Extending?** §4 (design system contract), §7 (add content), §15 (copy-paste patterns).
> - **Debugging?** Start at §10; if the symptom is visual, also read §9.
> - **Shipping?** Run the §11 pre-ship checklist top to bottom. No exceptions.
> - **Reviewing a change?** §13 (pitfalls) and §16 (coding anti-patterns) are the rubric.
> - **Anything about colors, spacing, z-index, breakpoints, image aspects?** §17–§19 + §4.5. Do not guess.
>
> **v2.0.0 change log:** documents the codebase after remediation pass 1 (2026-09-13 audit → fix cycle): mixed-aspect editorial image rhythm (ADR-008), fail-open no-JS reveal guards (ADR-007), WebP assets (ADR-006 revision), services process/FAQ/CTA sections, skip link + select-error a11y wiring, estimator DRY refactor, per-page OG images, deterministic sitemap stamps. New lessons L9–L12; audit history in Appendix B.
>
> **v2.1.0 change log:** adds the Playwright e2e layer (ADR-009, 81 specs) and the pass-2 parity redesign (ADR-010): static four-group estimator with gated estimate, /work closing CTA band, portrait 4:5 + uniform 7:3 case heroes, 3-column home-services and about-approach grids, text-left/portrait-right home/about heroes, 5-step horizontal process, minimal card meta grammar, source-range marquee shapes, single-column contact fields (form left / info right), referral select, timeline labels with durations. New lesson L13.

## Table of Contents

1. [Project Identity & Design Philosophy](#1-project-identity--design-philosophy)
2. [Tech Stack & Environment](#2-tech-stack--environment)
3. [Bootstrapping & Configuration](#3-bootstrapping--configuration)
4. [The Design System (Code-First)](#4-the-design-system-code-first)
5. [Component Architecture & Patterns](#5-component-architecture--patterns)
6. [Custom Hooks Deep Dive](#6-custom-hooks-deep-dive)
7. [Content Management (Content-as-Code)](#7-content-management-content-as-code)
8. [Accessibility Implementation](#8-accessibility-implementation)
9. [Anti-Patterns & Common Bugs](#9-anti-patterns--common-bugs)
10. [Debugging Guide](#10-debugging-guide)
11. [Pre-Ship Checklist](#11-pre-ship-checklist)
12. [Lessons Learnt & How to Avoid Them](#12-lessons-learnt--how-to-avoid-them)
13. [Pitfalls to Avoid](#13-pitfalls-to-avoid)
14. [Best Practices](#14-best-practices)
15. [Coding Patterns](#15-coding-patterns)
16. [Coding Anti-Patterns](#16-coding-anti-patterns)
17. [Responsive Breakpoint Reference](#17-responsive-breakpoint-reference)
18. [Z-Index Layer Map](#18-z-index-layer-map)
19. [Color Reference (Complete)](#19-color-reference-complete)
20. [The Complete TypeScript Interface Reference](#20-the-complete-typescript-interface-reference)
- [Appendix A: Architecture Decision Records](#appendix-a-architecture-decision-records)
- [Appendix B: Audit History](#appendix-b-audit-history)
- [Appendix C: Post-Deploy Live-Site Validation](#appendix-c-post-deploy-live-site-validation)

---

## 1. Project Identity & Design Philosophy

**One sentence.** An editorial portfolio site for an independent designer and
brand strategist ("Elena Vance", New York) — a five-page marketing site with a
static four-group investment estimator (gated estimate) and a validated
contact form, built as a fully static Next.js 16 application with two API
routes, verified by 44 unit tests and an 81-spec Playwright e2e suite.

**The design thesis: warm editorial print.** The site behaves like a
well-set magazine: a cream paper background, near-black ink, a display serif
(Instrument Serif, with italics used as emphasis inside headlines), one
sans-serif for everything else (Inter), hairline rules instead of shadows,
square corners everywhere, and generous asymmetric whitespace. Motion is
restrained — a single slow marquee, 300 ms scroll-reveals, hover nudges —
never decorative animation for its own sake.

**Non-negotiable design rules.** These are the rules a future agent is most
likely to violate, in rough order of likelihood:

1. **No rounded corners on structural surfaces.** The only rounded elements
   in the entire site are the pill buttons, the theme toggle disc, the
   availability pill, and the estimator step dots (`rounded-full`). Cards,
   images, inputs, and sections are square. Do not add `rounded-lg` to
   anything.
2. **No shadows.** Depth is expressed with hairline borders
   (`border-border`) and inverted bands (`bg-foreground text-background`),
   never `box-shadow`. The sticky header separates with a border and a
   translucent backdrop-blur, not a drop shadow.
3. **No color beyond the token palette.** The palette is warm neutrals plus
   ink (§19). There is no brand accent color, no gradients, no fills. Color
   contrast comes from *inversion* (ink band, pill button), not hue.
4. **Serif for display, sans for everything functional.** Headlines,
   pull quotes, and the estimator's running total are
   `font-serif` (Instrument Serif). Labels, body, nav, and UI chrome are
   `font-sans` (Inter) — set in small sizes, uppercase, with wide tracking
   (`tracking-[0.18em]`–`[0.22em]`) for the "wayfinding" voice.
5. **Editorial numbering everywhere.** Lists are numbered `01 / 02 / 03` in
   `tabular-nums` muted text — services, approach principles, mobile nav,
   and the estimator's four groups (1 Project type … 4 Deliverables).
6. **Motion budget: one marquee + reveals + hover nudges.** Nothing else.
   No parallax, no scroll-jacking, no transform cascades. CSS-only
   (zero animation libraries — no Framer Motion by explicit decision).
7. **Images are content, not decoration — and their orientation is data.**
   Fixed aspect ratios with `object-cover`, real alt text on every content
   image, captions in the muted uppercase label voice. Covers alternate
   landscape `aspect-[8/5]` and portrait `aspect-[4/5]` (the mixed editorial
   rhythm, ADR-008); every case hero is a uniform `aspect-[7/3]` wide banner;
   case details mix wide `aspect-[7/3]`, landscape `aspect-[3/2]`, and
   portrait studies; the marquee renders tall/wide/landscape/square shapes.
   Orientation lives in the data layer
   (`coverAspect`, `details[].aspect`, marquee `shape`), never in ad-hoc
   component classes.

**The CTA hierarchy.** One primary CTA shape (the ink pill button,
`PillLink` / `CtaBand`: "Start a conversation", "Start a project", "Send
inquiry"), one secondary CTA shape (the uppercase arrow link,
`ArrowLink`: "View selected work", "All projects"). Everything else is
tertiary text links with the animated underline (`.link-underline`). Never
introduce a third CTA visual. **Closing CTA bands are light** — a `bg-muted`
band with `border-t`, ink serif headline, muted body, and the ink pill
(`CtaBand` component, used on home / services / about). The inverted-ink band
is reserved for the collage poster card and the estimator's selected states,
not for page-level CTAs.

**The anti-generic mandate (what "AI slop" looks like here).** This site
must never grow: purple-to-blue gradients, glassmorphism cards, hero
background videos, emoji, badge clusters, star ratings, testimonial
carousels, `text-gray-500`-style default grays, Inter-for-headlines,
`rounded-xl` cards with `shadow-md`, or a "trusted by" logo wall. Every one
of those is a rejected cliché; the reference aesthetic is a printed
portfolio you can almost feel.

**What this project deliberately is NOT:** no database (ADR-002), no auth,
no CMS, no animation library, no component library (no shadcn/Radix), no
analytics, no i18n, no Docker. (Testing, by contrast, is deliberately
rich: 44 unit tests + an 81-spec Playwright e2e suite — ADR-009.)
See Appendix A for the rationale of each.

---

## 2. Tech Stack & Environment

Exact versions from `package.json` + the installed `node_modules` (bun
lockfile). **Never downgrade or float these without re-running the full
§11 checklist** — the toolchain is tuned as a set.

| Layer | Technology | Version (installed) | Critical Note |
|---|---|---|---|
| Framework | `next` | **16.3.5** | App Router only. No `middleware.ts`/`proxy.ts`. Security headers emitted from `next.config.ts` `headers()`, not from an edge proxy. |
| UI runtime | `react` / `react-dom` | **19.3.0** | Server Components by default; only 5 of 10 `src/components` files are `"use client"` (§5). |
| Styling | `tailwindcss` + `@tailwindcss/postcss` | **4.3.3** | CSS-first. There is **no `tailwind.config.ts`** — every token lives in `globals.css` `@theme inline`. Dark mode is class-based via `@custom-variant dark`. |
| PostCSS | `postcss` | **8.5.28** | Only plugin: `@tailwindcss/postcss`. |
| Validation | `zod` | **3.25.76** | One schema (`contactSchema`) enforced at two boundaries (client inline + API authoritative) — ADR-004. |
| Icons | `lucide-react` | **1.45.0** | Only `Menu`, `X`, `Sun`, `Moon`, `ArrowRight`, `ChevronDown` are used. Tree-shaken; no icon fonts. |
| Language | `typescript` | **5.9.3** | `strict: true`, `noEmit`, `moduleResolution: "bundler"`, path alias `@/* → ./src/*`. |
| Tests | `vitest` | **4.1.11** | `environment: "node"`, includes `src/**/*.test.ts`. 44 tests / 6 files — pure functions, data contracts, and source-reading guards. No jsdom. |
| E2E | `@playwright/test` | **1.62.0** | 81 specs in `e2e/` (7 files) + `@axe-core/playwright` 4.13.0. Chromium + Pixel-7 projects against the production build (`next start` :3002). Pinned to 1.62.0 to match the cached Chromium 151; bun.lock locks it. |
| Lint | `eslint` + `eslint-config-next` | **9.39.5** / 16.3.4 | Flat config (`eslint.config.mjs`) extending `eslint-config-next/core-web-vitals`. |
| Package manager | bun | (host) | `bun install`, `bun run <script>`. `trustedDependencies: ["unrs-resolver"]` — the only postinstall allowed to run. |
| Database | — | — | None by decision (ADR-002). Content is TypeScript data files. |
| Runtime | Node / Bun | 20+ | `next start` or any Node host; nothing platform-specific. |

**Environment variables — exactly one:**

| Variable | Scope | Default | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | public | `http://localhost:3000` | Canonical origin for metadata `metadataBase`, sitemap URLs, robots sitemap pointer. Read once in `src/data/site.ts` (`process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"`). |

There is no zod env schema — a single public URL var does not justify one,
and the `??` fallback means builds never fail on a missing env (see §13 for
why that is the intended trade).

**Rendering strategy:** fully static where possible. `/`, `/about`,
`/services`, `/work`, and all 8 `/work/[slug]` pages are prerendered
(SSG via `generateStaticParams`); `/contact` is dynamic only because it reads
`searchParams` (`?service=` estimator preselect); `/api/contact` and
`/api/health` are dynamic route handlers. `sitemap.xml` and `robots.txt` are
generated routes. `images.unoptimized: true` (ADR-006) — `next/image` is
still used for layout discipline, but optimization is delegated to the host.

**Repo facts an agent should internalize:**
- 3,233 lines of TS/TSX/CSS across 33 source files under `src/`.
- 15 generated original images in `public/images/` (~2.5 MB total, PNG).
- Git: `main` only, no feature branches by operator contract; remote is
  `git@github.com:nordeim/design-brand-strategy.git`.

---

## 3. Bootstrapping & Configuration

This project was **not** scaffolded with `create-next-app`. It was assembled
by copying five proven config files from a sibling foundation repo (lesson
L1, §12) and writing `package.json` by hand. Reproduce a working environment
like this:

```bash
git clone git@github.com:nordeim/design-brand-strategy.git
cd design-brand-strategy
bun install            # 395 packages; trusts exactly one postinstall (unrs-resolver)
cp .env.example .env   # optional — NEXT_PUBLIC_SITE_URL falls back safely
bun run dev            # http://localhost:3000
```

Quality gates (the only commands you ever need — all wired in `package.json`):

```bash
bun run lint        # eslint .            — flat config, core-web-vitals
bun run typecheck   # tsc --noEmit        — strict (covers e2e/ specs too)
bun run test        # vitest run          — 44 tests, node environment
bun run build       # next build          — 20 routes
bun run e2e         # playwright chromium — 76 specs against the built artifact
bun run e2e:all     # + Pixel-7 mobile    — 81 specs total (serial workers)
bun run start       # next start          — prod server (use -p 3001 when 3000 is busy)
```

**Configuration file map** (each is small; read it before editing):

| File | Role | Gotcha |
|---|---|---|
| `next.config.ts` | Security headers (CSP, HSTS, X-Frame-Options DENY, Permissions-Policy, Referrer-Policy, nosniff) + `images.unoptimized: true` | CSP allows `'unsafe-inline'` script/style — required by the RSC payload and the inline theme script (§15.5). Tighten only with a nonce strategy, never by deleting the allowance blindly. |
| `tsconfig.json` | strict TS, `@/*` alias, excludes `skills/` | `incremental: true` → `.tsbuildinfo` appears; it is gitignored. |
| `eslint.config.mjs` | Flat config on `eslint-config-next/core-web-vitals`; global-ignores `.next/**`, `out/**`, `build/**`, `next-env.d.ts`, `skills/**`, `infrastructure/**` | The `react-hooks` rules here are strict about set-state-in-effect; two real refactors were forced by them (lesson L4). |
| `vitest.config.ts` | `@` alias mirrored, node env, `src/**/*.test.ts` | No jsdom — tests import pure functions only; do not add DOM-touching tests without adding an environment. |
| `playwright.config.ts` | testDir `e2e/`, serial workers, chromium + Pixel-7 projects, managed `next start` webServer on :3002 (`E2E_PORT`/`E2E_BASE_URL` overridable) | Runs the PRODUCTION build — run `bun run build` first, and beware `reuseExistingServer: true` picking up a stale server. With `javaScriptEnabled: false` locators cannot resolve — no-JS specs assert through `page.evaluate`. |
| `postcss.config.mjs` | Single `@tailwindcss/postcss` plugin | Tailwind 4 has no config file to point at; tokens live in CSS. |
| `.env.example` | Documents `NEXT_PUBLIC_SITE_URL` + optional `E2E_PORT` / `E2E_BASE_URL` | Public vars — never put secrets in it. |

**Fonts** are loaded in `src/app/layout.tsx` via `next/font/google`:
`Instrument_Serif` (weight `400`, styles `normal`+`italic`, CSS variable
`--font-instrument-serif`, `display: swap`) and `Inter` (variable font, CSS
variable `--font-inter`). The variables are consumed by the `@theme inline`
font tokens in `globals.css` (§4). Never add a `<link>` to Google Fonts —
that would violate the CSP `font-src 'self'` and reintroduce layout shift.

**No Docker, no CI pipeline in-repo.** Verification is local-first: the §11
checklist plus the smoke-test script (Appendix C) are the release gate.

---

## 4. The Design System (Code-First)

The entire design system is **one file**: `src/app/globals.css` (135 lines).
Nothing else defines color, type, motion, or focus. Read it before any visual
change; the values below are transcribed verbatim from it.

### 4.1 Token architecture

CSS custom properties on `:root` (light) and `.dark`, re-exported to
Tailwind utilities through `@theme inline` — so `bg-background`,
`text-muted-foreground`, `border-border` etc. all resolve to the live theme
variables, and dark mode is purely a class toggle on `<html>`:

```css
@custom-variant dark (&:where(.dark, .dark *));

:root {
  --background: hsl(45 20% 98%);        /* #fbfaf9 cream paper */
  --foreground: hsl(0 0% 10%);          /* #1a1a1a ink */
  --muted: hsl(45 8% 92%);              /* #ecebe9 */
  --muted-foreground: hsl(0 0% 45%);    /* #737373 */
  --accent: hsl(40 10% 88%);            /* #e3e1dd */
  --accent-foreground: hsl(0 0% 10%);
  --border: hsl(40 10% 88%);            /* #e3e1dd hairline */
  --pill: hsl(0 0% 10%);                /* #1a1a1a */
  --pill-foreground: hsl(45 20% 98%);   /* #fbfaf9 */
}

.dark {
  --background: hsl(0 0% 8%);           /* #141414 */
  --foreground: hsl(45 20% 95%);        /* #f5f4f0 */
  --muted: hsl(0 0% 14%);               /* #242424 */
  --muted-foreground: hsl(0 0% 64%);    /* #a3a3a3 */
  --accent: hsl(0 0% 16%);              /* #292929 */
  --accent-foreground: hsl(45 20% 95%);
  --border: hsl(0 0% 20%);              /* #333333 */
  --pill: hsl(45 20% 95%);              /* #f5f4f0 */
  --pill-foreground: hsl(0 0% 8%);
}

@theme inline {
  --font-serif: var(--font-instrument-serif), Georgia, "Times New Roman", serif;
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --color-background: var(--background);      /* → bg-background, text-background … */
  --color-foreground: var(--foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-border: var(--border);
  --color-pill: var(--pill);
  --color-pill-foreground: var(--pill-foreground);
  --animate-marquee: marquee 56s linear infinite;
  @keyframes marquee { from { transform: translateX(0); }
                       to   { transform: translateX(-50%); } }
}
```

**Naming contract:** 10 color tokens — `background`, `foreground`,
`muted`, `muted-foreground`, `accent`, `accent-foreground`, `border`,
`pill`, `pill-foreground` (+ dark counterparts, same names). `accent` is a
surface fill (the char-block card background), **not** a hue accent. If a
future feature needs a semantic new token (e.g. `--destructive`), add it in
*both* themes and map it through `@theme inline` in the same commit — an
unmapped variable is a dark-mode bug.

### 4.2 Typography hierarchy

| Role | Font | Classes | Notes |
|---|---|---|---|
| Display / H1 | Instrument Serif | `font-serif text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.02–1.05] tracking-tight` | Per-page H1 uses `clamp()`; hero goes to `8vw`/`6.5rem`. |
| Section H2 | Instrument Serif | `font-serif text-4xl md:text-5xl tracking-tight` | |
| Sub-headline / pull quote | Instrument Serif | `font-serif text-xl md:text-2xl` (case-study summary), `text-2xl md:text-3xl` (blockquote, with `border-l-2 border-foreground pl-6`) | Blockquotes are hairline-rule + serif, never big quotation glyphs. |
| Body | Inter | `text-sm`/`text-base leading-relaxed text-muted-foreground`, measure-capped `max-w-[48–62ch]` | Body text is *muted*, not foreground — the ink color is reserved for display and UI emphasis. |
| Label ("wayfinding voice") | Inter | `text-[10px]–text-xs font-medium uppercase tracking-[0.18em]–[0.22em] text-muted-foreground` | Captions, section labels, `<dt>`s, footer headings. `SectionLabel` in `ui.tsx` is the canonical implementation. |
| Nav link | Inter | `text-sm font-medium uppercase tracking-[0.16em]` | |
| Numbers | Inter | `tabular-nums` | Indices, years, estimator totals (`font-serif tabular-nums` for the big range). |

Emphasis inside serif headlines is `<em className="italic">` — Instrument
Serif's italic is a core part of the brand voice ("Brands built on
*intention and* clarity").

### 4.3 Keyframes & motion inventory

Exactly **one** keyframes block: `marquee` (56 s, linear, infinite,
translateX 0 → −50%; the track renders the item sequence twice so −50% is a
seamless loop). Everything else that moves is a transition:

| Motion | Where | Spec |
|---|---|---|
| Scroll reveal | `Reveal` wrapper (`src/components/reveal.tsx`) | `transition-all duration-300 ease-out` from `opacity-0` + `translate-y-[26px]` (text) or `translate-y-10 scale-[0.98]` (card) → settled state; optional `transitionDelay` 40–240 ms |
| Marquee pause on hover | `Marquee` | `group-hover:[animation-play-state:paused]` |
| Animated link underline | `.link-underline` | `background-size 0%→100% 1px`, `300ms ease`, hover-gated by `@media (hover: hover)` |
| Card hover lift | `ProjectCard` | `group-hover:-translate-y-2` on the image, `duration-700 ease-out` |
| Image zoom nudge | `CollageStrip` workspace image | `hover:scale-[1.02] duration-700` |
| Service title nudge | home services list | `group-hover:translate-x-2 duration-300` |
| Next-project title | case study footer | `group-hover:translate-x-3 duration-300` |
| Arrow slide | `ArrowLink` / `PillLink` | `group-hover:translate-x-1 duration-300` |
| Header link / button colors | various | `transition-colors duration-200–300` |
| Pill button feedback | CTAs | `hover:opacity-80`, `disabled:opacity-50`, `duration-300` |
| FAQ chevron rotation | services `<details>` summary | `group-open:rotate-180 duration-300` (CSS-only, no JS) |

`prefers-reduced-motion: reduce` disables all of it (§8.4), and the dual
no-JS guards keep content visible without scripting (ADR-007). No JS-driven
animation exists anywhere in the codebase.

### 4.4 Custom CSS classes (the complete list)

Beyond Tailwind utilities, `globals.css` defines exactly three things:

1. **`.link-underline`** — the animated underline (spec above). Apply to any
   inline text link; combine with `transition-colors hover:text-foreground`
   for the standard footer/nav link behavior.
2. **`.char-block`** — the signature dense texture block: `line-height: 1.1;
   letter-spacing: 0.08em; font-size: 0.875rem; user-select: none;
   word-break: break-all; overflow: hidden;` Renders output of
   `seededCharBlock()` inside a `<pre>`.
3. **Base element rules** — `html { scroll-behavior: smooth;
   scroll-padding-top: 5rem }` (keeps `#anchor` targets clear of the 80 px
   sticky header), `body` token colors + antialiasing,
   `::selection { background: var(--foreground); color: var(--background) }`
   (inverted selection is part of the voice), and `:focus-visible { outline:
   2px solid currentColor; outline-offset: 3px }`.

### 4.5 Spacing, radius, shadow, and image-aspect scales

- **Radius:** `rounded-full` (pills, toggle disc, step dots) is the only
  radius in the system. Everything else is square (default `0`).
- **Shadows:** none anywhere. Depth = borders + inversion. (`backdrop-blur-md`
  on the header is translucency, not a shadow.)
- **Image aspect map (the mixed editorial rhythm, ADR-008):**

| Context | Aspect | Class | Source files |
|---|---|---|---|
| Landscape covers (grids) | 8:5 | `aspect-[8/5]` | 1344×840-class landscape WebP |
| Portrait covers | 4:5 | `aspect-[4/5]` | 864×1152 `*-portrait.webp` (≈6% render crop — source-measured 0.80) |
| Case-study hero (every case) | 7:3 | `aspect-[7/3]` | the project cover, object-cropped (uniform wide banner — pass-2 parity) |
| Case detail — wide banner | 7:3 | `aspect-[7/3]` | landscape sources (mild crop) |
| Case detail — landscape | 3:2 | `aspect-[3/2]` | landscape sources |
| Case detail — portrait | 4:5 | `aspect-[4/5]` | `detail-*-portrait.webp` |
| Marquee — tall / wide / landscape | 4:5 / 5:4 / 4:3 | `h-55 w-44` / `h-58 w-72` / `h-48 w-64` | derives from item `shape` |
| Marquee — tiles | 1:1 | `h-44 w-44` | — |
| Hero portrait / collage workspace | 4:5 / 7:4 | `aspect-[4/5]` / `aspect-[7/4]` | `portrait-main.webp` / `workspace.webp` |

- **Page rhythm:** every section is wrapped in `Container`
  (`mx-auto w-full max-w-[1400px] px-6 md:px-10 lg:px-16`). Section
  padding: `py-16 md:py-24` (page headers), `py-20 md:py-28` (major home
  sections + CTA bands), `py-12 md:py-16` (services entries), `py-14 md:py-20`
  (next-project band). Never invent horizontal padding — go through
  `Container`.
- **Grid:** the editorial 12-column grid (`md:grid-cols-12`) with `gap-10`
  is the layout backbone: hero 7/5 split, case study 8/3 with
  `col-start-10`, services 5/6 with `col-start-7`, contact 4/7.

---

## 5. Component Architecture & Patterns

### 5.1 The four-layer model (the Golden Rule)

```
src/data/        content-as-code (site.ts, projects.ts)      — no imports upward
src/lib/         pure logic (estimator, contact, rate-limit, char-block) — imports data only
src/components/  presentation (11 files)                     — imports data + lib + ui primitives
src/app/         routes, layout, API handlers, metadata      — imports everything
```

**The Golden Rule:** dependencies point downward only
(`app → components → lib → data`). A `.tsx` in `components/` must never
import from `src/app/`; a lib must never import a component; data imports
nothing from the app. There is exactly one sanctioned boundary exception:
`src/app/api/contact/route.ts` imports the zod schema from `src/lib/contact.ts`
—that is lib, so it is still downward. The architecture is verifiable with:

```bash
grep -rn "from \"@/app" src/components src/lib src/data   # must output nothing
grep -rn "from \"@/components" src/lib src/data           # must output nothing
```

### 5.2 Component inventory (all 11 files in `src/components/`)

| Component | File | Mode | Purpose |
|---|---|---|---|
| `Container`, `SectionLabel`, `ArrowLink`, `PillLink` | `ui.tsx` | Server | Layout & CTA primitives — the only place horizontal rhythm and CTA shapes are defined. |
| `SiteHeader` | `site-header.tsx` | **Client** | Sticky translucent header, desktop nav with `aria-current`, mobile overlay menu (full-height, serif 4xl links, body-scroll lock). |
| `ThemeToggle` | `theme-toggle.tsx` | **Client** | Dark-mode switch driven by `useSyncExternalStore` + `MutationObserver` (§6.1). |
| `Reveal` | `reveal.tsx` | **Client** | IntersectionObserver scroll-reveal wrapper (§6.2, §15.2). |
| `Marquee` | `marquee.tsx` | Server | 24-item looped strip: project covers + studio details + typographic tiles; renders the sequence twice; duplicate half `aria-hidden`. |
| `CollageStrip` | `collage-strip.tsx` | Server | Three staggered collage elements (workspace photo, typographic poster, seeded char block) on the home page. |
| `ProjectCard` | `project-card.tsx` | Server | Image-led card; whole card is the `<Link>`; minimal editorial meta (title, uppercase practice line, year — pass-2 parity). |
| `Estimator` | `estimator.tsx` | **Client** | Static four-group form (1 Project type / 2 Business stage / 3 Timeline / 4 Deliverables) in a 2×2 grid; all options visible; estimate gated until complete; `aria-live` region; `?service=` preselects one group (ADR-010). |
| `ContactForm` | `contact-form.tsx` | **Client** | zod-validated form, honeypot, four status states (idle/submitting/success/error). |
| `SiteFooter` | `site-footer.tsx` | Server | Name block, nav column, social column, legal row. |
| `CtaBand` | `cta-band.tsx` | Server | The shared closing-CTA section: light `bg-muted` band, ink serif headline, `PillLink` action. Used on home, /work, services, and about. |

Client/server split rationale: interactivity *requires* the client bundle;
everything else stays server-rendered so the static HTML is complete. When
adding a component, default to Server; add `"use client"` only for state,
effects, or browser APIs. (`src/app/error.tsx` is also a client component,
as Next requires for error boundaries.)

### 5.3 Client-component decision tree

```
Does it need useState / useEffect / DOM APIs / event handlers?
├─ no  → Server component (render into static HTML at build time)
└─ yes → "use client", and push the interactive part as low in the tree as
         possible. Pages wrap client islands inside server <Reveal>/sections
         so the surrounding markup still prerenders.
```

`Reveal` is the canonical example of a minimal client island: it wraps
*server-rendered children* — the children are complete in the RSC payload,
only the wrapper transitions.

### 5.4 Data-flow patterns

- **Content pages** import data directly (`PROJECTS`, `SERVICES`, …) at build
  time — no fetching, no runtime data. The whole site works offline from
  prerendered HTML (except the two API routes).
- **Case study pages** use `getProject(slug)` / `getNextProject(slug)`
  (circular "next" navigation: last project links back to the first).
- **Estimator math** lives in `src/lib/estimator.ts` (pure, fail-fast,
  9 tests). The component holds only selection state; every rendered number
  is derived via `useMemo(() => estimateRange(selection))`.
- **Contact validation** lives in `src/lib/contact.ts` — one schema, two
  consumers (form inline pre-check, API authoritative check) — ADR-004.
- **API route** (`src/app/api/contact/route.ts`): rate-limit → parse JSON →
  zod → structured `console.info` log → `202`. See §15.4.

### 5.5 Conventions that hold across every component

- Named exports only (no default component exports in `src/components/`).
- Copy comes from `src/data/site.ts` / `projects.ts` — components render
  data, they don't contain prose. (`SITE.name`, `SITE.availability`, etc.)
- Icons are decorative: every lucide icon carries `aria-hidden="true"`.
- External links: `target="_blank" rel="noopener noreferrer"` (footer socials).
- Images: always `next/image` with explicit `width`/`height` and a
  Tailwind `aspect-*` + `object-cover` class pair; `priority` only on the
  hero portrait and case-study cover.

---

## 6. Custom Hooks Deep Dive

**This codebase has zero custom hooks — deliberately.** Both "hook-shaped"
problems were solved with React primitives instead, because each has exactly
one consumer and a shared abstraction would be premature. If you extract
either into `src/lib/hooks/`, you own the burden of proving the extraction
is worth the indirection.

### 6.1 `useSyncExternalStore` for the theme (`theme-toggle.tsx`)

The `<html>` class list is treated as an *external store* owned by the inline
boot script (initial value) and the toggle (user intent):

- `subscribe` — a `MutationObserver` watching `document.documentElement`'s
  `class` attribute; observer disconnects on cleanup (no leak).
- `getSnapshot` — `classList.contains("dark")` (a boolean; referentially
  stable, so no infinite re-render).
- `getServerSnapshot` — always `false`; SSR renders the light-state icon and
  hydration corrects it if the boot script applied `.dark`. This is the
  pattern that *replaced* a buggy `useEffect`+`useState` sync (lesson L4).
- Persistence: `localStorage.setItem("theme", …)` inside a `try/catch`
  (private-mode storage throws; the toggle still works without persistence).

### 6.2 `IntersectionObserver` inside `Reveal` (`reveal.tsx`)

- Observer fires once per element: on first intersect it calls
  `setVisible(true)` then `observer.disconnect()`; effect cleanup also
  disconnects. No state is set synchronously in the effect body, so
  server/client markup match (the hidden state is expressed in the initial
  className, not in an effect).
- `rootMargin: "0px 0px -10% 0px"` — reveals fire when content crosses 90%
  of the viewport, slightly before the bottom edge.
- `prefers-reduced-motion` **and scripting-disabled** are handled **in CSS,
  not JS** (§8.4 + ADR-007) — the component never reads media queries or
  feature-support, which keeps it hydration-safe and no-JS-safe.
- The no-JS contract: the boot script adds `html.js`; `globals.css` forces
  `[data-reveal]` visible under `html:not(.js)` and `@media (scripting: none)`.
  Pinned by `src/lib/reveal-guard.test.ts` (source-reading).

### 6.3 If you ever do add hooks

Put them in `src/lib/hooks/` (new directory), keep them SSR-safe
(`typeof window` guards or `useSyncExternalStore` server snapshots), write a
unit test when the hook contains logic worth testing (pure logic belongs in
`src/lib/*.ts`, not in a hook), and document them here.

---

## 7. Content Management (Content-as-Code)

There is no CMS and no database (ADR-002). All content is TypeScript in
`src/data/`, typed `as const`, and imported at build time. Editors change
data files; designers change components; neither touches the other's files.

### 7.1 The two data files

| File | Lines | Contents |
|---|---|---|
| `src/data/site.ts` | ~470 | `SITE` persona block (name, role, location, availability, email, description, URL, `contentUpdatedAt`); `NAV_LINKS` (4); `SOCIAL_LINKS` (3); `SERVICES` (6, with `estimatorId` links); `APPROACH_PRINCIPLES` (3); `AWARDS` (5); `BEYOND_WORK` (3); `PROCESS_STEPS` (5, services page — Discover/Strategy/Design/Refinement/Delivery); `FAQ_ITEMS` (6, services page); estimator config: `ESTIMATOR_SERVICES` (4), `COMPANY_STAGES` (4), `TIMELINES` (4, labels carry week ranges), `SCOPES` (3, "Core Essentials"). |
| `src/data/projects.ts` | ~430 | `PROJECTS` (8 case studies with `coverAspect` + `details[].aspect`; `featured: true` on 4), `FEATURED_PROJECTS` (derived filter), `getProject()`, `getNextProject()` (circular), `getMarqueeItems()` (24-item assembly with `shape` fields: 8 covers + 5 studio details + 11 typographic tiles). |

Both files have co-located contract tests (`src/data/*.test.ts`) that pin
the invariants below — content edits that break a contract fail the suite.

### 7.2 Procedures — "add one X" recipes (all verified against the code)

**Add a service** (3 files):
1. `src/data/site.ts` — append to `SERVICES` with `id`, `number` ("07"),
   `name`, `tagline`, `description`, `includes[]`, `bestFor`,
   `estimatorId` (an `EstimatorServiceId` or `null`).
2. Optional: if it should appear in the estimator, add to
   `ESTIMATOR_SERVICES` **and** extend the `EstimatorServiceId` union, then
   add the matching value to `PROJECT_TYPES` in `src/lib/contact.ts` and a
   label in `PROJECT_TYPE_LABELS` in `contact-form.tsx`.
3. Nothing else — `/services` renders from `SERVICES`; the home page shows
   the first three (`SERVICES.slice(0, 3)`).

**Add a case study** (1 file + images):
1. Choose the aspect — `PROJECTS` must keep alternating `landscape, portrait`
   in list order (tested); with 8 projects, a 9th takes `landscape`, a 10th
   `portrait`.
2. Drop the images: a cover at 4:5-croppable (`<slug>-portrait.webp`, 864×1152 renders at `aspect-[4/5]` with a ≈6% crop) for
   portrait slots or a landscape cover, plus detail images (wide/landscape
   from the shared pool, or a 4:5 portrait detail — `-portrait` naming
   is tested for featured portrait details). The cover doubles as the
   case hero, object-cropped to the uniform 7:3 banner.
3. `src/data/projects.ts` — append the `Project` object with `coverAspect`,
   two `details` (first = `wide`; second = `portrait` if featured, else
   `landscape`), and `featured: true` only for the home grid (keep exactly 4).
4. Nothing else — `/work`, `/work/[slug]` (SSG params), the sitemap, and the
   marquee covers all derive from `PROJECTS` (file-existence is tested).

**Add a marquee item** — either add a project (its cover joins
automatically) or edit the `detailItems` / `tileItems` arrays inside
`getMarqueeItems()`; keep the total at 24 so the −50 % loop stays seamless
(any even split works, but 24 keeps the visual density balanced).

**Change persona/contact details** — edit `SITE` in `site.ts`. The header,
footer, contact page, contact-form fallback strings, metadata, sitemap, and
robots all read from it (the email single-source was enforced in
remediation — every consumer interpolates `SITE.email`).

### 7.3 Invariants worth protecting

- `SERVICES.length === 6` is assumed by page copy ("Six practices, one
  standard of care"); `PROJECTS.length === 8` by "Eight projects, chosen with
  care". Prose in `page.tsx` files hard-states the counts; when data counts
  change, grep the pages for the spelled-out numbers.
- `PROJECTS` cover aspects strictly alternate landscape/portrait; featured
  projects' second detail is `portrait`, others `landscape`; first detail is
  always `wide` — all tested in `src/data/projects.test.ts`.
- Every `estimatorId` must exist in `ESTIMATOR_SERVICES` or be `null` — the
  services page branches on it.
- Marquee: exactly 24 items, ≥3 distinct shapes, duplicate half `aria-hidden`
  with `alt=""`, loop seam = two copies + `translateX(-50%)` (tested).
- `SITE.url` feeds sitemap/robots/metadata — set `NEXT_PUBLIC_SITE_URL` in
  production or every canonical URL points at localhost (silent SEO bug).
- `SITE.contentUpdatedAt` is the sitemap's `lastModified` (deterministic —
  tested); bump it when shipping meaningful content changes.

---

## 8. Accessibility Implementation

The target is WCAG 2.1 AA across the board with AAA contrast for primary
text pairs. What follows is what is *implemented*, not aspirational.

### 8.1 Color contrast (measured, not estimated)

Computed from the §4.1 tokens (relative luminance per WCAG 2.1):

| Pair | Light ratio | Dark ratio | Level |
|---|---|---|---|
| `foreground` on `background` (body text) | **16.69 : 1** | **16.74 : 1** | AAA |
| `muted-foreground` on `background` (secondary text, captions) | **4.55 : 1** | **7.30 : 1** | AA light / AAA dark |
| `pill-foreground` on `pill` (pill buttons, availability badge) | **16.69 : 1** | **16.74 : 1** | AAA |
| `background` on `foreground` (inverted CTA band) | **16.69 : 1** | **16.74 : 1** | AAA |

Two measured cautions:
- Light-mode `muted-foreground` (4.55:1) sits just above the 4.5:1 AA
  threshold. **Do not lighten it** (e.g. to `hsl(0 0% 50%)` drops to ~4.0:1
  — AA failure) and do not place it over `muted`/`accent` surfaces without
  re-measuring.
- `text-muted-foreground/60`-style opacity dips (placeholder text,
  `text-muted-foreground/70` in footer handles) fall *below* 4.5:1. They are
  used only for decorative/dismissible text; never use opacity-dimmed
  variants for meaningful copy.

### 8.2 Focus, keyboard, and forms

- **Focus ring:** a single global rule — `:focus-visible { outline: 2px
  solid currentColor; outline-offset: 3px }` — visible on both themes by
  construction (currentColor contrasts with the surface). Never remove it;
  never style `:focus` instead (mouse clicks would show rings).
- **Skip link / landmarks:** a skip-to-content link is the first focusable
  element in `<body>` (`sr-only` until focused, then an ink pill at
  `z-[60]`), targeting `<main id="main-content">`. Pages use semantic
  landmarks (`<header>`, `<main>`, `<footer>`, `<nav aria-label>`,
  `<article>` on case studies).
- **Mobile menu:** `aria-expanded` + `aria-controls="mobile-menu"` on the
  hamburger; focus moves to the first menu link on open; Escape (on the
  toggle or the menu) closes it and restores focus to the toggle; body
  scroll locked while open; links close on click.
- **Estimator:** `role="radiogroup"` + `role="radio"` + `aria-checked` per
  option; step dots are real buttons with `aria-current="step"`; the running
  total sits in an `aria-live="polite"` region so changes are announced.
- **Contact form:** `<label htmlFor>` on every field; errors rendered as
  `<p id="…-error">` wired via `aria-describedby` + `aria-invalid` on
  **every** field including both `<select>`s; server-side field errors merge
  into the same map; top-level failures use `role="alert"`; success replaces
  the form with `role="status"`.
- **Honeypot** is `aria-hidden`, offscreen at `-left-[9999px]`,
  `tabIndex={-1}`, `autoComplete="off"` — invisible to humans and AT.

### 8.3 Images and media

Every content image has real alt text (portraits, covers, detail shots —
written per-image in `projects.ts`). Decorative duplicates in the marquee
loop carry `alt=""` + `aria-hidden`. Icons are `aria-hidden="true"`. The
theme toggle exposes its state through `aria-pressed` + dynamic
`aria-label` rather than visual-only indication.

### 8.4 Motion safety

`@media (prefers-reduced-motion: reduce)` in `globals.css`:
- `html { scroll-behavior: auto }` (no smooth scrolling),
- `.animate-marquee { animation: none !important }` (strip freezes — content
  remains legible),
- `[data-reveal] { opacity: 1 !important; transform: none !important }`
  (reveal wrappers can never trap content in the hidden state).

The `!important` flags are deliberate — they override the utility classes
that express the hidden state. This is the CSS half of the Reveal contract;
the JS half is §6.2. **No-JS coverage (ADR-007):** the same forced-visible
rules run under `html:not(.js)` (the boot script adds `js` pre-paint) and
`@media (scripting: none)` — scripting-disabled visitors and non-rendering
crawlers always see full content. Both guards are pinned by
source-reading tests (`src/lib/reveal-guard.test.ts`).

---

## 9. Anti-Patterns & Common Bugs

Each entry: symptom → root cause → status. Fixed items link their lesson in
§12. Entries are the bugs an agent is *most likely to reintroduce*.

### Fixed during the initial build

**B-1. `Reveal` makes full-page screenshots look blank (Medium).**
Symptom: headless-browser screenshots show empty sections; VLM QA flags
"missing content". Root cause: `Reveal` keeps content `opacity-0` until the
IntersectionObserver fires — a viewport-only screenshot never triggers
below-the-fold reveals. Fix/protocol: scripted scrolling before
screenshots (the smoke script and §Appendix C methodology). Lesson L3.

**B-2. React-hooks lint failures on menu/theme state (Medium).**
Symptom: `eslint` errors — set-state-in-effect / missing dependency chains in
`site-header.tsx` and `theme-toggle.tsx`. Root cause: syncing React state to
DOM/class changes inside effects. Fix: mobile menu closes in `onClick`
handlers, not effects; theme toggle rewritten with `useSyncExternalStore`
(§6.1). Lesson L4.

**B-3. Dark-mode flash on load (would have been High).**
Symptom: wrong-scheme flash before hydration. Root cause: server HTML can't
know the stored theme. Fix: inline pre-hydration script in `layout.tsx`
reading `localStorage`/`prefers-color-scheme` and toggling the class on
`<html>` before paint (§15.5). Prevented, never shipped.

**B-4. Hydration mismatch from random texture (would have been High).**
Symptom: React hydration errors on the collage char block if `Math.random`
were used. Fix: deterministic seeded LCG (`src/lib/char-block.ts`), identical
SSG/client output (ADR-005). Lesson L6.

### Fixed during remediation pass 1 (2026-09-13)

**B-5. No-JS content invisibility (High → fixed).** Symptom: scripting-disabled
visitors and naive crawlers saw a hero-only page. Root cause: reveal hidden
state had no scripting-disabled fallback. Fix: dual fail-open CSS guards +
boot-script `js` class (ADR-007, §8.4); source-reading tests pin it. Lesson L9.

**B-6. Hardcoded email fallbacks (Medium → fixed).** `contact-form.tsx`
duplicated `studio@elenavance.com` in two strings instead of reading
`SITE.email`. Fix: interpolate `SITE.email`; the single-source is now
complete. Lesson K-2 closed.

**B-7. Select-field error wiring (Medium → fixed).** The two `<select>`s
lacked `aria-describedby`/`aria-invalid` and their error `<p>`s lacked ids.
Fix: identical wiring to the text fields. Verified by probe.

**B-8. Estimator option-render duplication (Medium → fixed).** Four
near-identical JSX blocks (~90 lines) risked copy-paste drift. Fix: one
generic renderer over `OPTION_SETS` keyed by step; probe-verified identical
behavior ($33k–$55k default → $44k–$88k). Lesson L11.

### Known issues (open at v2.0.0)

| ID | Severity | Issue | Where |
|---|---|---|---|
| K-5 | Medium | ~2.4 MB imagery with no responsive variants (ADR-006 trade; WebP pass landed with a measured ~9% gain — an optimizer host can do better) | `public/images/` |
| K-7 | Low | In-memory rate limiter resets per process/serverless instance (accepted for scope; swap for Upstash/Redis if deployed multi-instance) | `rate-limit.ts` |
| K-9 | Low | Marquee `figcaption` labels render visibly on the duplicated loop half (intended seam aesthetic; aria-hidden handles AT) | `marquee.tsx` |
| K-10 | Low | No CI pipeline — the §11 gates and probe scripts are local-first by scope | repo |

Resolved in pass 1: K-1 (no-JS reveal → ADR-007), K-2 (email single-source),
K-3 (select wiring), K-4 (estimator DRY), K-6 (skip link), K-8 (per-page OG
images); P-3 aspect-crop mismatches resolved by ADR-008's data-driven
aspects; C-3 sitemap `lastmod` now deterministic (`SITE.contentUpdatedAt`).

### Generic framework gotchas encountered here

- **Vitest + path alias**: tests import `@/data/site` — works because
  `vitest.config.ts` mirrors the `@/*` alias; forgetting that mirror yields
  "cannot resolve module" that `tsc` does not predict.
- **Next 16 async APIs**: `params` and `searchParams` are **Promises** in
  page components (`const { slug } = await params`) — the type in
  `work/[slug]/page.tsx` is `{ params: Promise<{ slug: string }> }`. Typing
  them synchronously is a compile error, and `await`-ing them is mandatory.
- **CSP vs Next inline script**: the RSC payload + theme script require
  `script-src 'unsafe-inline'`; removing it breaks the app (see §3 gotcha).
- **`next/image` with `unoptimized: true`** still enforces `width`/`height`
  discipline — omitting them still errors at build.

---

## 10. Debugging Guide

Symptom → cause → fix, ordered by how often each actually occurred in this
repo's history.

### Build failures

| Symptom | Cause | Fix |
|---|---|---|
| `bun install` postinstall warning / unrs-resolver blocked | Bun blocks unrecognized postinstalls | Already trusted via `trustedDependencies`; if re-cloning fails, `bun install --trust unrs-resolver` |
| `Error: font … not found` / FOUT at boot | `next/font/google` cache cold or network blocked | Fonts self-host at build; if offline, the build fails loudly — retry on network. Never "fix" by linking Google Fonts CDN (CSP forbids it) |
| ESLint: `React Hook "useState" cannot be called … set-state-in-effect` | Effect-based DOM sync (B-2) | Move to event handlers or `useSyncExternalStore` (§6.1) |
| `next build` type error on `params` | Next 16 async params (see §9 gotchas) | `await params` / type them as `Promise<…>` |

### Runtime errors

| Symptom | Cause | Fix |
|---|---|---|
| Hydration mismatch mentioning `<pre>` / class differences | Non-deterministic render in SSG (B-4 pattern) | Use seeded generators (`char-block.ts`) or `suppressHydrationWarning` *only* where the theme script legitimately mutates pre-paint markup (`<html>`) |
| `RangeError: Unknown estimator …` in console | `estimateRange` called with ids not in the config tables | Fail-fast by design — the caller (UI) must only emit table ids; check `ESTIMATOR_SERVICES`/`COMPANY_STAGES`/`TIMELINES`/`SCOPES` for the id you passed |
| Contact form submits but shows "Something went wrong" | API returned non-202/400/429, or fetch threw | Inspect `/api/contact` response; check server logs for the structured `contact_inquiry` line |
| 429 from the contact API in dev | 5-requests-per-10-min window hit | Restart the dev server (in-memory limiter) or wait 10 min |

### Test failures

| Symptom | Cause | Fix |
|---|---|---|
| Rounding assertions fail after editing multipliers | `estimateRange` rounds each bound to the nearest $1,000 independently (30 000×1.716 = 51 480 → 51 000, not 51 480) | Update the *test* expectation from computed math, or revert the multiplier — never bend the code to a guessed expectation (lesson L7) |
| "Cannot find module @/…" in vitest only | Alias missing in `vitest.config.ts` | Mirror the `@` alias (§3) |

### Visual/styling issues

| Symptom | Cause | Fix |
|---|---|---|
| Sections blank in screenshots/crawlers | Reveal pattern (B-1) / K-1 | Scroll before screenshot; for crawlers see K-1 remediation |
| Wrong colors in dark mode | Token added to `:root` but not `.dark`, or raw hex used instead of token | Every token must exist in both themes and be mapped in `@theme inline` (§4.1) |
| Hover underline doesn't animate | `.link-underline` only animates under `@media (hover: hover)` (touch-safe by design) | Test with a mouse; on touch it is instant — intended |
| Header overlaps anchor targets | `scroll-padding-top` changed or header height changed | Keep `scroll-padding-top: 5rem` in sync with header `h-20` |
| Marquee jumps/seams | Item count or duplication changed | Render the sequence exactly twice and keep `translateX(-50%)` (§4.3); uneven items still seam if per-item widths differ — they're fixed `w-64` |

### Live-site verification

`curl -s localhost:3000/api/health` → `{"ok":true,…}`;
`curl -sI localhost:3000/ | grep -i content-security-policy` (headers);
`curl -s localhost:3000/sitemap.xml | head` (canonical URLs use
`NEXT_PUBLIC_SITE_URL`). Full methodology: Appendix C.

---

## 11. Pre-Ship Checklist

Run in order; **any red = stop**. These gates caught real bugs in this
repo's history (B-1, B-2, L7).

```bash
bun run lint        # 1. eslint . — zero warnings tolerated
bun run typecheck   # 2. tsc --noEmit — strict (includes e2e/ specs)
bun run test        # 3. vitest run — 44/44 (count grows with new tests)
bun run build       # 4. next build — expect "20 routes" / 0 errors
bun run e2e:all     # 5. playwright — 81/81 against the fresh production build
```

**5. Structural invariants** (copy-paste):
```bash
cd design-brand-strategy
grep -rn "from \"@/app" src/components src/lib src/data        # empty = layers intact
grep -rn "rounded-\(lg\|xl\|2xl\|md\)" src                     # empty = radius contract intact
grep -rn "shadow" src                                          # empty = no shadows crept in
grep -rn "hsl(\|#[0-9a-fA-F]\{6\}" src --include="*.tsx"       # only tokens, no raw colors (icon.svg excluded by tsx filter)
grep -c "use client" src/components/*.tsx | grep -v ":0"        # exactly 5 files expected today
ls public/images | wc -l                                       # 19 images expected today (WebP)
rg -rn "\.png" src --include=*.ts --include=*.tsx            # empty = WebP migration intact
```

**6. Runtime smoke** (prod server, API contract, headers, screenshots):
```bash
bash /home/z/my-project/scripts/smoke_test.sh   # starts :3001, checks health,
                                                # 202/400 contact contract, all
                                                # routes 200, CSP headers, 6 shots
```
Expect: health `ok:true`; valid contact → `202` + `{"ok":true…}`; invalid →
`400` + field errors; every page route `200`; CSP/X-Frame/Referrer/HSTS
headers present; screenshots non-blank **after the script's scroll step**.
(The e2e suite in step 5 now covers most of this mechanically; the script
remains the human-friendly sweep.)

**7. Content sanity:** `SITE.url` matches the deployment origin; featured
count = 4; every `estimatorId` non-null value exists in `ESTIMATOR_SERVICES`.

**8. Git gates:** work committed on `main` (no feature branches, operator
contract); `git status` clean after commit; remote verified post-push.

---

## 12. Lessons Learnt & How to Avoid Them

Numbered lessons from the build of this repository (git history: `e0e339f`
stub → `421d23a` site → `f014842` docs).

**L1. Scaffold from a proven foundation, not `create-next-app` defaults.**
The five config files were copied from a battle-tested sibling repo
(tsconfig, eslint flat config, vitest, postcss, next.config patterns), which
eliminated a day of toolchain tuning. When starting a sibling project, clone
*this* repo's config set the same way — the §11 gates exist precisely
because the toolchain is known-good as a set.

**L2. Sandboxed background processes get reaped — run generation in
foreground batches.** The image-generation script silently produced nothing
when backgrounded; foreground batches of parallel jobs worked. Applies to
any long-running tool spawned from this environment.

**L3. Scroll before you screenshot.** The single biggest false-negative in
visual QA here was "sections are missing" — they were `opacity-0` pending
IntersectionObserver (B-1). Any future visual audit must script scrolling
first (Appendix C). The underlying pattern: a site whose animation model
hides content until observed cannot be judged from static HTML dumps.

**L4. Let the linter force the right architecture.** Two eslint
react-hooks failures led to genuinely better code (event-handler-driven menu
close; `useSyncExternalStore` theme store). The instinct to suppress those
rules is the anti-pattern; the rules were catching real future-bugs.

**L5. Rebase onto the remote instead of force-pushing over owner history.**
The GitHub repo had a prior stub commit; rebasing the new work onto
`origin/main` preserved the owner's commit and still delivered clean
history. Force-push would have destroyed trust and audit trail.

**L6. Determinism beats suppression for hydration-sensitive decorative
content.** The char block *could* have been `suppressHydrationWarning`-ed;
instead a seeded LCG makes server and client output byte-identical (ADR-005),
which also keeps the texture stable across reloads (it's a brand asset, not
noise). Reserve suppression for the one place it's unavoidable (the theme
class on `<html>`).

**L7. Test expectations are computed, not remembered.** During the first
test run one estimator expectation was wrong (rounding behavior); the fix was
to recompute from the algorithm (30 000×1.716 → 51 480 → **51 000**, and
28 800 → **29 000** — `Math.round` to nearest $1k, per bound, independently)
and encode that. Never edit code to match a remembered number without
re-deriving it.

**L8. Document the deliberate absences.** "No database, no animation
library, no component library" is load-bearing architecture (ADR-002, §1).
Every future agent's instinct will be to add them; the docs (README, PAD,
this file) exist to say *why not* with reasons, so the decision is
re-argued on merits, not undone by default.

**L9. Hidden-until-observed content is a robustness bug, not just a QA
quirk.** The reveal pattern's screenshot artifact (L3) turned out to be the
symptom of a real defect: without JavaScript the page was hero-only. The fix
was CSS-only and fail-open (ADR-007) — no JS surface changed, and the guards
are pinned by source-reading tests. General rule: any pattern that hides
content by default needs a scripting-disabled escape hatch *and* a test that
keeps it.

**L10. Measure the optimization before claiming it.** The WebP pass was
planned with a ~60% estimate and delivered a measured 9% (2694 kB → 2442 kB)
— these editorial images were already efficiently compressed. The decision
to keep WebP stands on the measurement (equal-or-smaller, modern format), and
the honest number is recorded everywhere rather than the estimate. Same
discipline as L7: numbers are computed, not remembered.

**L11. Collapse N-identical render blocks into one data-keyed renderer.**
The estimator's four copy-pasted option blocks were ~90 lines of drift risk.
The refactor — `OPTION_SETS: Record<StepKey, ReadonlyArray<EstimatorOption>>`
plus one generic renderer with a conditional price column — removed the risk
with zero behavior change, proven by re-running the interaction probe
(identical totals) rather than trusting the refactor.

**L12. Aspect orientation belongs to content, not layout.** Trying to build
the mixed-aspect grid with CSS `nth-child` rules would have cropped random
images; instead `coverAspect`/`aspect`/`shape` became typed data fields with
invariant tests (alternation, file existence, naming), and components merely
map them to classes. When layout must reflect *which image* is shown, the
data layer is the only honest owner.

**L13. Parity is measured, never assumed — probe rendered geometry, not DOM
order.** The original build assumed the source's estimator was a four-step
wizard (an inference from the JS bundle) and read the home featured grid
from DOM order; both were wrong. The pass-2 audit probed *rendered bounding
boxes* on the live source (button positions and y-coordinates revealed a
static all-groups form; grid placement revealed L,P/L,P) and every fix then
mapped to a number. When replicating a design, extract geometry
(`getBoundingClientRect`, computed styles, intrinsic vs rendered ratios)
from the running page — screenshots and VLM verdicts are useful triage, but
numbers are the contract. And after fixing, re-probe: the shipped fix is
only real when the measurement matches.

---

## 13. Pitfalls to Avoid

"Don't do this → do this instead", scoped to this codebase. (Rubric for
reviewing changes; pairs with §16.)

**Architecture**
- Don't add a database/CMS for "just a bit of content" → change the data
  files (§7). The content layer is code on purpose (ADR-002).
- Don't import `@/app/…` from components or `@/components/…` from libs →
  keep the four-layer rule (§5.1); check with the §11 grep gates.
- Don't put business logic in page components → pure functions in
  `src/lib/` with unit tests (`estimator.ts` is the model).

**TypeScript**
- Don't widen ids to `string` in new code → mirror the existing style:
  literal-union ids (`EstimatorServiceId`) where the set is closed,
  `string` only where the set is open (stage/timeline/scope ids are
  data-driven and validated at runtime).
- Don't `as any` / `@ts-ignore` → the codebase has zero suppressions; if a
  type fights you, the design is telling you something (L4).
- Don't default-export components → named exports everywhere (§5.5).
- Don't drop `as const` from data arrays → the const-assertion is what makes
  `SERVICES`/`PROJECTS` deeply readonly and their id unions closable.

**React / Next.js**
- Don't sync DOM state in `useEffect` → event handlers or
  `useSyncExternalStore` (B-2/L4).
- Don't read `params`/`searchParams` without `await` → Next 16 makes them
  Promises (§9 gotchas).
- Don't add `"use client"` to a page or big subtree for one small
  interaction → push the island down (§5.3).
- Don't use `<a>` for internal navigation → `next/link` (only mailto/social
  are `<a>` here).

**Styling**
- Don't create `tailwind.config.ts` → Tailwind 4 CSS-first; tokens live in
  `globals.css` `@theme inline` (§4). A config file will silently *not* be
  loaded the way you expect with `@tailwindcss/postcss`.
- Don't write raw colors (`text-[#737373]`, `text-neutral-500`) → token
  utilities only (`text-muted-foreground`); §11 gate 5 greps for this.
- Don't add radii/shadows (§4.5, §1 rules 1–2).
- Don't use `dark:` variants with hardcoded colors → the `@custom-variant
  dark` + CSS-variable tokens already flip every utility; new colors go in
  both `:root` and `.dark`.
- Don't "fix" marquee seamlessness by animating to a fixed pixel offset →
  the −50 % two-copies contract (§4.3).

**Testing**
- Don't write tests that mock the component tree → this repo tests pure
  logic (node environment, no jsdom); DOM behavior is covered by the smoke
  script (Appendix C).
- Don't add a test file with JSX in a `.ts` → include pattern is
  `src/**/*.test.ts`; JSX tests would need `environment` + config changes —
  prefer extracting the logic to a pure function instead.

**Security**
- Don't read `process.env` in components → env is read once in
  `src/data/site.ts`; pass values down as data.
- Don't bypass `contactSchema` ("just this one field") → every mutation of
  the form contract goes through the shared schema (ADR-004) and updates
  both consumers + tests in the same change.
- Don't log full message bodies → the API logs lengths and enums, not free
  text (`messageLength`), a deliberate PII posture.
- Don't trust `x-forwarded-for` as identity → `clientKey()` is best-effort
  rate-limit keying only (K-7).

**Performance**
- Don't `import` from `lucide-react` barrel in a way that pulls the icon
  font… (not applicable — lucide is SVG components; but do keep imports
  named and tree-shaken as they are today).
- Don't set `priority` on below-the-fold images → only hero portrait and
  case cover (§5.5).
- Don't add web fonts by `<link>` → `next/font` only (CSP + CLS, §3).

---

## 14. Best Practices

Conventions that are enforceable (and enforced — see §11 gates) in this repo:

1. **Content-as-code with typed data** — every string a user can read lives
   in `src/data/`, typed, `as const`, and imported where rendered. Copy
   edits never touch JSX (§7).
2. **Pure logic in `src/lib/`, proven by unit tests** — the estimator is the
   exemplar: pure function, fail-fast `RangeError`s, 9 tests including edge
   rounding and invalid-id throws. New logic follows the same shape.
3. **One schema, two enforcement points** — shared zod schema at the client
   (UX) and the API (authority); flatten with `fieldErrors()` for identical
   error maps on both sides (ADR-004).
4. **Fail fast on programmer errors, degrade gracefully on user errors** —
   `estimateRange` throws `RangeError` on unknown ids (programming error);
   the API returns friendly 400/429 JSON for user input problems.
5. **CSS-only animation; motion behind media queries** — no animation JS,
   reduced-motion honored centrally in CSS (§8.4).
6. **Tokens over values, both themes, one file** — the §4.1 contract; gate 5
   of §11 verifies it.
7. **Accessibility as structure, not garnish** — semantic landmarks, real
   labels, aria state on every interactive widget (§8.2); new components
   inherit the bar.
8. **Named exports, `type` imports for types** (`import type { Project }`),
   `interface` for object shapes, unions for closed id sets.
9. **Security headers travel with the app** — `next.config.ts` is the source
   of truth, so any Node host is hardened by default (§3).
10. **Docs are part of the change** — any change that alters tokens,
    counts, routes, or contracts updates `README.md`, the PAD, and this
    SKILL.md in the same commit (§6 of the meta-skill; the drift check in
    Appendix B catches laziness).

---

## 15. Coding Patterns

Copy-pasteable, verbatim from the codebase (they compile as-is).

### 15.1 Pure domain function (fail-fast)

```typescript
// Location: src/lib/estimator.ts
export function estimateRange(selection: EstimatorSelection): EstimateRange {
  const service = ESTIMATOR_SERVICES.find((s) => s.id === selection.serviceId);
  // …find stage / timeline / scope…
  if (!service) throw new RangeError(`Unknown estimator service: ${selection.serviceId}`);
  // …three more fail-fast guards…
  const multiplier = stage.multiplier * timeline.multiplier * scope.multiplier;
  return {
    low: roundToNearest(service.baseLow * multiplier, ROUND_TO),
    high: roundToNearest(service.baseHigh * multiplier, ROUND_TO),
    multiplier: Number(multiplier.toFixed(4)),
  };
}
```
Rules embodied: config tables in data, validation by throw, presentation
formatting separate (`formatCompactUsd`/`formatRange`).

### 15.2 Minimal client island (Reveal)

```tsx
// Location: src/components/reveal.tsx (abridged)
"use client";
export function Reveal({ children, variant = "text", delay = 0, className }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries)
        if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: "0px 0px -10% 0px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} data-reveal="" style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
      className={["transition-all duration-300 ease-out",
        visible ? "translate-y-0 scale-100 opacity-100" : `opacity-0 ${HIDDEN_VARIANT[variant]}`,
        className ?? ""].join(" ")}>
      {children}
    </div>
  );
}
```
Server children stay server-rendered; only the wrapper is a client
component; `data-reveal` is the CSS reduced-motion hook (§8.4).

### 15.3 External-store subscription (theme)

```tsx
// Location: src/components/theme-toggle.tsx (abridged)
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
const dark = useSyncExternalStore(subscribe,
  () => document.documentElement.classList.contains("dark"),
  () => false);
```
The DOM *is* the store; server snapshot is the safe default.

### 15.4 API route contract (validate → act → structured log)

```typescript
// Location: src/app/api/contact/route.ts (abridged)
export async function POST(request: Request) {
  if (!rateLimit(clientKey(request), LIMIT, WINDOW_MS))
    return NextResponse.json({ ok: false, message: "…" }, { status: 429, headers: { "Retry-After": "600" } });
  const body: unknown = await request.json().catch(() => null);
  if (body === null || typeof body !== "object")
    return NextResponse.json({ ok: false, message: "Malformed request body." }, { status: 400 });
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 400 });
  console.info(JSON.stringify({ level: "info", event: "contact_inquiry", /* … */ }));
  return NextResponse.json({ ok: true, message: "…" }, { status: 202 });
}
```
Order matters: rate-limit first (cheap), parse before validate, validate
before side effects, side effect is a single structured log line, 202 (not
200) because delivery is decoupled.

### 15.5 No-flash theme boot script

```tsx
// Location: src/app/layout.tsx
const themeScript = `(function(){try{var stored=localStorage.getItem("theme");
var dark=stored?stored==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;
document.documentElement.classList.toggle("dark",dark)}catch(e){}})()`;
// rendered first in <head> via <script dangerouslySetInnerHTML={{ __html: themeScript }} />
```
Runs before paint; `try/catch` covers storage-less browsers; `<html
suppressHydrationWarning>` covers the class diff.

### 15.6 Bounded in-memory rate limiter

```typescript
// Location: src/lib/rate-limit.ts (abridged)
const MAX_BUCKETS = 10_000;
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt < now) {
    if (buckets.size >= MAX_BUCKETS) sweepExpired(now);   // bounded memory
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}
```
The sweep-at-cap design is what makes an in-memory limiter safe against
spoofed-header floods (memory can't grow unbounded).

### 15.7 Deterministic seeded generator (hydration-safe texture)

```typescript
// Location: src/lib/char-block.ts (abridged)
const LCG_A = 1664525, LCG_C = 1013904223, LCG_M = 2 ** 32;
export function seededCharBlock(seed: number, rows: number, cols: number): string {
  let state = Math.floor(Math.abs(seed)) % LCG_M || 1;
  // … per row/col: state = (A*state + C) % M; pick CHARSET[state / M * len]
}
```
Same seed → same bytes on server and client (ADR-005). Use this pattern for
any decorative-but-hydration-visible randomness.

---

## 16. Coding Anti-Patterns

Concrete don't/do pairs (project-specific — the ones a reviewer here should
reject on sight):

```tsx
// ❌ Raw color + one-theme token
<p className="text-gray-500 dark:text-gray-400">…
// ✅ Token utilities (already theme-aware)
<p className="text-muted-foreground">…

// ❌ Rounded + shadowed card (breaks §1 rules 1–2)
<div className="rounded-xl bg-white p-6 shadow-lg">…
// ✅ Hairline + square
<div className="border border-border bg-muted p-6">…

// ❌ Effect-synced DOM state (B-2)
useEffect(() => { setDark(document.documentElement.classList.contains("dark")); }, []);
// ✅ External store (§15.3)
const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

// ❌ Sync params access (Next 16)
export default function Page({ params: { slug } }) { … }
// ✅ Awaited params
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; … }

// ❌ Duplicate validation logic at the boundary
if (typeof body.email === "string" && body.email.includes("@")) …
// ✅ Shared schema (ADR-004)
const parsed = contactSchema.safeParse(body);

// ❌ Hardcoded persona strings
<p>email studio@elenavance.com directly</p>   // (this exists — K-2, being fixed)
// ✅ Data-driven
<p>email {SITE.email} directly</p>

// ❌ <a> for internal routes
<a href="/work">Work</a>
// ✅ next/link
<Link href="/work">Work</Link>
```

---

## 17. Responsive Breakpoint Reference

Tailwind 4 **default scale, zero customization** (no `screens` config — there
is no config file at all):

| Breakpoint | Min width | Used for |
|---|---|---|
| (base) | 0 px | Single column everywhere; hamburger menu; stacked cards; full-width images |
| `sm` | 640 px | Minor two-ups: estimator option grid (`sm:grid-cols-2`), form field pairs, case detail images (`sm:grid-cols-2`), award rows (`sm:grid-cols-12`) |
| `md` | 768 px | **The editorial breakpoint** — everything structural happens here: 12-col grids activate (hero 7/5, case 8/3, services 5/6, contact 4/7), desktop nav replaces hamburger (`md:hidden` ↔ `hidden md:flex`), container padding steps `px-6 → px-10`, section paddings scale, mobile menu unmounts |
| `lg` | 1024 px | Container padding `px-10 → px-16`; footer column starts (`lg:col-start-8`) |

Usage patterns worth copying:
- **Mobile-first with one structural breakpoint.** Base = the stacked
  "reading" layout; `md:` = the 12-column editorial layout. Intermediate
  states are deliberately rare (only `sm:` pairs noted above).
- **Fluid display type via `clamp()`, not breakpoint font swaps:**
  `text-[clamp(2.5rem,6vw,4.5rem)]` (page H1), `clamp(3rem,8vw,6.5rem)`
  (hero), `clamp(2.75rem,7vw,5.5rem)` (case title), `clamp(2.25rem,5vw,4rem)`
  (next-project), `clamp(3rem,6vw,4.5rem)` (poster). Pair with
  `leading-[1.02–1.05]` + `tracking-tight`.
- **Mobile menu is a full-height overlay** (`h-[calc(100dvh-5rem)]` under the
  80 px header) with serif 4xl links — not a dropdown. `100dvh` (not `vh`)
  keeps mobile browser chrome from clipping it.
- **Mobile testing:** the overlay menu, the estimator's 2-col option grid at
  `sm`, and the case-study sticky sidebar (which simply stacks on mobile) are
  the three layouts to check at 375 px width.

## 18. Z-Index Layer Map

The site uses **two** z-index values:

| Value | Element | Location | Purpose |
|---|---|---|---|
| `z-50` | `<header>` (sticky) | `site-header.tsx` | Translucent sticky header over page content while scrolling |
| `z-[60]` | skip link (on focus only) | `layout.tsx` | The skip-to-content pill must sit above the sticky header when focused |

No portals, no modals, no dropdowns, no toasts. The mobile menu is *inside*
the header element (a sibling row, not an overlay portal) so it inherits the
header's stacking context. The skip link is `sr-only` (out of flow) until
focused, so `z-[60]` only ever matters at keyboard focus time.

**Rules for keeping it this way:**
- New fixed/sticky UI must justify its layer and take the next free slot
  (`z-40`, then `z-30`) — document it here when you add one.
- Never introduce a portal (`createPortal`) without a stacking-context plan;
  the current architecture has none, and the header's `backdrop-blur-md`
  creates a containing block that portals would escape.
- If two layers must coexist, the page content always loses — content never
  sets z-index.

## 19. Color Reference (Complete)

Every color token in the system (transcribed from `globals.css`, hex computed
from the HSL definitions; see §8.1 for contrast ratios):

**Light theme (`:root`)**

| Token | HSL | Hex | Tailwind utility | Usage |
|---|---|---|---|---|
| `--background` | `hsl(45 20% 98%)` | `#fbfaf9` | `bg-background` | Page background (cream paper) |
| `--foreground` | `hsl(0 0% 10%)` | `#1a1a1a` | `text-foreground`, `bg-foreground` | Ink: display type, primary UI, inverted bands/buttons |
| `--muted` | `hsl(45 8% 92%)` | `#ecebe9` | `bg-muted` | Soft surfaces: estimator selected options, running-total band, alert box |
| `--muted-foreground` | `hsl(0 0% 45%)` | `#737373` | `text-muted-foreground` | All secondary text: body, labels, captions, nav inactive |
| `--accent` | `hsl(40 10% 88%)` | `#e3e1dd` | `bg-accent` | Char-block card background (only consumer) |
| `--accent-foreground` | `hsl(0 0% 10%)` | `#1a1a1a` | `text-accent-foreground` | Text on accent (defined, currently unused) |
| `--border` | `hsl(40 10% 88%)` | `#e3e1dd` | `border-border` | Every hairline rule on the site |
| `--pill` | `hsl(0 0% 10%)` | `#1a1a1a` | `bg-pill` | Availability pill, inverted CTAs on light |
| `--pill-foreground` | `hsl(45 20% 98%)` | `#fbfaf9` | `text-pill-foreground` | Text on pill |

**Dark theme (`.dark`)**

| Token | HSL | Hex | Utility | Usage |
|---|---|---|---|---|
| `--background` | `hsl(0 0% 8%)` | `#141414` | `bg-background` | Page background |
| `--foreground` | `hsl(45 20% 95%)` | `#f5f4f0` | `text-foreground`, `bg-foreground` | Display type, inverted bands (dark mode inverts to cream bands) |
| `--muted` | `hsl(0 0% 14%)` | `#242424` | `bg-muted` | Soft surfaces |
| `--muted-foreground` | `hsl(0 0% 64%)` | `#a3a3a3` | `text-muted-foreground` | Secondary text |
| `--accent` | `hsl(0 0% 16%)` | `#292929` | `bg-accent` | Char-block card |
| `--accent-foreground` | `hsl(45 20% 95%)` | `#f5f4f0` | `text-accent-foreground` | (unused) |
| `--border` | `hsl(0 0% 20%)` | `#333333` | `border-border` | Hairlines |
| `--pill` | `hsl(45 20% 95%)` | `#f5f4f0` | `bg-pill` | Pills/CTAs |
| `--pill-foreground` | `hsl(0 0% 8%)` | `#141414` | `text-pill-foreground` | Text on pill |

**Forbidden colors (enforced by §11 gate 5):** any hex/hsl literal in
`src/**/*.tsx`, any Tailwind palette class (`gray-*`, `neutral-*`,
`slate-*`, `blue-*`, …), any opacity-modified foreground for meaningful text
beyond the two sanctioned decorative dips (`/60` placeholders, `/70`
footnotes/handles). **The singular exceptions:** `text-foreground/80` on the
char-block `<pre>` (decorative texture, intentionally attenuated) and the
inverted-band opacity treatment (`opacity-70` on sub-text within
`bg-foreground` bands), both of which remain ≥4.5:1 in both themes.
Selection color and focus rings derive from tokens by construction
(`::selection`, `currentColor`).

No chart palette, no gradients, no alpha-tinted brand colors exist. The
"signature color" of this site *is* the cream/ink pairing itself.

## 20. The Complete TypeScript Interface Reference

Every exported type in the codebase (verify against source before relying on
field names):

```typescript
// src/data/projects.ts
export type Project = {
  slug: string;            // kebab-case, unique — drives /work/[slug] SSG
  title: string;           // display title
  client: string;          // client name (sidebar + header meta)
  year: string;            // "2024" — rendered tabular
  sector: string;          // sidebar category
  location: string;        // "Portland, OR"
  summary: string;         // card + case header lede + meta description
  cover: string;           // "/images/<slug>[-portrait].webp"
  coverAlt: string;        // real alt text
  coverAspect: "landscape" | "portrait";  // render orientation (ADR-008; alternates in list order — tested)
  services: string[];      // rendered " · " on cards, ", " in sidebar
  deliverables: string[];  // sidebar list
  overview: string[];      // case body paragraphs (rendered in order)
  challenge: string;       // "The challenge" section
  solution: string;        // "The approach" section
  outcome: string;         // "After launch" pull-quote block
  details: ReadonlyArray<{
    src: string; alt: string; caption: string;
    aspect: "wide" | "landscape" | "portrait";  // first detail is always "wide" (tested)
  }>;
  featured: boolean;       // surfaces on home (keep exactly 4 true)
};

// src/data/site.ts
export type Service = {
  id: string;                          // kebab-case; also the #anchor on /services
  number: string;                      // "01"–"06" editorial index
  name: string; tagline: string;       // name + serif italic tagline
  description: string;
  includes: string[];                  // "What's included" list
  bestFor: string;
  estimatorId: EstimatorServiceId | null;  // links service → estimator
};
export type EstimatorServiceId =
  | "brand-identity" | "visual-design-system" | "art-direction" | "brand-guidelines";

// Estimator config rows (all ReadonlyArray):
{ id: string; label: string; multiplier: number }   // COMPANY_STAGES, TIMELINES, SCOPES
{ id: EstimatorServiceId; label: string; baseLow: number; baseHigh: number }  // ESTIMATOR_SERVICES

// src/lib/estimator.ts
export type EstimatorSelection = {
  serviceId: EstimatorServiceId;
  stageId: string; timelineId: string; scopeId: string;
};
export type EstimateRange = {
  low: number; high: number;      // each rounded to nearest $1,000
  multiplier: number;             // combined, 4-decimal precision
};

// src/lib/contact.ts
export type ContactInput = z.infer<typeof contactSchema>;
// = { name: string; email: string; company?: string; projectType: ProjectType;
//     budget: BudgetRange; message: string; referral?: string }
// where ProjectType ∈ PROJECT_TYPES (7 values), BudgetRange ∈ BUDGET_RANGES (5 values)
export const PROJECT_TYPE_LABELS: Record<ProjectType, string>;   // exhaustive vs enum (tested)
export const BUDGET_LABELS: Record<BudgetRange, string>;         // exhaustive vs enum (tested)
export function fieldErrors(error: z.ZodError): Record<string, string>;

// src/lib/rate-limit.ts
export function rateLimit(key: string, limit: number, windowMs: number): boolean;
export function clientKey(request: Request): string;

// src/lib/char-block.ts
export function seededCharBlock(seed: number, rows: number, cols: number): string;

// Marquee item union (inferred from getMarqueeItems() return):
type MarqueeItem =
  | { kind: "image"; src: string; alt: string; label: string; shape: "tall" | "wide" | "landscape" }
  | { kind: "tile";  label: string; sub: string };   // tiles render square (h-44 w-44)

// Page prop types (Next 16 — async params):
type CasePageProps  = { params: Promise<{ slug: string }> };
type ContactPageProps = { searchParams: Promise<{ service?: string }> };
```

---

## Appendix A: Architecture Decision Records

Ten ADRs govern this codebase (full narratives in
`Project_Architecture_Document.md` §1; the SKILL-level summary):

| ADR | Decision | One-line rationale | What it forbids |
|---|---|---|---|
| ADR-001 | Next.js 16 App Router | Hybrid static site + two API routes; RSC-first | Pages Router, client-side rendering by default |
| ADR-002 | No database — content-as-code | 8 projects + 6 services change monthly at most; TS data files are typed, diffable, zero-infra | Adding a DB/CMS "for flexibility" |
| ADR-003 | Tailwind 4 CSS-first tokens + class-based dark mode | Single source of design truth in `globals.css`; zero-config | `tailwind.config.ts`, `dark:`-hardcoded colors |
| ADR-004 | One zod schema, two enforcement points | Client UX + server authority from one contract | Boundary-local validation logic |
| ADR-005 | Deterministic rendering wherever hydration can observe | Seeded char block; theme class only mutation, `suppressHydrationWarning` only on `<html>` | `Math.random`/`Date.now` in render paths |
| ADR-006 | `images.unoptimized: true` + `next/image`, assets pre-encoded as WebP | Portability (any Node host) over optimization; layout discipline retained; format win without an optimizer | Forgetting width/height; assuming an optimizer exists |
| ADR-007 | Fail-open no-JS reveal guards | Content must never be trapped invisible without scripting; `html:not(.js)` + `scripting: none` CSS guards | JS-only visibility gating; `noscript` style hacks |
| ADR-008 | Mixed-aspect editorial rhythm as data | Image orientation is a content decision — typed, tested fields drive render classes | CSS `nth-child` aspect tricks; uniform thumbnail grids |
| ADR-009 | Playwright e2e layer on the production artifact | Parity/a11y/API contracts only count if a machine re-checks them; validate the built app, not dev HMR | Manual-only verification; parallel workers racing rate-limit state |
| ADR-010 | Pass-2 parity redesign (static estimator + measured geometry) | Every layout fix maps to a measured source-site fact; design-language parity is fixed, content richness is kept | Re-imagining source interactions (the wizard assumption); trusting DOM order over rendered geometry |

## Appendix B: Audit History

| Pass | Date | Scope | Result |
|---|---|---|---|
| Initial build verification | 2026-09-13 | vitest 18/18, tsc, eslint, `next build` 20 routes, prod smoke test (API contract, headers, routes, screenshots + VLM visual QA after scripted scroll) | All green; two eslint refactors forced (B-2); one test expectation corrected (L7) |
| Visual parity audit vs reference site | 2026-09-13 | agent-browser walkthrough of both sites; DOM/computed-style extraction on both; 12 full-page screenshots + VLM pairwise review | HIGH design-language parity; 10 gaps cataloged (V-1 CTA band, V-2 aspect rhythm, V-3 marquee shapes, V-4 detail aspects, V-5 skip link, V-6 services sections + 4 minor) — see `docs/AUDIT_VISUAL_PARITY.md` |
| Code review & audit (Six-Axis) | 2026-09-13 | full source read + mechanical greps + live probes (CWV, API, estimator, form) | 0 Critical; 18 findings (C-1 no-JS reveal High, aesthetic-parity Highs, consistency/a11y Mediums) — see `docs/AUDIT_CODE_REVIEW.md` |
| Remediation pass 1 (TDD) | 2026-09-13 | 26 RED tests first → 8 portrait images generated → data + markup fixes → probes + VLM re-review → WebP pass | All 10 gap groups closed; 44/44 tests; grids alternate 1.60/0.75; estimator behavior identical; CWV no regression (FCP 144 ms, CLS 0, LCP 700 ms); WebP gain measured at 9% (L10) — see `docs/REMEDIATION_PLAN.md` §6 |
| Playwright e2e suite | 2026-09-13 | `playwright.config.ts` adapted from the home-financing reference + 7 spec files (80 specs at introduction) | All green on the production build; every parity fix from pass 1 gained a named regression guard (ADR-009) |
| Pass-2 verification audit | 2026-09-13 | agent-browser re-probe of both sites (rendered geometry), 10 fresh screenshots, VLM pairwise re-review | Pass-1 fixes all hold; 14 new measured findings (F-1 /work CTA band, F-2 estimator interaction model, F-3/F-14 contact layout, F-4/F-5 aspect/hero geometry, F-6..F-9 hero/grid compositions, F-10 card grammar, F-11 marquee mix, F-12/F-13 label/referral parity) — see `docs/AUDIT_VISUAL_PARITY.md` § Pass 2 |
| Remediation pass 2 (TDD) | 2026-09-13 | estimator spec rewritten RED first → static four-group estimator + gated estimate → layout geometry fixes → /work CTA → 5-step process → card grammar + marquee shapes | 12/12 in-scope findings closed; 44 unit + 81 e2e green; re-probes match source measurements exactly (1.6/0.8 rhythm, 2.33 hero, form x=64 / info x=859, 3-col grids at x=64/461/859) — see `docs/REMEDIATION_PLAN.md` § Pass 2 |

## Appendix C: Post-Deploy Live-Site Validation

**What live testing catches that CI cannot:** reveal-hidden content in real
viewports (B-1), actual rendered contrast, header/anchor interactions,
marquee seam behavior, CSP in effect, API latency. The protocol:

1. **Prod server, not dev** — `bun run build && bun run start -- -p 3001`
   (dev overlays and warnings mask real behavior).
2. **Health first** — `curl -s :3001/api/health` must return
   `{"ok":true,"service":"design-brand-strategy",…}`.
3. **API contract** — one valid POST → `202` + `ok:true`; one invalid POST
   → `400` + `errors` map; watch server logs for the `contact_inquiry`
   JSON line.
4. **Route sweep** — `/`, `/work`, `/work/<each-slug>`, `/about`,
   `/services`, `/contact`, `/contact?service=brand-identity` all `200`;
   a bogus slug → `404` page (custom not-found renders).
5. **Headers** — CSP, X-Frame-Options DENY, HSTS, Referrer-Policy,
   nosniff present on `/`.
6. **Screenshots with the scroll discipline** — agent-browser
   `open` → **scroll to bottom in steps** → `screenshot`. Never judge a
   full-page dump without scrolling (L3). Compare light *and* dark themes
   (toggle persists via localStorage). Probe scripts beyond screenshots:
   mixed-shape marquee geometry, skip-link focus, estimator totals,
   select-error wiring, mobile-menu focus flow — see
   `/home/z/my-project/scripts/verify_remediation.sh` for the working set.
7. **The reference script** — `/home/z/my-project/scripts/smoke_test.sh`
   automates 2–6 and lands artifacts in `/home/z/my-project/tool-results/dbs/`.

*End of skill document (v2.0.0). Produced by the six-phase distillation
process; every claim is checkable against the repository. History: v1.0.0
distilled the codebase at `f014842`; v2.0.0 adds remediation-pass-1
knowledge (ADR-007/008, lessons L9–L12, resolved findings, audit history).*
