# design-brand-strategy

![Next.js](https://img.shields.io/badge/Next.js-16.3.5-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.3.0-61DAFB?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.3-06B6D4?logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-Proprietary-lightgrey)

Editorial portfolio website for **Elena Vance — Designer & Brand Strategist** (New York): a fast, accessible, fully static-first Next.js site with a four-step investment estimator and a validated inquiry form.

## Overview

Solo-practice studios need a portfolio that reads as considered without a build pipeline that requires one. This site recreates an editorial design language — warm cream and ink, a serif/sans typographic pairing, a 12-column grid with magazine-scale whitespace — on a modern, boring-in-the-right-places stack. All pages except the contact page and two API routes are prerendered at build time; there is no database, no auth, and exactly five client components. Content (persona, services, eight case studies, estimator pricing) lives in typed data modules, so the site is editable without touching markup.

The site is an original implementation: its code, copy, and imagery are all original — no assets or code were taken from the reference site.

## Key Features

| Feature | Description |
|---------|-------------|
| ✍️ Editorial design system | Cream/ink token palette, Instrument Serif + Inter, class-based dark mode with no-flash pre-hydration script |
| 🖼️ 19 original images | AI-generated portraits, studio imagery, and project covers in WebP (no third-party assets) |
| 📐 8 case studies | SSG project pages with challenge/approach/outcome narrative, sticky meta, and mixed wide/landscape/portrait detail imagery |
| 🧱 Mixed-aspect editorial rhythm | Covers alternate landscape (8:5) and portrait (3:4) across grids and the marquee gallery strip |
| 🧮 Investment estimator | 4-step wizard; pure, unit-tested pricing math (service × stage × timeline × scope) |
| 📮 Inquiry form | Shared zod schema client + server, honeypot, per-IP rate limiting (5 / 10 min) |
| ❓ Process + FAQ | Services page documents the four-step engagement process and six common questions (native `<details>`, zero JS) |
| 🔒 Hardened headers | CSP, HSTS, X-Frame-Options, nosniff, Referrer-/Permissions-Policy emitted by the app |
| ♿ Accessibility | Skip-to-content link, semantic landmarks, aria states, focus-visible rings, no-JS reveal guard, reduced-motion guards |
| 🧪 Verified | 44 unit tests, strict TypeScript, clean ESLint, production smoke test |

## Architecture

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Web framework | Next.js (App Router) | 16.3.5 | Routing, SSG, route handlers |
| UI runtime | React | 19.3.0 | Server-first components |
| Language | TypeScript (strict) | 5.9.3 | Type-safe data and logic |
| Styling | Tailwind CSS (CSS-first) | 4.3.3 | Token-based utilities, no config file |
| Validation | zod | 3.25.76 | Shared client/server schema |
| Icons | lucide-react | 1.45.0 | Inline SVG icons |
| Testing | Vitest | 4.1.11 | Unit tests for pure logic |
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
    end
    Browser --> Static
    Browser --> Dynamic
    Browser -- "POST (zod + rate limit)" --> API
    API -- "structured log (delivery hook)" --> Log[(Console / log drain)]
```

No database, no external services. The `/api/contact` handler validates and rate-limits, then emits a structured log line — the deliberate integration point for an email or CRM provider.

## File Hierarchy

```
📂 src/
 ┣ 📂 app/
 ┃ ┣ 📄 layout.tsx          # Fonts, theme script, header/footer shell, metadata
 ┃ ┣ 📄 page.tsx            # Home: hero, collage, marquee, work, about, services, CTA
 ┃ ┣ 📄 globals.css         # Design tokens (@theme inline), dark mode, motion guards
 ┃ ┣ 📂 work/[slug]/        # 8 SSG case studies (generateStaticParams)
 ┃ ┣ 📂 about/ services/    # Studio, approach, recognition / six practices + process + FAQ + CTA
 ┃ ┣ 📂 contact/            # Estimator + inquiry form (dynamic via ?service=)
 ┃ ┣ 📂 api/contact/        # zod validation + rate limiting (202/400/429)
 ┃ ┣ 📂 api/health/         # Liveness probe
 ┃ ┗ 📄 sitemap.ts robots.ts error.tsx loading.tsx not-found.tsx icon.svg
 ┣ 📂 components/           # 11 components — only 5 are client components
 ┃ ┗ 📄 estimator.tsx contact-form.tsx reveal.tsx marquee.tsx cta-band.tsx collage-strip.tsx …
 ┣ 📂 data/
 ┃ ┣ 📄 site.ts             # Persona, nav, 6 services, estimator config, process, FAQ, awards
 ┃ ┗ 📄 projects.ts         # 8 case studies (mixed aspects) + marquee sequence
 ┗ 📂 lib/
   ┣ 📄 estimator.ts        # Pure pricing math (+ tests)
   ┣ 📄 contact.ts          # Shared zod schema + option labels (+ tests)
   ┣ 📄 char-block.ts       # Deterministic seeded text (hydration-safe)
   └ 📄 rate-limit.ts       # Bounded in-memory limiter
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

2. (Optional) set the canonical URL for metadata:

   ```bash
   cp .env.example .env.local   # then edit NEXT_PUBLIC_SITE_URL
   ```

3. Start the dev server:

   ```bash
   bun run dev
   ```

**Verify setup**

```bash
bun run test        # → Test Files 6 passed (6), Tests 44 passed (44)
bun run build       # → ✓ Compiled successfully, 20 routes generated
bun run start & curl -s localhost:3000/api/health
                    # → {"ok":true,"service":"design-brand-strategy",...}
```

## Environment Variables

| Variable | Required | Purpose | Default |
|----------|----------|---------|---------|
| `NEXT_PUBLIC_SITE_URL` | No | Canonical origin for `metadataBase`, sitemap, and robots | `http://localhost:3000` |

## Testing

```bash
bun run test              # full unit suite (estimator math, schema + labels, data
                          # contracts, sitemap determinism, no-JS reveal guards)
bunx vitest run estimator # single file
```

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

Image rhythm: project covers alternate landscape (8:5) and portrait (3:4); case-study details mix wide banners (7:3), landscape (3:2), and portrait (3:4); the marquee renders tall/wide/landscape/square shapes as a mixed gallery.

## Contact form — production wiring

The form validates client- and server-side against one zod schema (`src/lib/contact.ts`), throttles by IP, and accepts inquiries with `202`. There is **no persistence by design**; `src/app/api/contact/route.ts` emits a structured JSON log line where an email provider or CRM webhook should be wired in (look for the `contact_inquiry` event). Everything else about the form is production-ready.

## Deployment

Any Node-capable host (Vercel zero-config, or `bun run build && bun run start` behind a reverse proxy). Set `NEXT_PUBLIC_SITE_URL` to the production origin so sitemap, robots, and Open Graph URLs are absolute.

## License

Proprietary — © Elena Vance (site persona). All imagery was generated for this project and may not be reused.
