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

---

# Pass 2 — Post-Remediation Verification (2026-09-13, second session)

**Trigger:** Playwright e2e suite added (80 specs) + full re-audit request after remediation pass 1 shipped.
**Method:** agent-browser mechanical probes on BOTH sites (rendered geometry, computed styles, DOM grammar), scripted-scroll full-page screenshots (10 captures in `/home/z/my-project/tool-results/audit-verify/`), VLM pairwise review (5 page pairs), plus the new e2e parity specs as executable evidence.

## P2.1 — Pass-1 remediation holds

Every pass-1 fix verified green on the current build: light CTA band on home/services/about (clone rgb(236,235,233) vs source rgb(239,238,235) — same family), /work alternating 1.6/0.75 mixed rhythm, mixed-shape marquee, services process/FAQ/CTA sections present, skip link, no-JS reveal guards, 56s marquee + reduced-motion, theme persistence, case-study sticky meta + next-project band, about section order (hero → bio → approach → recognition → beyond-work → CTA), home featured grid arrangement (L,P / L,P — matches source geometry exactly, correcting the DOM-order misread below).

## P2.2 — VLM pairwise verdicts

All five page pairs: **MEDIUM** — "perfectly replicates the atmosphere and typographic hierarchy… falls short on structural rearrangements." The VLM's structural claims were then mechanically verified one by one; several held up, several were disproven (noted below). Confirmed residuals:

## P2.3 — Verified new findings (the remediation pass-2 feed)

| ID | Severity | Finding (measured on both sites) |
|---|---|---|
| F-1 | **High** | `/work` closing CTA band missing — source: "HAVE SOMETHING IN MIND? / Let's discuss your project." light band (rgb(246,246,243), 420px) before footer; clone ends at the grid. CtaBand was added to home/services/about in pass 1 but not /work. |
| F-2 | **High** | Estimator interaction model — source is a **static all-groups form**: 4 numbered groups (1 PROJECT TYPE, 2 BUSINESS STAGE, 3 TIMELINE, 4 DELIVERABLES), all 15 option buttons visible simultaneously, estimate gated ("Complete all selections to see your personalized estimate."). Clone is a 4-step wizard showing one group at a time with an always-running range. |
| F-3 | Medium | Contact form field layout — source: single column (all 7 fields x=160, w=533, stacked). Clone: 2-col grid (name+email side-by-side, projectType+budget side-by-side). |
| F-4 | Medium | Portrait rendered ratio — source 0.80 (4:5) everywhere (grid covers, about-teaser, detail portraits); clone renders 3:4 (0.75). /work rhythm alternates on both, but with the wrong portrait value. |
| F-5 | Medium | Case-study hero — source renders a uniform 7:3 wide banner (2.33) for every case (intrinsic 1280×800 covers object-cropped); clone renders per-project aspect (1.6 landscape / 0.75 portrait). |
| F-6 | Medium | `/about` hero — source: split layout (label/h1/bio in left column x=80 w=627, portrait right x=771 w=429, 4:5). Clone: full-width h1 above a portrait-left / text-right grid. |
| F-7 | Medium | Home about-teaser — source: text left + portrait right (x=771). Clone: portrait left + text right (inverted). |
| F-8 | Medium | Home services — source: **3-column horizontal** cards (name + one-line description, w=341 each). Clone: vertical numbered rows. |
| F-9 | Medium | `/services` process — source: **5 horizontal** steps (Discovery, Strategy, Design, Refinement, Delivery — same row y, 5 columns). Clone: 4 vertical rows (Discover/Define/Design/Deliver). |
| F-10 | Low | `/work` card grammar — source: title + uppercase category + year, image-dominant ("Northlight Studio / BRAND IDENTITY / 2024"). Clone: index + title + year + summary paragraph + services tags (denser). |
| F-11 | Low | Marquee shape mix — source ratios ≈ 0.75–1.33; clone ≈ 0.75–1.73 (its "wide" shape is 1.6 and "landscape" 1.73 — wider than any source shape). |
| F-12 | Info | Referral field — source is a select ("Referral / Social Media / Search Engine / Press / Publication / Other"); clone is a free-text input. |
| F-13 | Info | Source timeline labels carry durations ("Flexible (12+ weeks)", "Standard (8-12 weeks)", "Accelerated (6-8 weeks)", "Rush (under 6 weeks)") and scope label "Core Essentials"; clone labels are bare ("Flexible", "Standard", "Core"). |

## P2.4 — VLM claims disproven by measurement (recorded to prevent re-chasing)

- "Reference has no theme toggle / rebuild adds settings icon" — known accepted enhancement (V-9 pass 1).
- "Rebuild adds new about sections not in reference" — false: source also has Beyond Work (Teaching/Speaking); section order matches.
- "Reference about uses 3-column approach grid, rebuild horizontal rows" — **true** (kept as F-9's sibling; folded into the approach-grid fix below? No — measured: source approach = 3 columns at x=160/491/821, clone = vertical rows. This IS real and is fixed alongside F-9's grammar as one "horizontal grid grammar" change? — no, it is on /about. Recorded as F-6b below.)
- "Featured grid arrangement differs" — false: source renders L,P / L,P (Meridian TL, Northlight TR, Ember BL, Stillwater TR-corner P), same as clone. Earlier DOM-order reading was misleading.
- "Process/FAQ have background bands reference lacks in rebuild" — partially false: source's only true band is the darker CTA (rgb 239) over its cream body (rgb 246); clone mirrors that structure (bg 251 + CTA band 236).

**F-6b (Medium, added):** `/about` approach principles — source renders 3 columns side-by-side (x=160/491/821); clone renders vertical numbered rows.

## P2.5 — Accepted deviations (re-affirmed, no action)

Content richness (6 services vs source 4; richer service rows; case-study prose), dark mode, collage strip, availability pill, original project set and imagery, contact-form success/429 copy. These are original-content decisions that do not contradict the design language, per the pass-1 framework.

Artifacts: `/home/z/my-project/tool-results/audit-verify/` (10 screenshots + 5 VLM JSON verdicts).

---

## P2.6 — Post-fix verification (same day, after remediation pass 2)

All twelve in-scope findings re-measured on the remediated production build — every probe now matches the source:

| Probe | Source | Clone (post-fix) |
|---|---|---|
| /work cover rhythm | [1.6, 0.8, 1.6, 0.8, …] | [1.6, 0.8, 1.6, 0.8, …] ✅ |
| Case hero ratio | 2.33 (uniform) | 2.33 ✅ |
| /work closing CTA band | present (light band) | present ("Have something in mind? / Let's discuss your project.") ✅ |
| Estimator model | 4 groups, 15 options, gated estimate | 4 named groups, 15 radios, "Complete all selections…" ✅ |
| Contact columns | form x=160 / info x=843 | form x=64 / info x=859 ✅ (same sides, same proportions) |
| Referral field | select (5 options + placeholder) | select, identical option set ✅ |
| About hero | h1 left / portrait right, 4:5 | h1 x=64 / portrait x=759, 0.8 ✅ |
| About approach | 3 columns (x=160/491/821) | 3 columns (x=64/461/859) ✅ |
| Home teaser | text left / portrait right (0.8) | portrait x=764, 0.8 ✅ |
| Home services | 3 columns (x=80/469/859) | 3 columns (x=64/461/859) ✅ |
| Services process | 5 columns, same row | 5 columns (x=64→1018, same y) ✅ |

The post-fix VLM pairwise re-review (home, /work, /contact) confirms the structural divergences it previously named are closed; residual VLM commentary maps to the documented acceptances (collage strip, availability pill, dark mode, richer hero copy) plus the two refinements it prompted (open-band estimator, single-line card meta), which were applied. Parity verdict after pass 2: **HIGH design-language parity with documented, deliberate content divergences.**

Regression guards: every fixed finding is pinned by a named Playwright spec (`e2e/parity.spec.ts`, `e2e/estimator.spec.ts`, `e2e/smoke.spec.ts`).

---

## Pass 4 — Live-Deploy Parity Re-Validation (2026-09-14, post-pass-3 redeploy)

**Context:** the live deploy at `https://design-brand-strategy.jesspete.shop` was rebuilt with the pass-3 code (verified live: unknown-slug hard-404, cold-load CLS 0.0000 ×2, full security-header set incl. the CSP analytics origin, no console/page errors on any route). This pass re-validates visual fidelity against the source (`https://editorial-portfolio-9d8e325b.lovable.app`) on the live artifact rather than the local build.

**Method (repo methodology, lesson L13):** Playwright-driven capture with scroll-through (reveal settlement) on both sites → full-page screenshots of 6 aligned surfaces → VLM pairwise comparison (`z-ai vision`, SOURCE=image 1 / LIVE=image 2, structured FIDELITY/GAPS/VERDICT prompts) → **every VLM-flagged gap verified against the live DOM before acceptance** → rendered-geometry probes (aspect ratios, grid columns, page heights).

**Results:**

| Surface | VLM verdict | VLM-flagged gaps → DOM verification |
|---|---|---|
| Home | high | "scattered overlapping Selected Work layout" → live renders a 2-col grid (`616px 616px`), 4 work links — misread (marquee/collage impression); "footer cipher text" → the deterministic collage character block, intentional original element |
| /work | high | "missing header sub-label" → present ("Elena Vance \| DESIGN & BRAND STRATEGY"); "footer connect layout" → social links present (Instagram/LinkedIn/X) |
| /work/meridian | medium | "lacks theme toggle" → present in header; "hero full-width at top vs inline" → hero renders after the H1 exactly like source, 7:3 both (2.333); "missing Challenge/Solution sections" → present ("The challenge" / "The approach" / "After launch" = outcome); sidebar sticky meta present |
| /about | medium | "missing Approach 3-column grid" → present (two 3-col grids probed); "missing image caption" → captions present; "missing theme toggle" → present |
| /services | high | "missing italic sub-headlines" → present (5 probed, e.g. "The face, voice, and posture of the business."); "missing dividers" → 3 top-level bordered sections; "missing Investment label" → present |
| /contact | high | "missing Timeline/Deliverables estimator columns" → all four groups present (case-insensitive probe; CSS `text-transform: uppercase` had defeated the naive one), 4 radiogroups, gated estimate + timeline durations present; "missing footer email" → present |

**Geometry probes:** /work cover rhythm byte-identical to source (`[1.6, 0.8] ×4`); case hero 2.333 (7:3) on both; marquee mixed shapes match (0.8 tall / 1.25 wide / 1.333 landscape, sub-pixel rounding); H1/copy differences are the documented deliberate original content.

**Verdict:** parity re-confirmed **HIGH design-language fidelity** on the live deploy. All VLM-flagged structural gaps were DOM-refuted misreads; no actionable visual findings. VLM utility note re-confirmed (L13): VLM verdicts are triage — numbers and DOM probes are the contract.

Artifacts: `/home/z/my-project/tool-results/parity-pass4/` (11 source + 7 live screenshots, geometry JSON, VLM results).

---

## Pass 5 — Live-Deploy Parity Re-Validation (2026-09-14, fifth session, post-pass-4 baseline `3c38b8b`)

**Context:** full gate re-verified green at the post-pass-4 baseline (71/71 unit, 83/83 e2e local with zero skips, build 20 routes); live deploy confirmed healthy (health, full security-header set, hard-404, robots with the documented CF managed-content preamble, cold-load CLS 0.0000 ×2, FCP 612 ms / LCP 300–612 ms, zero console/page errors). This pass re-runs the parity audit on the same live artifact to confirm the post-pass-4 state holds and to catch any drift since pass 4.

**Method (unchanged, lesson L13):** Playwright capture with scroll-through on both sites → 6 aligned full-page screenshots → VLM pairwise (`z-ai vision`, SOURCE=image 1 / LIVE=image 2, FIDELITY/GAPS/VERDICT) → **every flagged gap DOM-verified before acceptance** → geometry probes.

**Results:**

| Surface | VLM verdict | VLM-flagged gaps → DOM verification |
|---|---|---|
| Home | high | "omits the marquee strip + 'Considered by Design' editorial block" → marquee present (26 imgs) and editorial feature sections present ("A studio of one, built for considered work." / "What I do" / "Let's build something considered.") — misread |
| /work | high | "missing 'Start a conversation' CTA + heading sub-text" → both present (CTA link found; sub-text "A selection of engagements from the last four years — each one a system built to outlast the project") — misread |
| /about | high | "'Beyond Work' 3-col in source vs 2-col local" → local renders Teaching/Mentoring/Speaking as a 3-column grid (3 × 389 px at x=88/525/963) — misread; "footer Connect column absent from source" → the source footer contains the same NAVIGATION + CONNECT column (probed) — misread |
| /services | high | "omits italic sub-headlines + Best For/Investment split-line" → 7 italic elements, Best-For and Investment text present — misread; "standard FAQ accordion vs reference's expanded list" → real but documented deliberate divergence (native `<details>`, zero JS — README key features) |
| /contact | high | "estimator lacks centered sub-headline / '0/4 selections' status" → sub-headline present ("Get a personalized estimate. Answer a few questions…", identical header text probed on source); no such counter found on the source either — misread; "CTA rectangular instead of pill" → Send-inquiry button is `rounded-full` (computed radius = full) — misread; "footer socials inline vs vertical" → three socials render as list rows (probed) — misread |
| /work/meridian (case study) | high | "none" |

**Geometry probes:** /work cover rhythm byte-identical to source (`[1.6, 0.8] ×4` on both, measured independently this pass); home hero/grid images within the documented rhythm; 0 console/page errors on either site.

**Verdict:** parity re-confirmed **HIGH design-language fidelity** — third consecutive live-artifact validation with every VLM-flagged structural gap DOM-refuted. VLM utility note (L13) holds: VLM verdicts are triage; numbers and DOM probes are the contract.

Artifacts: `/home/z/my-project/tool-results/parity/` (6 source + 6 live screenshots, geometry JSON per site, VLM results at `vlm-results.txt`).
