# Visual Aesthetics, UI/UX & Animation Parity Audit

**Date:** 2026-09-13
**Scope:** Local clone (`design-brand-strategy`, prod build on :3001) vs source site (`https://editorial-portfolio-9d8e325b.lovable.app/`)
**Method:** agent-browser (headless Chromium, 1440×900 desktop + 375×812 mobile), DOM/computed-style extraction on both sites, scripted-scroll full-page screenshots (12 captures), VLM pairwise image review, mechanical animation/interaction probes. Scroll discipline applied per lesson L3 (reveal pattern fires only in-viewport).

**Context:** the clone intentionally reproduces the source's information architecture and design language with original code, copy, and imagery. Content differences (project names, wording, photos) are expected and are **not** parity issues; layout, style, structural, and behavioral differences **are**.

---

## 1. Parity verdict

**Overall: HIGH design-language parity with MEDIUM structural deltas.** The clone reads as the same site family — same palette family, same type system, same section grammar, same interaction model. Ten confirmed parity matches, ten gaps (three of them material: CTA band treatment, image aspect-rhythm, services page composition).

## 2. Confirmed parity matches (verified via DOM/computed styles on both sites)

| Aspect | Source | Clone | Status |
|---|---|---|---|
| Display type | Instrument Serif, 96px h1, −2.4px tracking, italic `<em>` emphasis | same (clamp 6.5rem cap, `tracking-tight`, italic em) | ✅ |
| Body/label type | Inter, small uppercase tracked labels | same (`tracking-[0.18em]–[0.22em]`) | ✅ |
| Palette | cream bg (≈#f6f6f3) / ink (#1a1a1a) | cream bg (#fbfaf9) / ink (#1a1a1a) | ✅ (same family) |
| Home section grammar | header → hero → marquee(24 labeled) → 4 projects → about teaser (portrait + blockquote) → 3 services → CTA → light footer | identical grammar (plus collage strip) | ✅ |
| Hero portrait | 448×560 (4:5), object-cover | `aspect-[4/5]` | ✅ |
| About teaser | portrait + pull-quote block | same | ✅ |
| Services on home | 3 services, no images | same | ✅ |
| Footer | light bg, nav + social columns, legal row | same | ✅ |
| Case study | sticky meta sidebar + next-project link | same | ✅ |
| Contact | same 7 form fields (Name*, Email*, Company, Project Type, Budget, Details*, Referral) + same estimator model (4 services, stage/timeline/scope multipliers, Startup/Growing/…) | same | ✅ |
| Marquee behavior | CSS-animated strip, 24 items, labels | `marquee 56s linear infinite`, 24 items, labels, hover-pause | ✅ |
| Reveal behavior | scroll-triggered fade/translate reveals | 300ms ease-out reveals, IO-driven | ✅ |

## 3. Animation & interaction fidelity (mechanical probes on the clone)

| Probe | Result |
|---|---|
| Marquee animating (x-position delta over 1.2 s) | ✅ −339.6 → −485.1 px, `animation: marquee 56s` |
| Marquee hover-pause CSS | ✅ `group-hover:[animation-play-state:paused]` present (tool cannot synthesize `:hover`; verified structurally — affects both sites equally) |
| Reveal: hidden → visible on scroll | ✅ 15 hidden pre-scroll → 0 post-scroll, `transition-duration 0.3s` |
| Theme toggle | ✅ `.dark` class + `localStorage("theme")` + icon/aria-label swap + bg flip to rgb(20,20,20) |
| Mobile menu (375×812) | ✅ aria-expanded false→true, overlay flex, body scroll locked; nav-link click navigates to /work, menu unmounts, scroll lock released |
| Estimator flow | ✅ $33k–$55k default → Art Direction × Enterprise × Rush × Full System = **$44k–$88k** (exact expected math), step indicator, final CTA appears |
| Contact form | ✅ empty submit → 5 field errors; valid submit → API 202 → success panel |
| prefers-reduced-motion | ✅ marquee `animation: none`, all `[data-reveal]` forced visible |
| Dark-mode emulation | ✅ (via toggle; `set media dark` correctly overridden by stored preference — intended precedence) |

**Known tool limitation:** `agent-browser`'s `hover`/`mouse move` did not produce a real `:hover` pseudo-state (verified identical behavior on the source site), so hover-state visuals were verified structurally (CSS classes, `group` pattern, transition definitions) rather than visually.

## 4. Parity gaps (the remediation feed)

| ID | Severity | Gap | Source | Clone |
|---|---|---|---|---|
| V-1 | **High** | Closing CTA band treatment | Light warm band (rgb(239,238,235)), ink headline, ink pill button | Inverted ink band (`bg-foreground`), cream text, cream button |
| V-2 | **High** | Project cover aspect rhythm (home grid + /work index) | Alternating/mixed: 1.60 landscape ↔ 0.80 portrait covers (8 projects alternate on /work) | Uniform 3:2 landscape everywhere |
| V-3 | Medium | Marquee item geometry | Mixed aspects (0.75, 1.25, 0.80) and varied widths — a gallery collage | Uniform 256×144 landscape tiles + label |
| V-4 | Medium | Case-study detail imagery | Mixed aspects incl. wide 2.33 banner images | Uniform 3:2 details |
| V-5 | Medium | Skip-to-content link | Present (`a[href="#main"]`) | **Missing** (maps to known issue K-6) |
| V-6 | Medium | /services composition | 4 services + "How we work together" (process) + "Common questions" (FAQ) + "Ready to start?" CTA | 6 services only — no process/FAQ/CTA sections |
| V-7 | Low | Hero availability pill | none on portrait | added overlay pill (embellishment) |
| V-8 | Low | Home collage strip | not present on home | added section (original embellishment) |
| V-9 | Info | Dark mode | none | full dark theme + toggle (accepted enhancement) |
| V-10 | Low | About page closing | "Let's work together." CTA section | "Beyond the studio" instead, no CTA |

## 5. Interpretation guidance for remediation

- **V-1/V-2/V-3/V-4 are the true fidelity items** — they define the source's editorial visual signature (light CTA band; mixed-aspect image rhythm). Remediation should bring the clone in line.
- **V-5 is both parity and WCAG** (skip link) — fix regardless.
- **V-6 is a content-architecture gap** — adding process/FAQ/CTA sections to /services restores parity and adds SEO surface.
- **V-7/V-8 are embellishments** — keep unless strict minimal parity is requested; they do not contradict the design language (pill is an existing primitive; collage uses existing tokens).
- **V-9 is an enhancement** — keep; dark mode is fully wired and tested.

Artifacts: `/home/z/my-project/tool-results/audit/` (12 full-page screenshots + 2 mobile captures).
