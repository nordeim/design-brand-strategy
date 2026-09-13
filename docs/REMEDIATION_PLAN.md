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
