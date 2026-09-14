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
