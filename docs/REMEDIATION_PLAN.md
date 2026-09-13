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
- [ ] H1. Commit sequence on `main` (5 commits: tests+data / imagery+components / verification fixes / docs / final gates) with imperative messages.
- [ ] H2. SSH wrapper push to `git@github.com:nordeim/design-brand-strategy.git` (main only, no new branches).
- [ ] H3. Post-push verification: remote HEAD hash match; clean tree.

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
