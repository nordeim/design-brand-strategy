# design-brand-strategy

![Next.js](https://img.shields.io/badge/Next.js-16.3.5-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.3.0-61DAFB?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.3-06B6D4?logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-Proprietary-lightgrey)

Editorial portfolio website for **Elena Vance — Designer & Brand Strategist** (New York): a fast, accessible, fully static-first Next.js site with a four-group investment estimator (source-parity static form) and a validated inquiry form persisted to SQLite.

## Overview

Solo-practice studios need a portfolio that reads as considered without a build pipeline that requires one. This site recreates an editorial design language — warm cream and ink, a serif/sans typographic pairing, a 12-column grid with magazine-scale whitespace — on a modern, boring-in-the-right-places stack. All pages except the contact page and two API routes are prerendered at build time; there is no auth and exactly five client components. Content (persona, services, eight case studies, estimator pricing) lives in typed data modules, so the site is editable without touching markup. Validated contact inquiries persist to a single SQLite table via Prisma (ADR-011 — fail-open: a DB error never turns a valid inquiry into a 5xx).

The site is an original implementation: its code, copy, and imagery are all original — no assets or code were taken from the reference site.

## Key Features

| Feature | Description |
|---------|-------------|
| ✍️ Editorial design system | Cream/ink token palette, Instrument Serif + Inter, class-based dark mode with no-flash pre-hydration script |
| 🖼️ 19 original images | AI-generated portraits, studio imagery, and project covers in WebP (no third-party assets) |
| 📐 8 case studies | SSG project pages with challenge/approach/outcome narrative, sticky meta, and mixed wide/landscape/portrait detail imagery |
| 🧱 Mixed-aspect editorial rhythm | Covers alternate landscape (8:5) and portrait (4:5) across grids and the marquee gallery strip |
| 🧮 Investment estimator | Static four-group form (project type / stage / timeline / deliverables) with a gated estimate; pure, unit-tested pricing math |
| 🧪 Playwright e2e suite | 83 specs across chromium + Pixel-7 emulation: smoke, SEO, assets, contact funnel, estimator wiring, parity regression guards, mobile nav, document-order stream guard |
| ❓ Process + FAQ | Services page documents the five-step engagement process (Discover → Strategy → Design → Refinement → Delivery) and six common questions (native `<details>`, zero JS) |
| 📮 Inquiry form | Shared zod schema client + server, honeypot, per-IP rate limiting (5 / 10 min), SQLite persistence via Prisma (fail-open) |
| 🔒 Hardened headers | CSP (incl. the deployment host's analytics origin), HSTS, X-Frame-Options, nosniff, Referrer-/Permissions-Policy emitted by the app |
| ♿ Accessibility | Skip-to-content link, semantic landmarks, aria states, focus-visible rings, no-JS reveal guard, reduced-motion guards |
| 🧪 Verified | 71 unit tests + 83 Playwright e2e specs, strict TypeScript, clean ESLint, production smoke test + cold-load CLS regression harness |

## Architecture

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Web framework | Next.js (App Router) | 16.3.5 | Routing, SSG, route handlers |
| UI runtime | React | 19.3.0 | Server-first components |
| Language | TypeScript (strict) | 5.9.3 | Type-safe data and logic |
| Styling | Tailwind CSS (CSS-first) | 4.3.3 | Token-based utilities, no config file |
| Validation | zod | 3.25.76 | Shared client/server schema |
| Icons | lucide-react | 1.45.0 | Inline SVG icons |
| Persistence | Prisma + SQLite | 6.19.3 | Single `ContactInquiry` table (ADR-011) |
| Testing | Vitest | 4.1.11 | Unit tests for pure logic |
| E2E | @playwright/test | 1.63.0 | 83 specs, chromium + Pixel-7 |
| Package manager | Bun | ≥ 1.1 | Install + scripts (`bun.lock` committed) |

```mermaid
flowchart TB
    subgraph Client
        Browser[Browser]
    end
    subgraph NextApp[Next.js 16 — App Router]
        Static[Static pages<br/>/, /work, /work/:slug, /about, /services]
        Dynamic[/contact — reads ?service=]
        API["Route handlers<br/>/api/contact · /api/health"]
        DB[(SQLite · db/custom.db<br/>ContactInquiry)]
    end
    Browser --> Static
    Browser --> Dynamic
    Browser -- "POST (zod + rate limit)" --> API
    API -- "fail-open Prisma write" --> DB
    API -- "structured log (delivery hook)" --> Log[(Console / log drain)]
```

Contact inquiries persist to SQLite (ADR-011); the `/api/contact` handler validates, rate-limits, writes, and emits a structured log line — the deliberate integration point for an email or CRM provider. The DB write is fail-open: a persistence error is logged (`contact_inquiry_db_failed`) and the client still receives `202`.

## File Hierarchy

```
📂 src/
 ┣ 📂 app/
 ┃ ┣ 📄 layout.tsx          # Fonts, theme script, header/footer shell, metadata
 ┃ ┣ 📄 page.tsx            # Home: hero, collage, marquee, work, about, services, CTA
 ┃ ┣ 📄 globals.css         # Design tokens (@theme inline), dark mode, motion guards
 ┃ ┣ 📂 work/[slug]/        # 8 SSG case studies (generateStaticParams + dynamicParams=false)
 ┃ ┣ 📂 about/ services/    # Studio, approach, recognition / six practices + process + FAQ + CTA
 ┃ ┣ 📂 contact/            # Estimator + inquiry form (dynamic via ?service=)
 ┃ ┣ 📂 api/contact/        # zod validation + rate limiting + Prisma write (202/400/429)
 ┃ ┣ 📂 api/health/         # Liveness probe
 ┃ ┗ 📄 sitemap.ts robots.ts error.tsx not-found.tsx icon.svg
 ┃                          # (deliberately NO loading.tsx — ADR-012 CLS guard)
 ┣ 📂 components/           # 11 components — only 5 are client components
 ┃ ┗ 📄 estimator.tsx contact-form.tsx reveal.tsx marquee.tsx cta-band.tsx collage-strip.tsx …
 ┣ 📂 data/
 ┃ ┣ 📄 site.ts             # Persona, nav, 6 services, estimator config, 5-step process, FAQ, awards
 ┃ ┗ 📄 projects.ts         # 8 case studies (mixed aspects) + marquee sequence
 ┗ 📂 lib/
 ┣ 📄 estimator.ts        # Pure pricing math (+ tests)
 ┣ 📄 contact.ts          # Shared zod schema + option labels (+ tests)
 ┣ 📄 db.ts               # Prisma client singleton (runtime)
 ┣ 📄 char-block.ts       # Deterministic seeded text (hydration-safe)
 ┣ 📄 rate-limit.ts       # Bounded in-memory limiter
 ┗ 📂 wcc/db-url.ts       # Shared DATABASE_URL resolver (+ tests)
📂 prisma/schema.prisma     # ContactInquiry model (ADR-011)
📂 scripts/                 # db.ts (Prisma CLI wrapper), cls-regression.mjs + gap-proxy.mjs (CLS guard),
                          # live-deploy-audit.mjs (post-deploy state gate — see Deployment)
📂 e2e/                    # 7 Playwright specs (smoke, seo, assets, contact,
                          # estimator, parity, mobile) + playwright.config.ts
📂 public/images/           # 19 generated WebP originals
```

## Quick Start

Requires Node.js ≥ 20 and Bun ≥ 1.1.

1. Clone and install:

   ```bash
   git clone git@github.com:nordeim/design-brand-strategy.git
   cd design-brand-strategy
   bun install
   ```

2. Provision the SQLite database and (optionally) the canonical URL:

   ```bash
   cp .env.example .env
   bun run db:generate && bun run db:push   # creates db/custom.db (ADR-011)
   ```

3. Start the dev server:

   ```bash
   bun run dev
   ```

**Verify setup**

```bash
bun run test        # → Test Files 8 passed (8), Tests 71 passed (71)
bun run build       # → ✓ Compiled successfully, 20 routes generated
bun run e2e         # → 83 passed (chromium + mobile; starts its own `next start` on :3002)
bun run start & curl -s localhost:3000/api/health
                    # → {"ok":true,"service":"design-brand-strategy",...}
```

## Environment Variables

| Variable | Required | Purpose | Default |
|----------|----------|---------|---------|
| `DATABASE_URL` | Yes (build/e2e) | SQLite URL for Prisma; the relative `file:../db/custom.db` is re-anchored to the repo root by the shared resolver (`src/lib/wcc/db-url.ts`) | `file:../db/custom.db` (in `.env.example`) |
| `NEXT_PUBLIC_SITE_URL` | No | Canonical origin for `metadataBase`, sitemap, and robots | `http://localhost:3000` |
| `SITE_URL` | No | Server-only fallback for the same value | — |
| `E2E_PORT` / `E2E_BASE_URL` | No | Playwright webServer overrides (`E2E_BASE_URL` reuses an external server, e.g. the live deploy) | `3002` / — |

## Testing

```bash
bun run test              # full unit suite (estimator math, schema + labels, data
                          # contracts, sitemap determinism, no-JS reveal guards,
                          # DATABASE_URL resolver, rate-limit client-key trust order)
bunx vitest run estimator # single file

bun run e2e               # Playwright: chromium project (78 specs) against the
                          # PRODUCTION build (`next start` on :3002 — validates
                          # the shipped artifact, not dev HMR)
bun run e2e:all           # + mobile project (Pixel 7 emulation, hamburger menu)
                          # — 83 specs total
bun run e2e:report        # open the HTML report
bun scripts/cls-regression.mjs   # cold-load CLS guard (gap-proxy harness,
                          # worst CLS <= 0.1 — ADR-012)
bun scripts/live-deploy-audit.mjs  # post-deploy state gate against the live
                          # origin (or LIVE_URL=<url>): health, security
                          # headers, hard-404, robots, email-obfuscation OFF,
                          # cold-load CLS (P4-F2)
```

The e2e suite covers: critical surfaces and the security-header contract (including the Cloudflare-analytics script origin), SEO pins (13-URL sitemap, exact titles, per-case OG images), the full image inventory, the contact API contract (202/400/429 + Retry-After, per-field errors, honeypot swallow) and form funnel, estimator wiring (gated estimate, label parity, deep-links), parity regression guards (no-JS reveal opacity, skip-link keyboard reveal, aspect rhythm, marquee motion contract, theme persistence), the mobile navigation overlay, unknown-slug hard-404s, and the document-order HTML stream guard (cold-load CLS). The contact API specs are environment-aware (P4-F1): against a self-managed origin (local/CI) they run at full strength with per-test spoofed `x-forwarded-for` isolation; against an edge-fronted external server (`E2E_BASE_URL`, e.g. the live Cloudflare deploy) where AUD-1 keying makes spoofing ineffective, the isolation-dependent specs detect the shared bucket in situ and skip loudly with evidence instead of failing. Requires a production build first (`bun run build`) and the Playwright Chromium binary (`bunx playwright install chromium`).

Production smoke (as executed for the initial release): `bun run build && bun run start`, then
`POST /api/contact` with a valid payload (expect `202`), an invalid payload (expect `400` + field
errors), and a page sweep for 200s + security headers on all routes.

## Design System

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--background` | `hsl(45 20% 98%)` | `hsl(0 0% 8%)` | Page background |
| `--foreground` | `hsl(0 0% 10%)` | `hsl(45 20% 95%)` | Primary text |
| `--muted-foreground` | `hsl(0 0% 45%)` | `hsl(0 0% 64%)` | Metadata, captions, labels |
| `--accent` / `--muted` | `hsl(40 10% 88%)` / `hsl(45 8% 92%)` | `hsl(0 0% 16%)` / `hsl(0 0% 14%)` | Texture blocks, hover fills |
| `--border` | `hsl(40 10% 88%)` | `hsl(0 0% 20%)` | Hairline rules |

Typography: **Instrument Serif** (400 + italic) for display/headlines; **Inter** (variable) for body, labels (11–13px, `tracking-[0.2em]`), and UI. Both loaded via `next/font` (self-hosted, `display: swap`).

Motion: `marquee` keyframe (56s linear loop, hover-pause), 300ms reveal transitions, `link-underline` background-size animation — all disabled under `prefers-reduced-motion` via CSS. Reveal content stays visible when JavaScript is unavailable (dual fail-open guards: `html:not(.js)` and `@media (scripting: none)`).

Image rhythm: project covers alternate landscape (8:5) and portrait (4:5); every case study opens with a uniform 7:3 wide banner hero and mixes wide (7:3), landscape (3:2), and portrait (4:5) details; the marquee renders tall (4:5), wide (5:4), landscape (4:3), and square tile shapes as a mixed gallery.

## Contact form — production wiring

The form validates client- and server-side against one zod schema (`src/lib/contact.ts`), throttles by IP, accepts inquiries with `202`, and persists them to SQLite via Prisma (`ContactInquiry`, ADR-011). The write is fail-open — a DB error is logged as `contact_inquiry_db_failed` and the client still sees `202` — and `src/app/api/contact/route.ts` emits a structured JSON log line where an email provider or CRM webhook should be wired in (look for the `contact_inquiry` event). Query inquiries with `bunx prisma studio`. Everything else about the form is production-ready.

## Deployment

Any Node-capable host (Vercel zero-config, or `bun run build && bun run start` behind a reverse proxy). Provision with `cp .env.example .env && bun run db:generate && bun run db:push`, and set `NEXT_PUBLIC_SITE_URL` to the production origin so sitemap, robots, and Open Graph URLs are absolute (rebuild after changing it — `NEXT_PUBLIC_*` is inlined at build time).

**Cloudflare-fronted deploys (measured on the live site):**
- The app CSP allows `https://static.cloudflareinsights.com` in `script-src` so the host's Web Analytics beacon is not blocked.
- **Disable Email Address Obfuscation** (dashboard → Scrape Shield): it rewrites `studio@elenavance.com` in the SSR HTML into obfuscated spans, risking React hydration mismatches and flashing `[email protected]` before the decode script runs. As of 2026-09-14 this is **still ON** on the live zone (2 rewrites in the `/contact` HTML) — `bun scripts/live-deploy-audit.mjs` fails its `email-obfuscation` check until the toggle is flipped.
- Cloudflare may prepend a **Managed Content** preamble to `robots.txt` (content-signal declarations + AI-bot blocks). The app's own directives (`Allow: /`, `Disallow: /api/`, the `Sitemap:` pointer) remain below it — expected edge behavior, not an app defect; the audit script verifies the app directives survive.
- Serving is stream-through: HTML arrives chunked — exactly what the ADR-012 document-order stream contract protects against (cold-load CLS).
- **Run the post-deploy state gate** after every deploy and dashboard change: `bun scripts/live-deploy-audit.mjs` (6 checks: health, security-header contract, hard-404, robots, email-obfuscation OFF, cold-load CLS ≤ 0.1).

## License

Proprietary — © Elena Vance (site persona). All imagery was generated for this project and may not be reused.
