# Remediation Plan — design-brand-strategy

**Date:** 2026-09-13
**Inputs:** `docs/AUDIT_VISUAL_PARITY.md` (V-1…V-10) · `docs/AUDIT_CODE_REVIEW.md` (C/R/A/S/P/AX/AA findings, consolidated P0–P2)
**Method:** TDD per `test-driven-development` (RED → GREEN → REFACTOR; source-reading tests for CSS/markup contracts; agent-browser probes for visual/behavioral verification). Planned per `planning-and-task-breakdown`.
**Branch policy:** all work on `main` (operator contract — no new branches). Commits split by logical change per `code-quality-standards` change sizing.

---

## 1. Scope decisions

**In scope (18 findings):** C-1/AA-2 (no-JS reveal), AX-1/V-1 (CTA band), AX-2/V-2 (mixed-aspect grid), C-2/K-2 (hardcoded email), AA-1/K-3 (select a11y), AX-5/V-5/K-6 (skip link), AX-3/V-3 (marquee rhythm), AX-4/V-4 (case-detail rhythm), AX-6/V-6 (services process/FAQ/CTA), R-1/K-4 (estimator DRY), AA-3/K-8 (per-page OG), P-1 (image weight), P-3 (aspect crop mismatch — subsumed by V-2/V-4 work), C-3 (sitemap lastmod), AA-4 (menu focus), R-2 (label colocation), V-10 (about CTA), plus documentation realignment.

**Deferred with rationale (documented, not fixed):**
- S-1 CSP nonce strategy — framework-level change; current allowance is required by RSC payload; revisit with a nonce middleware when CI exists.
- S-2/K-7 rate-limiter persistence — single-instance deployment scope; swap for Upstash when multi-instance.
- S-3 dependency audit wiring — needs CI; noted in README.
- P-2 resized marquee variants — subsumed by WebP conversion (P-1) which cuts decode + transfer cost; explicit variants deferred.
- V-7 (hero availability pill), V-8 (collage strip), V-9 (dark mode) — intentional enhancements, kept (see §5 of the visual audit).

## 2. Design decisions

### D1 — No-JS reveal guard (C-1) — *fail-open, belt and suspenders*
1. The inline theme script in `layout.tsx` additionally does `document.documentElement.classList.add("js")` (runs pre-paint, in `<head>`).
2. `globals.css` gains:
   - `html:not(.js) [data-reveal] { opacity: 1 !important; transform: none !important; }` — covers every no-JS browser, including ones without `scripting` support;
   - `@media (scripting: none) { [data-reveal] { opacity: 1 !important; transform: none !important; } }` — modern-native signal (Chrome 120+, Safari 17+, Firefox 113+).
   Both fail open: if the script never runs, content is visible. Zero JS/hydration changes; reduced-motion block unchanged.

### D2 — Closing CTA band, light treatment (AX-1/V-1)
Home closing section changes from inverted band (`bg-foreground text-background`, cream button) to the source's treatment: `bg-muted` + `border-t border-border` band, ink headline (`text-foreground`), muted body, and the standard ink `PillLink` (`bg-foreground text-background`). The same light-band CTA pattern is reused for the new services CTA and the new about CTA (V-10) — one CTA grammar everywhere, matching the source's close.

### D3 — Mixed-aspect editorial image rhythm (AX-2/V-2, AX-4/V-4, P-3)
- `Project` gains `coverAspect: "landscape" | "portrait"`; `details` entries gain `aspect: "wide" | "landscape" | "portrait"`.
- Assignment (data-driven, tested): `PROJECTS` alternate `landscape, portrait` in order → `/work` strictly alternates (matches source); the home 2×2 featured grid renders `L,P / L,P`.
- Portrait covers (4): **vantage, solace, foundry, latitude** — new AI-generated 4:5 originals (864×1080), same prompt style as existing covers.
- Case details: every project's first detail renders **wide** (`aspect-[7/3]`, from existing 1.75 sources — mild crop); the four *featured* projects' second detail renders **portrait** (4 new 4:5 detail images); non-featured keep `landscape` second details.
- `ProjectCard` renders `aspect-[8/5]` (landscape) or `aspect-[4/5]` (portrait) from the field; case-study hero cover keeps the same per-project aspect.
- This also resolves P-3 for covers (no more 1.75-into-1.5 crops): landscape renders at 8/5 (1.6) from 1.75 sources (≈9% crop), portrait renders at 4/5 from 4:5 sources (exact).

### D4 — Marquee gallery rhythm (AX-3/V-3)
`getMarqueeItems()` items gain a `shape` field: `"tall"` (4:5, `w-44 h-55`), `"wide"` (16:10-ish, `w-72 h-45`), `"landscape"` (7:4, `w-64 h-37`), `"square"` (tiles, `w-44 h-44`). Covers take their project's shape; studio details stay landscape; tiles become squares. Track switches from uniform `h-44` wrappers + `items-stretch` to per-item sizes + `items-center` — a mixed-height gallery strip like the source. Loop contract unchanged (sequence rendered twice, `translateX(-50%)`).

### D5 — Services page completion (AX-6/V-6)
Append after service 06:
1. **"How we work together"** — `PROCESS_STEPS` (4 numbered editorial steps: Discover / Define / Design / Deliver), rendered with the numbered-row pattern used by approach principles.
2. **"Common questions"** — `FAQ_ITEMS` (6 Q&As) rendered with native `<details>/<summary>` (zero-JS, keyboard-accessible by default), summary styled in serif with a rotating chevron, `[...details]` content in muted body text.
3. **"Ready to start?" CTA** — the D2 light-band CTA.
All content lives in `src/data/site.ts` (content-as-code rule §7).

### D6 — Smaller fixes
- **K-2:** `contact-form.tsx` imports `SITE` and interpolates `SITE.email` into the two fallback strings.
- **K-3:** both `<select>`s get `aria-invalid` + `aria-describedby` wired to new `id`s (`projectType-error`, `budget-error`) on their error `<p>`s.
- **K-6/V-5:** skip-to-content link as the first focusable element in `<body>` (`sr-only` until focused, ink pill styling on focus, `z-[60]`); `<main id="main-content">`; also link it from the mobile menu path (single link serves both).
- **K-4:** `estimator.tsx` collapses the four duplicated option blocks into one generic renderer over an `OPTION_SETS` map keyed by `StepKey`, with an optional price column for the service step. Behavior-identical (verified by the estimator probe script).
- **K-8:** per-page OG images — home: `portrait-main.png`, work: `alder-pine-cover.png`, about: `portrait-about.png`, services: `detail-typography.png`, contact: `workspace.png` (case studies already have per-page OG).
- **R-2:** `PROJECT_TYPE_LABELS` / `BUDGET_LABELS` move from `contact-form.tsx` into `src/lib/contact.ts` beside their enums (exported; type-checked completeness).
- **C-3:** `sitemap.ts` stamps a stable `SITE.contentUpdatedAt` (new field, `"2026-09-13"`) instead of `new Date()`; test asserts determinism.
- **AA-4:** mobile menu moves focus to its first link on open and restores focus to the burger button on toggle-close (ref + effect focus calls only — no state-sync effects, keeping the lint contract).
- **V-10:** about page gains the D2 closing CTA band ("Work with me" → `/contact`).

### D7 — Image weight pass (P-1)
After new images are generated: convert all `public/images/*.png` to WebP (Pillow, quality ≈85, method 6). Update every reference (`projects.ts` covers/details, `getMarqueeItems` detail items, `layout.tsx` OG, `collage-strip.tsx`, per-page OG additions). Grep gate: zero `.png` references remain in `src/`. If Pillow lacks WebP support in this environment, skip and record the deferral. Expected page weight: ~2.2 MB → ~0.8 MB.

## 3. ToDo list (execution order, TDD-mapped)

**Phase A — RED: failing tests first** (all new tests fail against current code)
- [x] A1. `src/data/projects.test.ts` — coverAspect alternation invariant (L,P,L,P…; 4+4), valid enum values, details aspect validity (wide first; featured projects' second detail portrait), non-empty alt/captions, marquee: 24 items, ≥3 distinct shapes, all covers present in marquee.
- [x] A2. `src/data/site.test.ts` — `PROCESS_STEPS` (4 numbered steps, non-empty title/body), `FAQ_ITEMS` (≥5 unique q/a pairs), `SITE.contentUpdatedAt` matches `\d{4}-\d{2}-\d{2}`.
- [x] A3. `src/lib/reveal-guard.test.ts` (source-reading) — `globals.css` contains the `html:not(.js) [data-reveal]` rule and a `scripting: none` media block; `layout.tsx` theme script adds the `js` class; skip link + `id="main-content"` present in `layout.tsx`.
- [x] A4. `src/app/sitemap.test.ts` — 13 entries, deterministic `lastModified === SITE.contentUpdatedAt`, `/api/` absent.
- [x] A5. `src/lib/contact.test.ts` — labels completeness: every `PROJECT_TYPES` / `BUDGET_RANGES` value has a label (after labels move).
- [x] A6. `src/lib/estimator.test.ts` — unchanged (regression guard for D6/K-4 refactor).

**Phase B — Imagery** (no test surface; verified by file existence + build)
- [x] B1. Generate 4 portrait covers (vantage, solace, foundry, latitude) — 864×1080, matching each project's established prompt style.
- [x] B2. Generate 4 portrait detail images for featured projects (alder-pine, vantage, emberline, solace) — 864×1080.
- [x] B3. Verify all 8 files exist and decode (PIL open + size check).

**Phase C — GREEN: data + logic implementation**
- [x] C1. `projects.ts`: add `coverAspect` to all 8 projects (alternating), `aspect` to all 16 detail entries, portrait cover/detail references for the new files, marquee `shape` fields in `getMarqueeItems()`.
- [x] C2. `site.ts`: add `PROCESS_STEPS`, `FAQ_ITEMS`, `contentUpdatedAt`.
- [x] C3. `contact.ts`: add + export the two label maps.
- [x] C4. `sitemap.ts`: deterministic `lastModified`.
- [x] C5. Run tests → all GREEN (A1–A5 pass; A6 unchanged).

**Phase D — GREEN: markup, CSS, components**
- [x] D1. `globals.css`: both reveal guards (D1).
- [x] D2. `layout.tsx`: theme script `js` class; skip link; `<main id="main-content">`.
- [x] D3. `contact-form.tsx`: `SITE.email` interpolation (K-2), select a11y wiring (K-3), labels import from lib (R-2).
- [x] D4. `estimator.tsx`: generic option renderer (K-4).
- [x] D5. `site-header.tsx`: menu focus management (AA-4).
- [x] D6. `project-card.tsx` + `work/[slug]/page.tsx`: aspect-driven covers/details (D3).
- [x] D7. `marquee.tsx`: shape-driven items, `items-center` track (D4).
- [x] D8. Home `page.tsx`: light CTA band (D2).
- [x] D9. `services/page.tsx`: process + FAQ + CTA sections (D5).
- [x] D10. `about/page.tsx`: closing CTA (V-10).
- [x] D11. Per-page OG images (K-8): home, work, about, services, contact metadata.
- [x] D12. Run gates: lint, typecheck, test (all), build (20 routes + no type errors).

**Phase E — Visual/behavioral verification (prod server :3001)**
- [x] E1. Re-run interaction probe script (marquee animating; reveals; theme toggle; mobile menu incl. focus checks; estimator flow → identical totals; contact form 202 + select errors wired).
- [x] E2. No-JS spot check: `curl` HTML → `[data-reveal]` CSS guard present; emulate `scripting: none`… (agent-browser media emulation for reduced-motion re-checked).
- [x] E3. Fresh screenshots of all 6 pages (scroll discipline) + VLM parity re-review of home/work/services vs source; expect V-1/V-2/V-3/V-4/V-6 closed.
- [x] E4. OG meta spot check via curl (per-page og:image present).
- [x] E5. CWV re-measure (expect FCP/LCP no worse than baseline ±; CLS stays 0).

**Phase F — Image weight pass (D7)**
- [x] F1. Convert PNGs → WebP (Pillow q85) — all references updated; grep gate `.png` in `src/` returns nothing.
- [x] F2. Rebuild + re-screenshot one page for visual sanity; verify total weight delta.

**Phase G — Documentation realignment**
- [x] G1. `design-brand-strategy_SKILL.md` → v2.0.0 (tokens/§4 CTA grammar + shapes; §7 data fields + procedures; §8 a11y updates; §9 known-issue statuses; §12 new lessons L9+; §18 z-index (skip link); §11 gates updated counts; Appendix B audit rows; §20 types).
- [x] G2. `README.md` — design-system and testing sections, feature list, file counts.
- [x] G3. `Project_Architecture_Document.md` — new ADR-007 (fail-open reveal guard) + ADR-008 (mixed-aspect editorial rhythm + content-as-code extensions), known-issues table resolved, security notes unchanged, test counts.
- [x] G4. `AGENTS.md` / `CLAUDE.md` — command/fact drift only.
- [x] G5. `docs/REMEDIATION_PLAN.md` — mark items complete with evidence.

**Phase H — Ship**
- [x] H1. Commit sequence on `main` (5 commits: tests+data / imagery+components / verification fixes / docs / final gates) with imperative messages.
- [x] H2. SSH wrapper push to `git@github.com:nordeim/design-brand-strategy.git` (main only, no new branches).
- [x] H3. Post-push verification: remote HEAD hash match; clean tree.

## 4. Alignment validation (to re-run before execution)

Each planned change was mapped to its actual target (file + current code) during planning; before executing, re-validate: (1) the four upward-import greps still return empty; (2) `PROJECTS.length === 8`, featured === 4; (3) current class strings cited in D2/D3/D8 exist verbatim (`bg-foreground py-20 text-background`, `aspect-[3/2]`, `h-44 w-64`, etc.); (4) no `js` class logic already exists; (5) image filenames referenced in B1/B2 don't collide with existing files; (6) vitest include pattern picks up the new test file locations (`src/**/*.test.ts`).

## 5. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Mixed-height marquee changes loop seam | Keep two-copies + −50 % contract; verify with x-position probe; seam is width-invariant |
| Portrait covers alter page rhythm unexpectedly | E3 VLM re-review + screenshot diff against source rhythm; alternation invariant tested |
| WebP conversion breaks references | Grep gate for `.png` in `src/`; build must pass; fallback = skip F entirely |
| Estimator refactor changes behavior | A6 regression tests + estimator probe must produce identical totals |
| Focus effect trips react-hooks lint | Focus calls only, no setState in effect body; lint gate in D12 |
| New images style-drift | Prompts reuse the exact established style vocabulary per project |

---

## 6. Execution record (2026-09-13)

**Phase A (RED):** 26 new tests written first — all failing as designed (projects aspect contracts, site process/FAQ data, reveal-guard source-reading, sitemap determinism, label completeness).

**Phase B (Imagery):** 8 portrait originals generated (864×1152, z-ai image) — 4 covers (vantage, solace, foundry, latitude) + 4 featured-case portrait details. First run failed on an unsupported size (864×1080); corrected to the supported 864×1152 and rendered portrait at aspect-[3/4] (exact, no crop).

**Phase C (GREEN, data):** `projects.ts` coverAspect (alternating L/P), 16 detail aspect fields, marquee shape fields; `site.ts` contentUpdatedAt + PROCESS_STEPS (4) + FAQ_ITEMS (6); `contact.ts` label maps; `sitemap.ts` deterministic stamp. 39/44 green after C.

**Phase D (GREEN, markup/components):** globals.css dual no-JS guards (`html:not(.js)` + `scripting: none`); layout theme-script js class + skip link + `main#main-content`; contact-form SITE.email + select aria wiring + labels import; estimator generic option renderer (~90 duplicated lines removed); header focus management (open-focus, Escape, toggle-restore); aspect-driven ProjectCard/case pages; shape-driven marquee; CtaBand component (light band) on home/services/about; services process + native-details FAQ + CTA; per-page OG images. Gates: eslint clean, tsc clean, **44/44 tests**, build 20 routes.

**Phase E (Verification):** All 10 probe groups pass — marquee animating with mixed shapes (288×180 / 176×236); skip link sr-only→pill-on-focus; html.js + dark toggle; refactored estimator produces the identical $44k–$88k; select errors wired (describedby/invalid/id) + API 202; mobile menu focus moves to first link, Escape closes and restores focus; services page shows all sections + FAQ toggles; reduced-motion honored; **/work grid alternates 1.60/0.75 exactly like the source**; CWV TTFB 11.9ms / FCP 144ms / CLS 0 / LCP 700ms (no regression). VLM re-review: CTA band FIXED, mixed grid FIXED, services sections PRESENT, design language MATCH.

**Phase F (WebP):** 4 unreferenced landscape covers deleted; 19 images converted (q85, method 6); all references rewritten (8 files); zero `.png` refs remain in src/. **Measured gain: 2694KB → 2442KB (9%)** — far below the ~60% estimate; these editorial images were already efficiently compressed. Kept WebP (visually lossless, zero broken images, modern format); the honest delta is recorded here and in the SKILL lessons rather than claimed.

**Phase G (Docs):** SKILL.md → v2.0.0; README/PAD/AGENTS/CLAUDE realigned; audit-history appendix updated.

**Phase H (Ship):** commits to main + SSH push (recorded below after execution).

**Phase H (Ship) record:** two commits on `main` (no new branches):
- `4d7572c` — feat: remediation pass 1 (58 files, +817/−231: src + 19 WebP images)
- `c3f10fb` — docs: SKILL.md v2 + audit reports + realigned docs (8 files, +1867/−33)

Pushed via the paramiko SSH wrapper to `git@github.com:nordeim/design-brand-strategy.git`;
remote `origin/main` verified equal to local (`c3f10fb`), working tree clean.

---

# Pass 2 — Remediation Plan (2026-09-13, second session)

**Inputs:** `docs/AUDIT_VISUAL_PARITY.md` § Pass 2 (F-1…F-14, all mechanically measured on both sites) + Playwright e2e suite (80 specs) now available as the RED/GREEN harness.
**Method:** TDD per `test-driven-development` — update/write the failing e2e expectation first (RED), apply the minimal markup/data change (GREEN), re-run the full suite. Per `planning-and-task-breakdown`, each phase is independently verifiable and sized to one logical change.
**Branch policy:** main only (operator contract).

## P2 scope decisions

**In scope (12 fixes):**

| # | Finding | Fix |
|---|---|---|
| P2-1 | F-1 `/work` missing closing CTA | Add `CtaBand` (light band) to `/work` with original copy |
| P2-2 | F-2/F-12 estimator interaction model | Rebuild `Estimator` as a static four-group form: groups 1 Project type / 2 Business stage / 3 Timeline / 4 Deliverables, all options visible, estimate gated until all four are chosen ("Complete all selections to see your personalized estimate."), option prices dropped (source shows bare labels) |
| P2-3 | F-13 label parity | Timeline labels gain durations ("Flexible (12+ weeks)" … "Rush (under 6 weeks)"), scope "Core" → "Core Essentials"; referral field becomes a select (Referral / Social Media / Search Engine / Press / Publication / Other) — options colocated in `lib/contact.ts` |
| P2-4 | F-3 contact field layout | Single-column stacked fields (drop the two 2-col grids) |
| P2-5 | F-14 contact column inversion | Form left (col-span-7), studio info right (col-span-4/start-9) — source measured form x=160, mailto x=843 |
| P2-6 | F-4 portrait ratio | `aspect-[4/5]` (0.80, source-measured) for portrait covers, home about-teaser portrait, about-hero portrait, case detail portraits |
| P2-7 | F-5 case hero | Uniform `aspect-[7/3]` wide banner from the cover (source object-crops its 1280×800 covers the same way) |
| P2-8 | F-6/F-6b about hero + approach | Hero becomes split: label/h1/bio left col-7, portrait right col-5; approach principles render as a 3-column grid |
| P2-9 | F-7 home teaser inversion | Text left (col-7) + portrait right (col-5) — matches source (portrait x=771) |
| P2-10 | F-8 home services | 3-column horizontal cards (name + one-liner) instead of vertical rows |
| P2-11 | F-9 services process | 5 horizontal steps (add an original "Refinement" step), grid-cols-5 on md+ |
| P2-12 | F-10/F-11 card grammar + marquee shapes | ProjectCard meta → uppercase services · year (drop index/summary/tags from cards — summaries remain on case pages); marquee shapes → tall 4:5 (w-44 h-55), wide 5:4 (w-72 h-58), landscape 4:3 (w-64 h-48) |

**Deferred with rationale (documented, not fixed):**
- Awards-row column arrangement (source stacks org+title in a middle column) — measured but low-impact compositional nuance; recorded in the audit.
- 6 services vs source 4, richer service rows, case-study prose depth — original content richness (pass-1 framework).
- Contact success/429 copy, dark mode, collage strip, availability pill — pass-1 acceptances re-affirmed.
- WebKit e2e project — no cached browser binary in this sandbox; chromium + Pixel-7 emulation cover the shipped surface.

## P2 validation against the codebase (pre-execution)

Checked before writing any code:
1. `CtaBand` props (`label/title/body/href/linkText`) support the `/work` band without modification — verified in `src/components/cta-band.tsx`.
2. `Estimator` already renders from `OPTION_SETS` (K-4 refactor) — the static redesign reuses it directly; `estimateRange` requires a complete selection (fail-fast on unknown ids), so the gate is `serviceId && stageId && timelineId && scopeId`.
3. `TIMELINES`/`SCOPES` live in `src/data/site.ts` — label changes are data-only; ids unchanged so `estimator.test.ts` (pure math) stays valid.
4. `contactSchema.referral` is `string ≤200 optional` — a select emits values, so no schema change; `contact.test.ts` stays valid.
5. Portrait sources are 864×1152 (3:4) — rendering at 4:5 crops ≈6% with `object-cover` (source does the same to its 1280×800 set); case-hero 7:3 crops landscape covers ≈31% vertically and portrait covers harder, identical to source behavior (measured intrinsic 1280×800 → rendered 2.33).
6. Filename collision check: no new files except none — all changes are edits to existing files; e2e spec updates touch `estimator.spec.ts` (rewrite), `contact.spec.ts` (referral select), `parity.spec.ts` (ratio + marquee + card grammar assertions), `smoke.spec.ts` (card grammar).
7. `/work` CtaBand placement: after the project grid `Container`, before the implicit footer — mirrors home/services/about usage.

## P2 execution order (TDD)

RED → GREEN per step, full suite after each:
1. P2-2/P2-3 (estimator + labels + referral select) — largest change, rewrite `estimator.spec.ts` first
2. P2-4/P2-5 (contact layout)
3. P2-6/P2-7 (portrait ratio + case hero) — update `parity.spec.ts` expectations
4. P2-8/P2-9 (about hero/approach + home teaser)
5. P2-10/P2-11 (home services + process)
6. P2-12 (card grammar + marquee shapes)
7. P2-1 (/work CTA) + full-suite verification + visual re-probe of both sites

---

# Pass 2 — Execution Record (2026-09-13)

Executed per the TDD order above; every step followed RED → GREEN with the e2e suite as the harness.

| Step | RED evidence | GREEN change | Verification |
|---|---|---|---|
| P2-2/P2-3 estimator + labels + referral | `estimator.spec.ts` rewritten for the static model — 6 failures against the wizard | `estimator.tsx` rebuilt as static four-group form (2×2 group grid, gated estimate, `OPTION_SETS` reused); `TIMELINES` labels gain durations; `SCOPES` "Core" → "Core Essentials"; `REFERRAL_OPTIONS`/`REFERRAL_LABELS` added to `lib/contact.ts`; form referral → select | 7/7 estimator specs green; live probe: 4 groups × 15 radios, "Complete all selections…" gate |
| P2-4/P2-5 contact layout | (covered by label-wiring + visual probes) | form fields single-column; form left (col-7) / studio info right (col-4/start-9) | live probe: form x=64, mailto x=859 (source: 160/843 — same sides); contact specs green |
| P2-6/P2-7 portrait + case hero | `parity.spec.ts` expectations updated to 4:5 + new 7:3 hero spec (failed against 3:4 / per-project hero) | `project-card.tsx` portrait → `aspect-[4/5]`; `work/[slug]` hero → uniform `aspect-[7/3]`, detail portrait → `aspect-[4/5]`; home about-teaser portrait → 4:5 | live probe: /work rhythm `[1.6,0.8,…]`, case hero 2.33 |
| P2-8/P2-9 about hero/approach + home teaser | (visual probes; no spec change needed) | about hero → split (label/h1/bio col-7, portrait col-5); approach → 3-column grid; home teaser → text left / portrait right | live probe: h1 x=64 / portrait x=759; approach titles x=64/461/859 same row |
| P2-10/P2-11 home services + process | (visual probes; `site.test.ts` updated to the new 5-step contract — failed at 4) | home services → 3-column cards; `PROCESS_STEPS` → 5 steps (original "Refinement" copy), services process → `lg:grid-cols-5` horizontal | live probe: service cards x=64/461/859; process steps x=64→1018 same row; unit test green |
| P2-12 card grammar + marquee shapes | new "minimal editorial meta grammar" spec (failed against index/summary cards) | `ProjectCard` → title + uppercase practice line · year; `index` prop removed; marquee shapes → tall 4:5 / wide 5:4 / landscape 4:3 | parity spec green; marquee distinct heights ≥ 3 |
| P2-1 /work CTA | (visual probe — band absent) | `CtaBand` added to `/work` ("Have something in mind? / Let's discuss your project.") | live probe: band rendered; curl HTML contains the copy |

**VLM refinement round:** the post-fix VLM comparison flagged the estimator's bordered card container (source floats options on the page background in a 2-column group arrangement) and the card meta split. Both fixed: estimator de-boxed into an open band with a 2×2 group grid; card meta moved to a single line (uppercase services left, year right).

**Final gates (all green):** eslint clean · `tsc --noEmit` clean · vitest 44/44 · `next build` 20 routes · Playwright **81/81** (chromium + Pixel-7 mobile) · live re-probes match source measurements exactly.

**Deferred (re-affirmed):** awards-row column arrangement (measured, low-impact), 6-vs-4 services and richer service rows (content richness), dark mode / collage strip / availability pill (pass-1 acceptances), WebKit e2e project (no cached binary).

---

# Pass 3 — Remediation Plan (2026-09-14, third session)

**Inputs:** Live-site E2E validation (81/81 Playwright specs green against `https://design-brand-strategy.jesspete.shop`) + live CWV/CLS probing + visual parity re-audit vs `https://editorial-portfolio-9d8e325b.lovable.app` (VLM + geometry probes) + docs/code alignment audit post-commit `50c357f` ("add skills" — Prisma/ADR-011 integration).
**Method:** TDD per `skills/tdd` + `skills/test-driven-development` — failing test first (RED), minimal change (GREEN), full gate after each slice. E2E lessons per `skills/e2e-testing-lessons` (Playwright as the regression harness; API + UI hybrid assertions).
**Branch policy:** main only (operator contract). `skills/` excluded from all checks/tests/compilation (operator contract).

## P3 findings (measured evidence)

| # | Severity | Finding | Evidence |
|---|---|---|---|
| P3-1 | HIGH | `/work/<bogus-slug>` returns **HTTP 200** with not-found content + `Cache-Control: s-maxage=31536000` (1-year CDN cache directive) — soft-404s pollute SEO and can fill the CDN cache | `curl -o /dev/null -w %{http_code}` → 200 on live + local; `x-nextjs-prerender: 1`; e2e 404 spec only covers top-level unknown routes |
| P3-2 | HIGH | Cold-load **CLS 0.31** on live (Core Web Vitals POOR; flaky ~50–75% of cold loads) | layout-shift entries: single 0.31 shift at ~240–390 ms, source FOOTER `y:621 → 0×0`; local=0, warm-cache=0; reproduced deterministically via gap-proxy (300 ms mid-HTML delivery gap) — `WORST CLS: 0.3100` |
| P3-3 | HIGH (mechanism) | Root cause of P3-2/P3-1: root `src/app/loading.tsx` creates a root Suspense boundary → Next 16 streams the layout shell (header + loading fallback + **footer @ byte 6981**) before page content (byte 14861+) → Chrome paints the partial DOM during CF-proxied delivery gaps → footer jumps ~5400 px; the streamed `notFound()` for bogus slugs renders inside a 200 shell | Byte-offset probes; `<!--$?--><template id="B:0">` + `$RC` move-script in prerendered HTML; removing the boundary makes the stream document-ordered (footer @ byte 39496) and both P3-1 and P3-2 disappear |
| P3-4 | MEDIUM | Cloudflare Web Analytics beacon blocked by app CSP (`script-src 'self' 'unsafe-inline'`) — console error on every live page, analytics dead | Console: `Loading the script 'https://static.cloudflareinsights.com/beacon.min.js/…' violates CSP` |
| P3-5 | MEDIUM | **typecheck no longer covers `e2e/`** — `tsconfig.json` excludes `e2e` + `scripts` (added in `50c357f`), contradicting AGENTS/CLAUDE/SKILL ("covers e2e specs") | `git show 50c357f -- tsconfig.json`; the underlying cause was a **duplicate playwright-core** (root 1.62.0 + nested 1.63.0) in `bun.lock` making tsc fail on spec files |
| P3-6 | MEDIUM | Docs drift post-ADR-011: CLAUDE.md ("No database"), README.md ("no persistence by design"), SKILL.md v2.1.0 ("no database", ADR-002, "44/44 tests", "15 images PNG", playwright 1.62.0) all stale vs the Prisma/SQLite code | Doc reads + `prisma/schema.prisma`, `src/lib/db.ts`, 52 unit tests, 19 WebP |
| P3-7 | MEDIUM (hygiene) | `db/custom.db` **tracked in git** (27 test rows — e2e contact submissions) despite `.gitignore` `/db/*.db` "PII — never commit" | `git ls-files` → `db/custom.db`; row dump: 27 × "Jordan Lee" test data |
| P3-8 | LOW (hygiene) | `.env` tracked in git (template, no secrets) while gitignored; `package-lock.json` tracked (8045 lines) though bun is canonical | `git ls-files` |
| P3-9 | MEDIUM (missing tooling) | `docs/ssh_git_wrapper_v3.py` + `docs/how-to-git-push-using-ssh-wrapper_SKILL.md` referenced by the operator but **absent from the repo** | `ls docs/` |
| P3-10 | LOW (host-config) | Cloudflare Email Obfuscation rewrites `studio@elenavance.com` in SSR HTML (`data-cfemail` spans) — hydration-mismatch risk + pre-decode flash | HTML grep: `cdn-cgi/l/email-protection#…` on `/` and `/contact` |
| P3-11 | INFO | Lockfile dependency drift: `@playwright/test` resolves to **1.63.0** (Chromium 153) — docs claim "pinned to 1.62.0 (Chromium 151)" | `bun pm ls`; browser cache `chromium_headless_shell-1243` |

## P3 scope decisions

**In scope (fix now):**

| # | Fix | Files |
|---|---|---|
| P3-F1 | Remove the root loading boundary → single-shell document-order stream (fixes P3-1 at the mechanism level + P3-2/P3-3) | delete `src/app/loading.tsx` |
| P3-F2 | `export const dynamicParams = false` on `/work/[slug]` — unknown slugs hard-404 at the router, never render, never cache (defense-in-depth for P3-1) | `src/app/work/[slug]/page.tsx` |
| P3-F3 | CLS regression guard: e2e spec asserting the home HTML stream is document-ordered (footer byte > content byte, no `$RC` move-script, no `<!--$?-->` boundary) + `scripts/cls-regression.mjs` gap-proxy harness (documented, manual/CI-optional) | `e2e/parity.spec.ts` (or new spec), `scripts/cls-regression.mjs` |
| P3-F4 | 404 regression guard: e2e spec asserting bogus case slugs return 404 (+ the existing top-level 404 assertion stays) | `e2e/smoke.spec.ts` |
| P3-F5 | CSP: allow the Cloudflare analytics beacon (`script-src` += `https://static.cloudflareinsights.com`) with a documented rationale — the deployment host's analytics is clearly operator-intended | `next.config.ts`, e2e header contract, docs |
| P3-F6 | Dedupe `playwright-core` in `bun.lock` (single 1.63.0, no nested copy) → re-include `e2e` + `scripts` in `typecheck` (restore the documented contract) | `bun.lock`, `tsconfig.json` |
| P3-F7 | Untrack `db/custom.db`, `.env`, `package-lock.json` (git rm --cached) + gitignore `package-lock.json` | git index, `.gitignore` |
| P3-F8 | Create `docs/ssh_git_wrapper_v3.py` (SSH-key wrapper for `git push`) + `docs/how-to-git-push-using-ssh-wrapper_SKILL.md` (operator runbook) | new docs |
| P3-F9 | Docs realignment: CLAUDE.md (Prisma/ADR-011, commands, counts), README.md (persistence, hierarchy, counts, CSP note, CF deployment notes), SKILL.md v2.2.0 (ADR-011/012, project_state 52 tests, stack table, env vars, §11 gates, lessons L14/L15, audit history pass 3), AGENTS.md (typecheck coverage true again, playwright 1.63.0, CSP note, db steps already present), PAD (playwright pin, ADR-012 reference) | 5 docs |
| P3-F10 | Host-config recommendations documented (P3-10 email obfuscation OFF; verify CF analytics after P3-F5) | README/SKILL deployment notes |

**Deferred with rationale:**
- Header height 81 vs source 96 px — accepted pass-2 geometry (scroll-padding contract intact); changing it re-opens z-index/scroll audits for zero user value.
- Responsive image variants (K-5) — ADR-006 accepted trade; host optimizer territory.
- In-memory rate limiter (K-7) — accepted for scope; documented.

## P3 validation against the codebase (pre-execution — all verified)

1. **P3-F1/P3-F2 empirically validated** (sandbox probes, since reverted): removing `src/app/loading.tsx` → footer byte 6981→39496 (content 14861 precedes footer), gap-proxy CLS 0.3100→**0.0000** (3/3 runs), bogus-slug **200→404**; adding `dynamicParams = false` → bogus 404 + real slug 200; all static routes still prerender (20/20).
2. **P3-F6 validated**: `bun.lock` root `playwright-core@1.62.0` + nested `playwright-core@1.63.0` confirmed; after dedupe `bun install --frozen-lockfile` passes and `tsc --noEmit` with `exclude: ["node_modules","skills"]` is clean (e2e + scripts included).
3. **P3-F5**: `e2e/smoke.spec.ts` asserts CSP via `toContain` per-directive — adding the beacon origin only requires updating the docs' CSP transcription + the spec's expected string if it pins the full header (it does not — contains-checks only; verify during execution).
4. **P3-F7**: `.gitignore` already lists `.env` and `/db/*.db`; CI (`verify-gate.yml`) provisions its own `.env` from `.env.example` — untracking both is CI-safe. `package-lock.json` is npm noise (bun.lock canonical); add ignore entry.
5. **P3-F8**: remote `origin` is currently `https://github.com/nordeim/design-brand-strategy.git`; the wrapper must set/use the SSH remote `git@github.com:nordeim/design-brand-strategy.git` with `GIT_SSH_COMMAND` pointing at a 0600 key file.
6. **P3-F9**: doc claims to reconcile were enumerated by direct read (P3-6 table); PAD already updated for 19 WebP images in `50c357f` — only the playwright pin + ADR-012 reference remain stale there.
7. Gates green at baseline after the lockfile dedupe: lint ✓, typecheck ✓, 52/52 ✓, build 20 routes ✓, e2e:all 81/81 ✓.

## P3 execution order (TDD — RED → GREEN per slice, full gate after each)

1. **Slice A (P3-F1 + P3-F2 + guards):** RED — new e2e specs fail: bogus `/work/slug` expects 404 (gets 200); stream-order spec expects document-ordered HTML (gets shell-split with footer @ ~byte 6981). GREEN — delete `src/app/loading.tsx`; add `dynamicParams = false`. Verify: specs green, gap-proxy CLS 0.0000, full suite.
2. **Slice B (P3-F5):** RED — extend `smoke.spec.ts` header contract to expect `cloudflareinsights.com` in `script-src` (fails against current CSP). GREEN — add the origin to `next.config.ts` CSP with rationale comment. Docs updated in Slice E.
3. **Slice C (P3-F6):** already applied + validated (lockfile dedupe, tsconfig re-include). Gate: `tsc` with e2e/scripts included stays clean; `bun install --frozen-lockfile` passes.
4. **Slice D (P3-F7 hygiene):** `git rm --cached db/custom.db .env package-lock.json`; gitignore `package-lock.json`; `git status` clean of unintended deletions (files remain on disk).
5. **Slice E (P3-F8 + P3-F9 + P3-F10 docs):** create the SSH wrapper + runbook; realign CLAUDE.md, README.md, SKILL.md v2.2.0, AGENTS.md, PAD; document CF host recommendations (email obfuscation OFF, analytics verification).
6. **Final verification:** lint → typecheck → test → build → e2e:all (expect 81 + new specs) + gap-proxy CLS harness + live-site re-probe of the fixed behaviors (bogus-slug 404 where deploy allows; header/CSP spot-check) + commit + push via the wrapper.

## P3 risks & mitigations

- **Removing loading.tsx changes navigation UX for slow dynamic renders** — all routes are static or near-instant (`/contact` reads only `searchParams`); prefetch makes nav instant. Monitor FCP/navigation timing in the final probe.
- **CSP loosening** — one additional script origin, host-pinned and documented; frame-ancestors/object-src stay hard. If the operator later disables CF analytics, the directive is inert (harmless).
- **Untracking `.env`** — deployment pipelines that clone the repo must `cp .env.example .env` (CI already does exactly this; documented in README deployment + wrapper runbook).
- **`dynamicParams = false`** — if a future project is added without regenerating params, its page 404s at build time instead of rendering on demand: acceptable for an SSG-only contract (generateStaticParams is the single source of slugs), and `projects.test.ts` pins data-driven params.

---

# Pass 3 — Second Remediation Cycle: Execution Record (2026-09-14)

Driven by `docs/AUDIT_CODE_REVIEW.md` § Pass 3 (tiered review + security audit). TDD per `skills/tdd`.

| Step | RED evidence | GREEN change | Verification |
|---|---|---|---|
| R2-1 (AUD-1) rate-limit client-key hardening | `src/lib/rate-limit.test.ts` written first — 5 clientKey tests failed (cf-connecting-ip ignored; first-hop XFF keyed) | `clientKey()` trust order: `cf-connecting-ip` → **last** XFF hop (proxy-appended) → `x-real-ip` → `local`, with whitespace/empty handling | 10/10 rate-limit tests; full suite **62/62** (was 52); e2e contact specs unaffected (single-hop spoof pattern keys on itself) |
| R2-2 (AUD-2) PII posture docs | (doc contract mismatch — SKILL §13 claimed "lengths and enums only") | SKILL §13 + `api/contact/route.ts` comment corrected: message body never logged; name/email/company/referral ARE logged as delivery-hook data and persist to SQLite — treat `contact_inquiry` lines as PII-bearing, bounded retention | Doc/code alignment re-verified |
| R2-3 (AUD-3) deepmerge-ts advisory | — (accepted-risk, no code change) | Recorded in the audit report: transitive via `prisma` CLI → `@prisma/config` (exact pin 7.1.5); runtime `@prisma/client` has zero deps; no attacker-controlled config input | `bun audit` output + dep-chain analysis archived in audit |
| R2-4 (AUD-4/5/6) | — | Documented-accepted (honeypot client-side by design; history residue synthetic-only; oversized-body parse-then-reject bounded by the fixed limiter) | Audit table |

**Final gate after the second cycle:** lint ✅ · typecheck (e2e+scripts) ✅ · 62/62 unit ✅ · build 20 routes ✅ · 83/83 e2e ✅ · CLS harness 0.0000 ✅.

---

# Pass 4 — Remediation Plan: Live-Deploy E2E Environment Awareness (2026-09-14)

**Date:** 2026-09-14 (fourth session)
**Inputs:** Pass-4 live-site E2E run (chromium 76/78 + mobile 5/5 against `https://design-brand-strategy.jesspete.shop`), VLM + DOM parity re-audit vs the source site, live deploy-state probes.
**Method:** TDD per `skills/tdd` / `skills/test-driven-development` (RED → GREEN per slice; the failing live-run IS the RED evidence for P4-F1). Planned per `skills/planning-and-task-breakdown`.
**Branch policy:** all work on `main` (operator contract — no new branches). Conventional Commits, atomic slices.

## 1. Findings (from the live-deploy E2E + parity validation)

| ID | Sev | Finding | Evidence |
|---|---|---|---|
| P4-F1 | **High (test-suite)** | The two rate-limit isolation specs (`burst over the limit trips 429`, `client keys are isolated`) fail whenever the suite runs against an edge-proxied external server (`E2E_BASE_URL` = the live Cloudflare deploy). AUD-1's correct trust order keys every request by the unforgeable `cf-connecting-ip`, so per-test spoofed `x-forwarded-for` values no longer isolate buckets — one machine = one bucket shared across all specs. The documented `E2E_BASE_URL` use case ("reuse an external server, e.g. the live deploy") is therefore broken for exactly these two specs, and a doc claim ("tests spoof unique `x-forwarded-for` values to stay isolated") is now origin-dependent. | Live run: `contact.spec.ts:74` expected `[202,202,202,202,202,429]`, got early 429 (earlier specs in the same file had already consumed the shared bucket — rate limiting runs BEFORE validation, so 400s also count); `contact.spec.ts:99` fresh-XFF request returned 429. Local run (self-managed `next start`, no edge): 83/83. |
| P4-F2 | Medium (deploy tooling) | The operator-facing "suggested next steps" from pass 3 (verify email-obfuscation OFF, security headers, hard-404, cold-load CLS on the live deploy) exist only as prose. Measured now: **Cloudflare Email Address Obfuscation is STILL ON** — the live `/contact` HTML contains two `/cdn-cgi/l/email-protection` rewrites (studio email in the contact rail + footer), exactly the hydration-mismatch + `[email protected]`-flash risk README § Deployment warns about. There is no repeatable script that turns these deploy-state checks into a gate. | `curl -s …/contact | rg -c "cdn-cgi/l/email-protection"` → 2; README "Cloudflare-fronted deploys" bullet. |
| P4-F3 | Low (docs) | `robots.txt` on the live deploy is prepended with Cloudflare Managed Content (content-signals preamble + AI-bot blocks); the app's own directives (Allow /, Disallow /api/, Sitemap pointer) remain intact below it. Undocumented in the deployment notes; operators seeing the padded file need to know it is expected CF behavior, not an app bug. | `curl -s …/robots.txt` — `# BEGIN Cloudflare Managed content` … `# END Cloudflare Managed Content` then the app block. |
| P4-F4 | Info (docs) | Pass-4 parity re-validation (VLM pairwise + DOM verification + geometry probes) is not yet recorded in `docs/AUDIT_VISUAL_PARITY.md` — the audit trail should show the post-pass-3-live-deploy state: HIGH fidelity, all VLM-flagged gaps DOM-refuted, aspect rhythms exact. | `tool-results/parity-pass4/` artifacts + this session's probes. |

**Non-findings (verified clean, no action):** live cold-load CLS 0.0000 (×2); no console/page errors on any live page (no hydration mismatches manifesting despite the obfuscation rewrites — the decode script wins the race today, the risk remains); bogus-slug hard-404 live; full security-header set live; estimator four groups + gated estimate + timeline durations live; work-grid aspect rhythm byte-identical to source; marquee mixed shapes match; all VLM structural claims (theme toggle, sub-labels, approach grid, italic sub-heads, footer email, Challenge/Approach/Outcome sections) DOM-verified present.

## 2. Design decisions

### D1 — Environment-aware rate-limit isolation specs (P4-F1) — *design corrected by pre-execution validation*
The specs must keep their full strength on self-managed origins (local `next start`, CI) and degrade **explicitly and loudly** (dynamic skip with a printed reason, never silently pass) when the target keys requests by an unforgeable edge header.

**Validated design (corrections from the pre-execution check):** a dedicated beforeAll capability probe was rejected — it would consume the shared bucket BEFORE the earlier 202-expecting specs and break them on edge-fronted origins (and re-running the suite within the 10-min window would trip it). Playwright's `test.skip(condition, description)` inside a test body (validated on 1.63: skips with a visible reason; module-level flags persist across tests under `workers: 1`) is the right mechanism. Both specs become **self-diagnosing in situ**:

- **Burst spec:** send the 6 same-XFF requests as today, then classify the status sequence with a pure helper `classifyBurstStatuses(statuses, limit)` in `src/lib/rate-limit.ts` — `"isolated"` (exactly `[202×5, 429]` → assert the full contract incl. Retry-After), `"shared"` (a 429 appears before the limit-th response, or all 429 → edge-fronted shared keying → dynamic skip with evidence), `"broken"` (no 429 at all → limiter regression → hard fail). Unit-testable RED-first seam, colocated with `clientKey` whose behavior it characterizes.
- **Isolation spec:** burn the `burned-<ts>` bucket as today, then send the fresh-XFF request: `429` despite a never-before-seen XFF value is *proof* of shared keying → dynamic skip; `202` → the assertion passes as today. Any other status → the expect fails loudly (real regression).
- **Valid-payload spec:** one robustness guard — on a `429` (bucket pre-burned by a prior run within the window on a shared-key origin), dynamic-skip with reason; local runs keep the exact `202` assertion. (Local/self-managed runs are the authoritative contract check; live runs validate deploy-state.)
- Zero additional requests are introduced; the live suite becomes idempotent within the rate-limit window instead of flaky.

### D2 — Repeatable live-deploy audit script (P4-F2)
`scripts/live-deploy-audit.mjs` (node, zero deps beyond the repo): env `LIVE_URL` (default the production origin). Checks, each PASS/FAIL with evidence: (1) `/api/health` ok; (2) security-header contract incl. CSP directives (same set as `smoke.spec.ts`); (3) unknown `/work/<slug>` → 404; (4) `robots.txt` contains the app's `Sitemap:` pointer; (5) `/contact` HTML contains **no** `/cdn-cgi/l/email-protection` rewrites (email obfuscation OFF — the currently-failing deploy-state item); (6) cold-load CLS ≤ 0.1 (PerformanceObserver, 2 navigations). Exit 0 only if all pass; exit 1 with a remediation hint per failure (e.g. "Cloudflare dashboard → Scrape Shield → disable Email Address Obfuscation"). This is deploy-state tooling, deliberately **not** an e2e spec — the suite validates the code contract, the script validates the operator's dashboard.

### D3 — Docs (P4-F3, P4-F4, and D1 fallout)
README § Deployment: add the CF Managed `robots.txt` preamble note; point operators at `scripts/live-deploy-audit.mjs` as the post-deploy checklist. AGENTS.md e2e section + CLAUDE.md testing notes: qualify the XFF-isolation claim with the edge-proxy skip behavior. SKILL.md: § test-strategy claim + a Pass 4 change log + lesson (edge-fronted targets change rate-limit semantics for the suite). `docs/AUDIT_VISUAL_PARITY.md`: append the Pass 4 re-validation record.

## 3. Validation against the codebase (pre-execution)

1. `src/lib/rate-limit.ts` exports `clientKey`/`rateLimit`; adding a third pure export keeps the module contract single-purpose (keying + probing are one concern). `src/lib/rate-limit.test.ts` (10 tests) is the RED home for the new verdict tests.
2. `e2e/contact.spec.ts` describe "contact API contract" — validated on Playwright 1.63 in this sandbox: `test.skip(condition, description)` called **inside the test body** performs a dynamic skip with a visible reason; module-level state persists across tests in one file under `workers: 1` (probe spec executed: set-flag → conditional-skip → pass). Declaration-time `test.skip(cond, …)` evaluates at collection (too early) — hence the in-body pattern. The `request` fixture is available per-test; the two specs already use it.
3. Probe constant: the route pins `LIMIT = 5` server-side; the spec hard-codes the same 5/6 arithmetic today (its header comment says "5 requests per 10-minute window") — the probe mirrors that existing convention (no import of server constants into specs exists, and route internals are not exported).
4. `scripts/` are typecheck-covered (tsconfig excludes only `node_modules` + `skills`); a `.mjs` script is fine (existing `cls-regression.mjs` precedent — not type-checked, node-run).
5. The CLS measurement approach in D2 mirrors `scripts/cls-regression.mjs`'s PerformanceObserver pattern; against a remote origin no gap-proxy is needed (real network).
6. Docs touched: `README.md` (Deployment), `AGENTS.md` (Playwright e2e suite section), `CLAUDE.md` (Testing Strategy), `design-brand-strategy_SKILL.md` (§ e2e + change log + lesson), `docs/AUDIT_VISUAL_PARITY.md` (append Pass 4). None of the changed claims are load-bearing for Tier-0 contract checks beyond adding the qualification.

## 4. Execution order (TDD)

1. **Slice A (P4-F1):** RED — unit tests for `classifyBurstStatuses` (fail: function absent). GREEN — implement in `src/lib/rate-limit.ts`. Then wire in-body dynamic skips into `e2e/contact.spec.ts` (burst: classify → skip/fail; isolation: fresh-XFF 429 → skip; valid: 429 → skip). Verify: local `bun run e2e` (all specs RUN and pass — no skips); live `E2E_BASE_URL=… e2e` (isolation-dependent specs SKIP with reasons, suite green); unit suite 62+new; re-run live within the 10-min window (idempotent — the valid spec skips instead of failing).
2. **Slice B (P4-F2):** create `scripts/live-deploy-audit.mjs`; run against local prod server (expect all PASS incl. email check — no edge) and against live (expect exactly one FAIL: email obfuscation, with the dashboard remediation hint). 
3. **Slice C (P4-F3/P4-F4 + D1 doc fallout):** README, AGENTS, CLAUDE, SKILL (v2.3.0 change log + new lesson L16), AUDIT_VISUAL_PARITY Pass 4 record.
4. **Final gate:** lint → typecheck → test (expect 62+N) → build → e2e:all local (83/83) → e2e against live (all pass or explicitly-skipped) → `scripts/live-deploy-audit.mjs` against live (documents the one known open deploy-state item).

## 5. Risks & mitigations

- **Skip logic masking a REAL limiter regression on self-managed origins** — the probe itself is a limiter test (6 unique-XFF requests must stay 202 on an XFF-keyed origin; any 429 → shared → skip). A broken limiter that never 429s would make the burst spec's final assertions fail (they assert a 429 occurs), so the suite still catches limiter regressions on self-managed origins; on edge-fronted origins the limiter is not the app's contract anyway (the edge enforces per-IP identity).
- **Probe requests pollute the live inquiry sink** — bounded (6), synthetic, consistent with the existing spec traffic; the live DB already carries 27+ synthetic rows from prior validation runs.
- **CLS probe flakiness on a remote origin** — two navigations, both must be ≤ 0.1; warm-cache effects skew low, cold-load skew is the actual risk being measured.

---

# Pass 4 — Second Remediation Cycle: Plan & Execution Record (2026-09-14)

Driven by `docs/AUDIT_CODE_REVIEW.md` § Pass 4 (tiered review + security audit — verdict: safe to ship; backlog documentation-only). Method per `skills/tdd` where code changes exist (R4-1/R4-2 are doc contracts; the RED evidence is the audit's T0 drift table itself).

## Scope

| Item | Action | RED evidence (audit) |
|---|---|---|
| R4-1 | PAD realignment: 62→71 tests (§ testing summary + anywhere the count appears); ADR-009 rationale gains the P4-F1 edge-fronted qualification (spoofed-XFF isolation holds on self-managed origins; edge-fronted external runs self-diagnose and skip loudly); testing-tooling inventory gains `classifyBurstStatuses` (with its unit-test home) and `scripts/live-deploy-audit.mjs` | T0-1/T0-2/T0-3 |
| R4-2 | SKILL.md §11 pre-ship checklist gains the post-deploy step (run `scripts/live-deploy-audit.mjs` against the live origin after every deploy/dashboard change); Appendix C cross-references the script as the codified live-validation harness | Audit backlog #2 |
| R4-3 | **Deferred with rationale** (not executed): dead-page guard in the audit script's CLS check — checks 1–5 already gate origin liveness, so a dead page cannot reach a green CLS verdict in practice; revisit only if the script grows standalone use | Audit nit |

## Validation against the codebase (pre-execution)

1. PAD drift lines located by direct read: the "62 tests" claim (~line 493), the ADR-009 rationale (~line 135), and the tooling inventory (§12/§14 region). No other stale counts (`rg "62"` in PAD shows exactly one test-count hit).
2. SKILL §11's gate block already lists lint/typecheck/test/build/e2e/cls-regression — appending the post-deploy audit step is additive, non-contradictory. Appendix C (post-deploy live-site validation) is the natural home for the cross-reference; it currently describes manual probing only.
3. No code files change in this cycle → no TDD seams; the verification gate is the full mechanical suite (unchanged expectations: 71/71, 83/83) plus a `rg` re-check that the stale claims are gone (GREEN condition for the doc contract).

## Execution record

| Step | Change | Verification |
|---|---|---|
| R4-1 | PAD: test count 62→71 with the classifier named; ADR-009 rationale qualified (self-managed vs edge-fronted origins, `classifyBurstStatuses`, loud skips); tooling inventory adds the deploy-audit script | `rg "62 tests" Project_Architecture_Document.md` → no hits; new claims match `package.json`/`src/lib/rate-limit.ts`/`scripts/` reality |
| R4-2 | SKILL §11 + Appendix C gain the post-deploy audit step | SKILL change log v2.3.0 already describes the script; checklist now points to it |
| Final gate | lint · typecheck · 71/71 unit · build 20 routes · 83/83 e2e local · live suite green (skips loud) · `rg` drift re-scan clean | All green post-change |

# Pass 5 — Remediation Plan: Live-Deploy E2E + Parity Validation (2026-09-14)

**Date:** 2026-09-14 (fifth session; prompt `docs/prompt-to-review-3.md`)
**Inputs:** Full gate re-run at the post-pass-4 baseline (`3c38b8b`), full e2e suite against the live deploy (`E2E_BASE_URL=https://design-brand-strategy.jesspete.shop`, chromium + Pixel-7), `scripts/live-deploy-audit.mjs`, VLM pairwise + DOM + geometry parity re-audit vs the source site (`https://editorial-portfolio-9d8e325b.lovable.app/`), contract-drift scan across the five contract docs, git-hygiene scan of tracked files.
**Method:** planned per `skills/planning-and-task-breakdown`; remediation follows the TDD policy of `skills/tdd` / `skills/test-driven-development` — no runtime-code defect was found this pass, so there is no RED→GREEN code seam; the equivalent GREEN condition for each fix is stated per item (grep re-scan / git-state assertion / full mechanical gate).
**Branch policy:** all work on `main` (operator contract — no new branches). Conventional Commits, atomic slices.

## 1. Findings

| ID | Sev | Finding | Evidence |
|---|---|---|---|
| P5-F1 | **High (git hygiene)** | `db/custom.db` is **tracked at HEAD** — re-added by the operator's "update session log" commits (`de63134`, then updated by `3c38b8b`) after remediation pass 3 had untracked it. This violates the `.gitignore` rule `/db/*.db` ("runtime sqlite database (contains customer PII — never commit)") and the AGENTS.md gotcha ("keep it out"). Mitigating fact, verified by inspecting the committed blob: every record is the synthetic e2e fixture (`Jordan Lee / jordan@example.com`, `e2e/contact.spec.ts:25`) — no real customer PII, so not Critical; but the tracked file re-opens the exact leak channel pass 3 closed. | `git ls-files db/` → `db/custom.db`; `git show HEAD:db/custom.db \| strings` → repeated Jordan-Lee fixture rows; `.gitignore` line `/db/*.db` |
| P5-F2 | Medium (docs drift) | README.md (the public face) still carries the pre-pass-4 unit-test count: "62 unit tests" in the key-features table and "Tests 62 passed (62)" in the verify-setup block. CLAUDE.md, the PAD, and the SKILL are all at 71 — README is the only straggler, so the public contract contradicts the working contracts. | `bun run test` → `Tests 71 passed (71)`; README lines 31 and 131 |
| P5-F3 | Low (docs drift) | SKILL.md §2 tech-stack table says "only 5 of 10 `src/components` files are `"use client"`" — there are **11** component files (SKILL §5.2 itself correctly says "all 11 files"). Internal inconsistency inside one contract doc. | `ls src/components/*.tsx \| wc -l` → 11; 5 of them carry `"use client"` |
| P5-F4 | Low (docs drift) | SKILL.md §2 repo facts: "3,233 lines of TS/TSX/CSS across 33 source files" — the 33-file count is still exact, but the line count is stale: **3,611** non-test lines after the pass-3/4 additions (rate-limit classifier, CSP header work, etc.). | `wc -l` over non-test `src/` TS/TSX/CSS files |
| P5-F5 | Info (operator action) | Cloudflare Email Address Obfuscation is STILL ON (2 `/cdn-cgi/l/email-protection` rewrites in live `/contact` HTML) — the standing dashboard action from pass 4. No code fix exists; `scripts/live-deploy-audit.mjs` fails this check loudly until the toggle is flipped. | `bun scripts/live-deploy-audit.mjs` → 5/6, FAIL email-obfuscation with fix hint |
| P5-F6 | Info | `.gitignore` carries a `/skills/` entry that is inert (skills/ was deliberately force-tracked in `50c357f "add skills"` and is part of the repo by operator design). Cosmetic inconsistency only — left as-is; new files under `skills/` are intentionally invisible to `git status`. | `git ls-files skills/ \| wc -l` → 2,47x files tracked despite the ignore line |

**Non-findings (verified clean, no action):** full local gate at baseline (lint, typecheck, 71/71 unit / 8 files, build 20 routes, 83/83 e2e with zero skips); local CLS harness worst 0.0000 ×3; live e2e 80 passed + 3 skipped (loud, evidence-bearing — P4-F1 semantics hold) with 0 failures, and the contact-only immediate re-run skipped 6 specs green (idempotent inside the 10-min window, exactly as designed); live health, full security-header set, hard-404, robots (CF managed-content preamble + intact app directives), cold-load CLS 0.0000 ×2, absolute sitemap URLs, FCP 612 ms / LCP 300–612 ms; work-grid aspect rhythm byte-identical to source (`[1.6, 0.8]×4`); 0 console/page errors on both sites; VLM pairwise HIGH on all 6 surfaces with every flagged gap DOM-refuted as a misread (marquee present with 26 images; /work CTA + heading sub-text present; Beyond-Work is a 3×389 px column grid; footer Connect column exists on BOTH sites; 7 italic sub-heads + Best-For + Investment present on /services; estimator sub-headline present; Send-inquiry CTA is `rounded-full`; footer socials render as a list). The FAQ remains native `<details>` — documented deliberate divergence (README key features), not a defect.

## 2. Design decisions

### D1 — Untrack the DB at HEAD, keep history intact (P5-F1)
`git rm --cached db/custom.db` (file stays on disk for the local runtime; `.gitignore` already covers it, so it cannot reappear via `git add .`). History rewrite (filter-repo) is **rejected**: the exposed blob contains only synthetic e2e fixtures (verified above), and the operator contract forbids force-pushes/branch games; the marginal benefit does not justify destroying the audit trail. A caution note is added to AGENTS.md so future "update session log"-style commits (`git add -A` after tooling resets) do not silently re-track it — this is the actual regression mechanism that re-opened the channel between passes 3 and 4.

**Regression-test consideration (TDD policy):** a vitest guard was evaluated and rejected — the repo's test conventions pin pure functions and source-reading assertions (no environment coupling), a `git ls-files` shell-out from vitest couples unit tests to VCS state (and passes vacuously in CI's fresh clone), and the failure mode is operator workflow, not code. The enforced guard is instead the pre-ship checklist gate 9 (git gates) plus the AGENTS.md caution — both extended in this pass.

### D2 — README count realignment (P5-F2)
Two surgical edits: key-features table "62 unit tests" → "71 unit tests"; verify-setup block "Tests 62 passed (62)" → "Tests 71 passed (71)". No other claims in README drift (83 e2e count, 20 routes, 19 images, 11 components all verified current).

### D3 — SKILL §2 self-consistency (P5-F3, P5-F4)
"5 of 10" → "5 of 11"; "3,233 lines" → "3,611 lines" (33 source files stays — still exact). These are the same class of surgical drift fix as pass-4's R4-1.

### D4 — Records (this plan, parity record, session log)
`docs/AUDIT_VISUAL_PARITY.md` gains the Pass-5 re-validation record (HIGH verdict + refutation table). At session close, `docs/session_4.md` is written as the clean condensed session record (the session_2.md format); operator-committed raw transcripts (`docs/session_1.md`, `docs/session_3.md`) are left untouched by design.

## 3. ToDo list (execution order)

| # | Task | Files | GREEN condition |
|---|---|---|---|
| 1 | Untrack the DB at HEAD + operator caution | git index; `AGENTS.md` (gotcha extended) | `git ls-files db/` → empty; `git status` shows db/custom.db untracked/ignored; AGENTS.md names the `git add -A` hazard |
| 2 | README test-count realignment | `README.md` ×2 lines | `rg "62" README.md` → no unit-test hits; only claims 71 |
| 3 | SKILL §2 consistency | `design-brand-strategy_SKILL.md` ×2 spots | `rg "5 of 10\|3,233" design-brand-strategy_SKILL.md` → no hits |
| 4 | Parity record | `docs/AUDIT_VISUAL_PARITY.md` | § Pass 5 present with evidence table |
| 5 | Full mechanical gate re-run | — | lint · typecheck · 71/71 unit · build 20 routes · 83/83 e2e local — all green (docs/manifest changes must not disturb the gate) |
| 6 | Session record (at close) | `docs/session_4.md` | Present, session_2.md format |

## 4. Validation against the codebase (pre-execution — all verified)

1. `git ls-files db/` currently returns `db/custom.db` (the RED state for task 1); `.gitignore` already contains `/db/*.db`, so untracking is the only missing half. `git rm --cached` on a tracked-but-ignored file leaves the working tree intact (verified semantics; no `--force` needed since the file is not modified in the index).
2. README line 31 ("62 unit tests") and line 131 ("Tests 62 passed (62)") are the only two unit-count occurrences in the file (`rg -n "62" README.md` → exactly these two, plus the unrelated badge/version strings — re-checked by hand).
3. SKILL §2's "5 of 10" appears once (line 163); §5.2's "all 11 files" (line 436) is the correct anchor. "3,233" appears once (line 198). Non-test src line count re-measured: 3,611 across 33 files.
4. No code file changes in this cycle → the full mechanical gate is expected to be byte-identical to the baseline run (any deviation is a red flag, not noise).
5. AGENTS.md gotcha currently reads "…it was force-committed once and untracked in remediation pass 3; keep it out." — the extension (naming the operator-side `git add -A` re-tracking mechanism, observed twice in `de63134`/`3c38b8b`) is additive and factual.

## 5. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Untracking the DB looks like "losing" the DB to the operator | The file remains on disk untouched; only the git index drops it. Called out in the session record + commit body. |
| History still contains the fixture DB blob | Verified synthetic-only (no real PII); documented here; history rewrite explicitly rejected (audit trail > cosmetic purge, and force-push is contract-forbidden). |
| Doc edits accidentally touch live claims beyond the two stale spots | Surgical single-string edits with unique anchors; post-edit `rg` re-scan proves no stale claims remain and no new ones introduced. |
| Gate regression from manifest-adjacent changes | Task 5 re-runs the full gate; expectation is identical output to baseline (71/71, 83/83, 20 routes). |

## Execution record (2026-09-14)

| Step | Change | Verification (GREEN evidence) |
|---|---|---|
| 1 | `git rm --cached db/custom.db`; AGENTS.md gotcha extended with the operator-side re-tracking mechanism + pre-push check (`git ls-files db/`) | `git ls-files db/` → empty; file intact on disk (28,672 B); `git status` shows the staged deletion only |
| 2 | README: "62 unit tests" → "71 unit tests" (key features); "Tests 62 passed (62)" → "Tests 71 passed (71)" (verify setup) | `rg "62 unit\|Tests 62" README.md` → 0 hits |
| 3 | SKILL §2: "5 of 10" → "5 of 11"; "3,233 lines" → "3,611 lines … (plus 8 co-located test files)" | `rg "5 of 10\|3,233" design-brand-strategy_SKILL.md` → 0 hits |
| 4 | `docs/AUDIT_VISUAL_PARITY.md` § Pass 5 appended (HIGH verdict, full refutation table, artifacts pointer) | Section present (194-line file, tail check) |
| 5 | Full mechanical gate re-run | lint ✓ · typecheck ✓ · 71/71 unit ✓ · build 20 routes ✓ · 83/83 e2e local (zero skips) ✓ — identical to baseline, as required for docs-only changes |
| 6 | Session record | `docs/session_4.md` at session close (see final phase) |

**Deferred with rationale:** none this pass — every planned item executed. P5-F5 (email-obfuscation toggle) and P5-F6 (inert `/skills/` ignore line) remain operator-side/informational by design.

# Pass 5 — Second Remediation Cycle: Dead-Tooling Removal + Docs (2026-09-14)

**Inputs:** Pass-5 tiered audit (`docs/AUDIT_CODE_REVIEW.md` § Pass 5) — verdict safe-to-ship with one Medium maintainability finding (AUD5-F1) and two informational notes (AUD5-F2/F3).
**Method:** planned per `skills/planning-and-task-breakdown`; TDD policy applies to code changes — this cycle contains **no runtime-code change** (file deletions of unreferenced scripts + documentation), so there is no RED→GREEN seam; each task states its GREEN condition explicitly (git state / grep re-scan / full mechanical gate), mirroring the pass-4 second-cycle protocol.
**Branch policy:** all on `main`, atomic commits.

## 1. Findings (from the audit)

| ID | Sev | Finding |
|---|---|---|
| AUD5-F1 | Medium (maintainability) | Seven dead reference-project scripts in `scripts/` (evidence table in the audit report): `skill-verify.sh` (targets nonexistent `car-care_SKILL.md`, checks car-care deps, **hangs** on `npm test` in this bun repo), `vlm-parity-audit.mjs` (hardcoded `wecarecarcare.com`), `vlm-audit-pass2.mjs` (car-care audit dir + dark-theme-redesign narrative), `vlm-check.mjs` (hardcoded sandbox path to a car-care screenshot), `hero-variants.mjs` (references nonexistent `hero-car.webp`), `gen-images.sh` ("We Care Car Care site imagery"), `optimize-images.mjs` (hardcoded sandbox path; requires `sharp`, not a dependency — unrunnable from a fresh clone). None referenced by `package.json`, CI, or docs. |
| AUD5-F2 | Info | The three retained generic scripts (`vlm-audit.mjs`, `capture-sections.sh`, `contrast-check.mjs`) are undocumented in the PAD; they depend on external sandbox tooling (z-ai-web-dev-sdk / agent-browser CLI), not repo dependencies. |
| AUD5-F3 | Info | Non-ASCII email local parts rejected by zod `.email()` — standard validator behavior; accepted limitation. |
| (carried) | Info | CF email-obfuscation toggle + `contact_inquiry` delivery-hook wiring — standing operator actions. |

## 2. Design decisions

### D1 — Delete the seven dead scripts (AUD5-F1)
`git rm` the seven files in one atomic commit. Rationale: they are provably for a different project (headers, targets, and dependencies all reference car-care artifacts that do not exist here), one of them **hangs** when executed (`skill-verify.sh` → `npm test`), and they ship misleading content in a public repo. The git history preserves them if ever needed; the initial-build WebP pipeline (`optimize-images.mjs`) completed its job (19 committed WebP assets). The repo's own standards demand this ("no temporary or intermediate files in final output locations"; dead-code hygiene in SKILL §13/§16 and CLAUDE.md).

**Regression-test consideration (TDD policy):** a unit test asserting the absence of specific files couples vitest to the filesystem and adds no protection beyond the deletion itself plus CI (the files cannot re-enter without a deliberate `git add`). The enforced guard is the audit itself plus this record — same reasoning as pass-4's R4-3 deferral.

### D2 — Document the retained scripts (AUD5-F2)
Add the three keepers to the PAD §11 Key Files Reference area with one line each, naming their external-tool requirements, so the tooling inventory matches reality (the audit's Tier-0 standard).

### D3 — Docs round 2
SKILL.md: version bump to v2.4.0 + change-log line + Appendix B row for pass 5 (audit + both remediation cycles). AGENTS.md/CLAUDE.md/README.md: no changes required (no behavior/tooling contract they document is altered — the deleted scripts were never documented). Session record `docs/session_4.md` written at session close (session_2.md format).

## 3. ToDo list (execution order)

| # | Task | Files | GREEN condition |
|---|---|---|---|
| 1 | Delete the seven dead scripts | `scripts/{skill-verify.sh, vlm-parity-audit.mjs, vlm-audit-pass2.mjs, vlm-check.mjs, hero-variants.mjs, gen-images.sh, optimize-images.mjs}` | `git status` shows exactly 7 deletions; `ls scripts/` = 7 remaining files (4 documented + 3 keepers); no reference breaks |
| 2 | PAD tooling inventory addition | `Project_Architecture_Document.md` | The three keepers appear with external-tool notes |
| 3 | SKILL v2.4.0 (change log + Appendix B row) | `design-brand-strategy_SKILL.md` | Version header + history line + Appendix B pass-5 row present |
| 4 | Full mechanical gate re-run | — | lint · typecheck · 71/71 unit · build 20 routes · 83/83 e2e — identical to baseline |
| 5 | Session record | `docs/session_4.md` | Present, session_2.md format |

## 4. Validation against the codebase (pre-execution — all verified)

1. Reference scan for the seven filenames across `package.json`, `.github/workflows/verify-gate.yml`, `README.md`, `CLAUDE.md`, `AGENTS.md`, SKILL, PAD, and `docs/`: **zero references** (the only mentions are the audit-history records in `docs/AUDIT_CODE_REVIEW.md` § Pass 4/5 — archival prose, not tooling references).
2. `tsc --noEmit` does not type-check `.mjs`/`.sh` (tsconfig includes `**/*.ts`/`**/*.tsx` only; `scripts/db.ts` stays); the current lint passes *with* the files present, so deletion cannot introduce a lint failure.
3. The PAD §11 Key Files table is the established inventory home (it already lists `scripts/` tools via §7.1's tooling table and ADR mentions); adding three keeper lines is additive.
4. SKILL version history lives in the footer (v1.0.0 → v2.3.0 chain) and Appendix B is the audit ledger — both expect a new row per pass.
5. No `.env`, lockfile, or dependency changes — the mechanical gate is expected to be byte-identical to the post-round-1 run.

## 5. Risks & mitigations

| Risk | Mitigation |
|---|---|
| A deleted script was secretly used by the operator's local workflow | The seven are car-care-specific by their own contents (targets/deps/paths that do not exist in this repo) — they cannot have been part of a working DBS workflow; history preserves them regardless. |
| Losing the WebP pipeline | Its output (19 WebP files) is committed; the script itself cannot run here (no `sharp` dep). If imagery is ever regenerated, the script is one `git show` away. |
| Doc edits drift | Surgical single-anchor edits + post-edit re-scans; full gate re-run proves no code impact. |

## Execution record (second cycle, 2026-09-14)

| Step | Change | Verification (GREEN evidence) |
|---|---|---|
| 1 | `git rm` × 7 dead scripts (`skill-verify.sh`, `vlm-parity-audit.mjs`, `vlm-audit-pass2.mjs`, `vlm-check.mjs`, `hero-variants.mjs`, `gen-images.sh`, `optimize-images.mjs`) | `ls scripts/` → exactly 7 remaining (4 documented + 3 keepers); reference scan still zero; git status shows exactly the 7 staged deletions |
| 2 | PAD §11 gains the scripts-inventory paragraph (4 operational tools + 3 sandbox-session keepers with external-tool requirements + removal note) | Paragraph present; every named file exists |
| 3 | SKILL v2.4.0: header/project_state/Appendix B rows ×2 (pass-5 validation + pass-5 audit)/footer history | Version line 2.4.0; rows present; history chain extended |
| 4 | Full mechanical gate re-run | lint ✓ · typecheck ✓ · 71/71 unit ✓ · build 20/20 routes ✓ · 83/83 e2e ✓ — byte-identical to the post-round-1 baseline, as required for deletion/docs-only changes |
| 5 | Session record | `docs/session_4.md` (session_2.md format) at session close |

**Deferred with rationale:** AUD5-F3 (non-ASCII email local parts) — standard zod `.email()` behavior, accepted; operator items (email-obfuscation toggle, delivery hook) — outside code scope by definition.
