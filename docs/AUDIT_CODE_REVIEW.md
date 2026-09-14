# Code Review & Audit Report — design-brand-strategy

**Date:** 2026-09-13
**Baseline reviewed:** `main @ f014842` (site commit `421d23a` + docs commit `f014842`)
**Rubrics applied:** `code-quality-standards` Six-Axis review (Correctness, Readability, Architecture, Security, Performance, Aesthetic/UX Rigor), `code-review-checklist` 12-category scan, `nextjs16-tailwind4` / `frontend-development` conventions, `test-driven-development` (for remediation), `aesthetic` principles (BEAUTIFUL/RIGHT).
**Evidence:** full source read (33 files), mechanical greps (layers, suppressions, exports), live prod probes (Core Web Vitals, API contract, estimator math, form flow), `bun run lint` / `typecheck` / `test` / `build` all green at review time.

---

## Executive summary

The codebase is **structurally sound and conventionally clean**: strict TypeScript with zero suppressions, a verified four-layer architecture, content-as-code data layer, shared zod validation, measured WCAG contrast, and near-perfect Core Web Vitals (TTFB 2.5 ms, FCP 136 ms, CLS 0.0, LCP 652 ms). No Critical or blocking defects were found on the security or correctness axes.

The material findings are (a) one robustness defect with accessibility impact (no-JS users get invisible content below the fold), (b) a set of **aesthetic-parity regressions against the source site** — most importantly the closing-CTA band treatment and the homogenized image-grid rhythm — which also violate the Anti-Generic mandate's spirit (uniform tile grids where the source has an intentional editorial mixed-aspect rhythm), and (c) a handful of medium consistency/a11y gaps (select error wiring, hardcoded email strings, missing skip link).

**Verdict: Request changes** (18 findings: 0 Critical, 7 High-value, 8 Medium, 3 Low/Info). All findings are actionable in one remediation pass.

---

## Axis 1 — Correctness

**Verified:** vitest 18/18; `tsc --noEmit` clean; eslint clean; `next build` 20 routes; estimator math live-probed to exact expected values ($33k–$55k default; Art Direction × Enterprise × Rush × Full System = $44k–$88k); API contract 202/400/429 all behave; mobile menu opens, navigates, unmounts, releases scroll lock.

| ID | Sev | Finding | Evidence |
|---|---|---|---|
| C-1 | **High** | **No-JS / no-hydration fallback for `Reveal`.** With JavaScript disabled (or before hydration on very slow connections, for non-supporting crawlers), every `[data-reveal]` element below the fold stays `opacity-0` — the page renders as hero-only. Reduced-motion users are covered by CSS; scripting-disabled users are not. | `reveal.tsx` initial class `opacity-0`; only `prefers-reduced-motion` forces visibility in `globals.css`. Confirmed by the initial-build screenshot artifact (lesson L3) and by HTML inspection. |
| C-2 | Medium | Hardcoded fallback email strings (`studio@elenavance.com` ×2) in client error copy instead of `SITE.email`. Functional today; silent drift if the address changes. | `contact-form.tsx` lines ~91, ~96; `src/data/site.ts` owns `email`. |
| C-3 | Low | `sitemap.ts` stamps `lastModified: new Date()` on every build — all URLs perpetually "modified today", which weakens lastmod signaling. | `src/app/sitemap.ts`. |
| C-4 | Info | `getNextProject()` guards a `throw` that is unreachable in practice (page calls `notFound()` first). Harmless defensive code. | `projects.ts` lines 327–332. |
| C-5 | Info | Marquee duplicate half renders visible `figcaption` labels — intended for a seamless loop; aria-hidden handles AT duplication. | `marquee.tsx`. |

## Axis 2 — Readability & Simplicity

**Verified:** no `any`, no `@ts-ignore`/`eslint-disable`, no dead code, no default component exports, descriptive names throughout, files ≤ 370 lines, intent comments where non-obvious.

| ID | Sev | Finding |
|---|---|---|
| R-1 | Medium | `estimator.tsx` renders four near-identical option-button blocks (~90 lines of duplicated JSX differing only in data source and the price column). A single option-renderer over a normalized `(key, options, renderExtra)` table removes ~70 lines and one whole class of future copy-paste drift. (Known issue K-4.) |
| R-2 | Nit | `PROJECT_TYPE_LABELS` / `BUDGET_LABELS` maps live inside `contact-form.tsx` while their enums live in `src/lib/contact.ts`; labels-for-enums are data and drift silently if an enum value is added without a label (TS would catch via `Record<..., string>` — it does — but the single-source belongs beside the schema or in the data layer). |

## Axis 3 — Architecture

**Verified:** four-layer rule intact (`app → components → lib → data`; greps for upward imports return empty), content-as-code with typed data, client islands limited to 5 of 10 components, API route imports only lib.

| ID | Sev | Finding |
|---|---|---|
| A-1 | Low | No `src/lib/env.ts` boundary — `process.env.NEXT_PUBLIC_SITE_URL` is read directly in `src/data/site.ts`. Acceptable for exactly one public variable (documented trade), but any second env var should trigger extraction of a typed env module. |
| A-2 | Info | `char-block` is a `lib` with zero non-component consumers — fine as a pure function; would move only if a second consumer appears. |

## Axis 4 — Security

**Verified:** authoritative zod validation at the API; honeypot; in-memory sliding-window rate limit (5 req / 10 min, `Retry-After` on 429); full security-header set from `next.config.ts` (CSP, HSTS preload, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy); no secrets in repo; PII-safe logging (lengths/enums, not message bodies); `robots.ts` disallows `/api/`.

| ID | Sev | Finding |
|---|---|---|
| S-1 | Low | CSP `script-src 'unsafe-inline'` — required by the RSC payload + inline theme script today; a nonce/hash strategy would tighten it at framework-config cost. Known, documented trade (PAD §6). |
| S-2 | Low | `clientKey()` trusts `x-forwarded-for` — spoofable, but only used for best-effort rate-limit keying (no identity decisions). Multi-instance deployments reset the in-memory limiter (K-7). |
| S-3 | Low | No dependency-vulnerability scan wired into the workflow (bun has no `audit` subcommand in this toolchain). Deps are current; wire `npm audit`/Renovate when CI exists. |

## Axis 5 — Performance

**Measured (prod, :3001):** TTFB 2.5 ms · FCP 136 ms · LCP 652 ms (element: hero portrait, `priority` set) · CLS 0.0 · INP not measurable (no long tasks). Static prerendering for 11 of 14 page routes.

| ID | Sev | Finding |
|---|---|---|
| P-1 | Medium | ~2.2 MB of PNG imagery, no WebP/AVIF variants (ADR-006 trade — `images.unoptimized: true`). Largest single asset 225 KB. A format pass (WebP q≈85) would cut page weight roughly 60 % with no optimizer dependency. |
| P-2 | Low | Marquee tiles display at 256×144 but reference full 1344×768 sources; browser decodes full-res for a 256 px tile (covers are shared with the grid, so incremental cost is limited to the 5 detail images). Resized variants would shave decode work. |
| P-3 | Low | **Source image aspect ratios don't match their render boxes**: all covers are 1344×768 (1.75) rendered in `aspect-[3/2]` (1.5) — a ~14 % width crop; `portrait-main.png` is 768×1344 (0.57) rendered in `aspect-[4/5]` (0.8) — a heavy vertical crop of the composition. Not a layout bug (object-cover + CLS 0) but an unintentional content crop. |

## Axis 6 — Aesthetic & UX Rigor (Anti-Generic Litmus)

**Verified strengths:** bespoke editorial identity — Instrument Serif display + Inter functional layer is an intentional, justified pairing (not "Inter safety"); cream/ink token system with inversion-as-emphasis; hairline rules instead of shadows; square corners as system; uppercase tracked wayfinding labels; purposeful micro-interactions only; zero Rejection-Matrix patterns (no gradients, no bento, no glassmorphism, no purple, no hero video); measured contrast 16.69:1 / 4.55:1 / 7.30:1.

**Findings (cross-referenced with `AUDIT_VISUAL_PARITY.md`):**

| ID | Sev | Finding |
|---|---|---|
| AX-1 (V-1) | **High** | Closing CTA band diverges from the source's treatment: source uses a light warm band (rgb(239,238,235)) with ink headline + ink pill; clone inverts to an ink band. Both are "intentional," but parity is the project brief — the light band is the source's signature close. |
| AX-2 (V-2) | **High** | Homogenized image rhythm: every project cover is uniform 3:2 landscape in a 2×2 grid (home) and a uniform column (/work). The source alternates 1.60-landscape ↔ 0.80-portrait covers — an editorial mixed-aspect rhythm. Uniform tiling is exactly the homogenization the Anti-Generic axis rejects. |
| AX-3 (V-3) | Medium | Marquee: uniform 256×144 landscape tiles vs the source's mixed-aspect, mixed-width gallery (0.75 / 1.25 / 0.80). |
| AX-4 (V-4) | Medium | Case-study detail imagery: uniform 3:2 vs source's mixed aspects including wide 2.33 banners. |
| AX-5 (V-5/K-6) | Medium | No skip-to-content link (source has one). Also an a11y gap — first Tab jumps into the header nav. |
| AX-6 (V-6) | Medium | `/services` lacks the source's "How we work together" (process), "Common questions" (FAQ), and "Ready to start?" (CTA) sections — the page ends after service 06, weakening both parity and conversion architecture. |
| AX-7 (V-7/V-8) | Info | Hero availability pill + home collage strip are original embellishments absent from the source; consistent with the design language and kept by decision (documented). Dark mode (V-9) is an accepted enhancement. |

## Accessibility sub-scan (folded into Axes 1/6)

| ID | Sev | Finding |
|---|---|---|
| AA-1 (K-3) | Medium | `projectType`/`budget` `<select>`s: error `<p>`s lack `id` + the selects lack `aria-describedby`/`aria-invalid` — inconsistent with the name/email/message wiring; screen readers won't announce select errors. |
| AA-2 (K-1) | Medium | Same as C-1: no-JS content invisibility is also a graceful-degradation failure. |
| AA-3 (K-8) | Low | All static pages share one OG image (`workspace.png`); case studies have per-page OG. Social share previews for /, /work, /about, /services, /contact are generic. |
| AA-4 | Low | Mobile menu opens without moving focus into it and doesn't restore focus on close; acceptable but below best practice. |
| AA-5 | Nit | `aria-live="polite"` on the estimator total is good; the step-question change is not announced — fine at this scope. |

## Consolidated findings index (feeds the remediation plan)

| Priority | Finding IDs | Theme |
|---|---|---|
| **P0** | C-1/AA-2 (K-1), AX-1 (V-1), AX-2 (V-2) | no-JS robustness · CTA band parity · mixed-aspect grid |
| **P1** | C-2 (K-2), AA-1 (K-3), AX-5 (V-5/K-6), AX-3 (V-3), AX-4 (V-4), AX-6 (V-6) | email single-source · select a11y · skip link · marquee rhythm · case detail rhythm · services sections |
| **P2** | R-1 (K-4), AA-3 (K-8), P-1/P-2/P-3, C-3, AA-4, R-2, S-3 | estimator DRY · per-page OG · image weight/crops · sitemap lastmod · focus management · labels colocated · dep audit |

**Test coverage note (TDD readiness):** pure logic is well covered (estimator 9, contact 9). The remediation introduces new logic surfaces — mixed-aspect data fields, marquee aspect invariants, services FAQ/process data, OG-image mapping — each of which gets a failing test first (RED) before implementation (GREEN), per `test-driven-development`. Visual outcomes are verified with the agent-browser probe scripts (scroll discipline applied).

---

# Pass 2 — Delta Review (2026-09-13, second session)

**Scope:** the Playwright e2e additions (`playwright.config.ts`, 7 spec files, package.json/gitignore/env changes) and the pass-2 remediation changes (estimator rebuild, layout geometry, card grammar, referral select, process expansion). Method: code-quality-standards Six-Axis on each change, tests reviewed first.

## E2E additions — verdict: **Approve** (nits recorded)

| Axis | Assessment |
|---|---|
| Correctness | 81/81 specs green against the production build; API specs use per-test spoofed `x-forwarded-for` so shared rate-limit state never cross-contaminates; the burst test pins `[202,202,202,202,202,429]` exactly. No-JS specs correctly work around the Playwright limitation (locator engine cannot inject scripts when `javaScriptEnabled: false`) via `page.evaluate` — documented in the spec header. |
| Readability | Spec headers record provenance (adapted-from reference) and adaptation rationale; every non-obvious assertion carries a why-comment (route announcer scoping, honeypot bounding-box, sr-only 1px box). |
| Architecture | Data-driven specs import `src/data/*` — no duplicated slug/title/image inventories; config mirrors the proven reference structure; serial workers justified by shared server state. |
| Security | The security-header contract (CSP/XFO/HSTS/nosniff/Referrer/Permissions) is now machine-enforced — a security regression gate that did not exist before. No secrets in test code. |
| Performance | ~38s for 81 specs on one serial worker; acceptable. *(Consider: parallelizing the page-only specs later if the suite grows.)* |
| Aesthetic/UX rigor | The suite *enforces* the rigor axis: axe critical gates, skip-link keyboard reveal, focus-ring visibility, reduced-motion contract, aria states on the estimator/form. |

Nits (non-blocking): `.first()` used for the availability-pill assertion (would mask duplicates — acceptable given the pill is unique in the hero); the mobile spec duplicates the hero-aspect assertion that also exists in parity (cheap, keeps the mobile file self-contained).

## Pass-2 remediation changes — verdict: **Approve**

- **Correctness:** every change maps to a measured source fact (see AUDIT_VISUAL_PARITY § P2.3/P2.6); estimator math untouched (44/44 unit tests unchanged except the deliberate 5-step data-contract update); `estimateRange` fail-fast contract preserved by gating before the call.
- **Readability:** estimator's `GROUPS`/`OPTION_SETS` keep one render path; component comments explain the parity rationale with the source measurements.
- **Architecture:** content-as-code respected (new step, labels, referral options all live in the data/lib layers with colocated labels — R-2 rule held); no new client components (still exactly 5); no new dependencies beyond the test layer.
- **Security:** referral select emits fixed values — the zod schema (`string ≤200 optional`) still validates at the boundary; honeypot untouched and now machine-verified.
- **Performance:** no added client JS beyond the estimator's state (slightly less than the wizard: no step machine); portrait 4:5 renders crop ~6% of 3:4 sources — negligible decode cost, identical to the source's own crop strategy.
- **Aesthetic/UX rigor:** the redesign *removes* a divergence (boxed estimator) the VLM flagged and preserves the source's editorial grammar (numbered groups, uppercase practice lines, minimal cards). The Anti-Generic litmus passes: every visual decision traces to a measured source pattern, not a template default.

**Deferred (documented):** WebKit e2e project; awards-row arrangement; CI pipeline for the suite.

---

# Pass 3 — Tiered Code Review + Security Audit (2026-09-14, third session)

**Scope:** post-remediation-pass-3 codebase (ADR-011 Prisma SQLite + ADR-012 document-order stream + CSP beacon origin + lockfile dedupe). **Method:** per `skills/code-quality-standards` (Six-Axis review) + `skills/security-and-hardening` (boundary/injection/header discipline) + `skills/code-review-checklist`; four tiers — Tier 0 documented-contract verification, Tier 1 mechanical gates + structural invariants, Tier 2 Six-Axis source review (every file under `src/`, `e2e/`, `scripts/`, configs), Tier 3 security audit with live runtime probes. **Question asked:** *does the codebase match its documented contracts (AGENTS/CLAUDE/README/SKILL/PAD) and is it safe to ship?*

## Tier 0 — Documented contracts: **MATCH** (post-pass-3 realignment)

Every contract claim re-verified against code: 52/52 unit (7 files incl. `db-url` resolver), 83/83 e2e, typecheck covers `e2e/` + `scripts/` (tsconfig excludes only `node_modules`+`skills`), playwright 1.63.0 single-copy playwright-core, CSP transcription in AGENTS/SKILL matches `next.config.ts` byte-for-byte, "no root loading.tsx" (ADR-012) matches the tree, `dynamicParams = false` present with the documented rationale, Prisma fail-open write matches ADR-011, all five docs cross-consistent on counts/versions/commands.

## Tier 1 — Mechanical gates: **ALL GREEN**

lint ✅ · typecheck (incl. e2e+scripts) ✅ · 52/52 ✅ · build 20 routes ✅ · 83/83 e2e ✅ · CLS harness 0.0000 ✅ · structural invariants: upward imports 0, radius violations 0, shadows 0 (one prose hit in an alt text — false positive), raw colors in tsx 0, `use client` = 5 files, images = 19 WebP, png refs 0, TS/lint suppressions 0, secrets scan clean, key-material scan clean (only doc/validation marker strings).

## Tier 2 — Six-Axis source review: **Approve** (nits below)

| Axis | Verdict | Evidence |
|---|---|---|
| Correctness | Approve | All 19 source files read. API contract machine-pinned (202/400/429/405); estimator fail-fast guarded by `complete` before the call; rate limiter bounded with sweep-at-cap; resolver contract-tested (8 tests); no suppressions anywhere. Nit: estimator narrows via `as` casts after the `complete` guard — safe but type-predicate narrowing would be tidier. |
| Readability | Approve | Comments explain *why* (parity measurements, ADR pointers); data-driven renderers (OPTION_SETS); naming consistent with the domain vocabulary of the docs. |
| Architecture | Approve | Four-layer rule intact (grep-verified both directions); exactly 5 client components; one sanctioned lib→data import set; new `scripts/` + `docs/` artifacts sit outside the dependency graph. |
| Security | See Tier 3 | One Medium (AUD-1 rate-limit key spoofability), one Low (AUD-2 doc/code PII wording drift); the rest pass. |
| Performance | Approve | CLS contract now pinned (ADR-012); images aspect-reserved; marquee pure-CSS; no N+1 (single-row Prisma create); limiter O(1). |
| Aesthetic/UX rigor | Approve | Token contract intact (greps); Anti-Generic litmus passes — every visual decision traces to a measured source pattern or an ADR; no template clichés introduced by pass 3. |

## Tier 3 — Security audit (severity-ranked, with evidence)

| ID | Severity | Finding | Evidence | Disposition |
|---|---|---|---|---|
| AUD-1 | **Medium** | Rate-limit client key is spoofable behind Cloudflare: `clientKey()` reads the **first** `x-forwarded-for` entry. A client can send forged first-hop values and obtain unlimited 5-per-10-min buckets, defeating the limiter (honeypot AUD-4 then also weakens). `cf-connecting-ip` — which Cloudflare overwrites and clients cannot forge — is ignored. | Code (`rate-limit.ts:35-38`) + probe P4: seven requests with seven forged first-hop IPs → 7×202; probe P5: same-IP 6th request → 429 (limiter itself works). Live deploy is CF-fronted. | **Fix now (R2-1, TDD)** — prefer `cf-connecting-ip`, then the **last** XFF entry (the proxy-appended hop), then `x-real-ip`, then `local`. Single-hop spoofed XFF (the e2e isolation pattern) remains the last entry → all 83 specs stay valid. |
| AUD-2 | Low | Doc/code drift on the PII logging posture: SKILL §13 says the API logs "lengths and enums, not free text", but the `contact_inquiry` log line includes `name` + `email` (deliberately — it is the documented delivery hook; ADR-011 also persists the same PII to SQLite). The posture claim is inaccurate and PII now exists in two sinks. | `api/contact/route.ts:68-83`; SKILL §13 Security bullet | **Fix docs now (R2-2)** — state the true posture: message body never logged (`messageLength`), name/email logged as delivery-hook data; add log-retention guidance. |
| AUD-3 | Low | `deepmerge-ts@7.1.5` carries a HIGH advisory (GHSA-ggr8-5vv4-36mx, stack exhaustion on recursive merges). Transitive only: `prisma` (devDep CLI) → `@prisma/config` → **exact-pinned** `deepmerge-ts@7.1.5`; runtime `@prisma/client` has **zero dependencies**; no attacker-controlled config merging in our usage. | `bun audit`; dependency-chain inspection | **Accept + document (R2-3)** — an override would force Prisma's exact internal pin (riskier than the advisory); monitor for the Prisma bump. |
| AUD-4 | Info | Honeypot is client-side only: a direct POST with `website` filled and otherwise-valid fields still persists (zod strips unknown keys). Documented design; the limiter is the bound — see AUD-1. | `contact-form.tsx:33-38`; schema has no `website` field | Documented accepted; AUD-1's fix restores the intended bound. |
| AUD-5 | Info | `.env` + `db/custom.db` remain in git **history** (untracked in the working tree by pass 3). Contents verified: env template with public URLs (no secrets) and 27 synthetic test rows (no real PII). History rewrite rejected — operator no-force-push contract. | `git log --all -- .env db/custom.db` → `50c357f` | Accepted residual, recorded. |
| AUD-6 | Info | Route handlers parse the JSON body before zod rejects oversized strings (2.5MB probe → clean 400, no crash). No built-in body cap; realistic abuse is bounded by the (AUD-1-fixed) limiter. | Probe P2 | Accepted; revisit only if the endpoint grows. |
| AUD-7 | Pass | Security headers exact on local build and live (CSP incl. the CF analytics origin — deliberate, documented; HSTS preload; XFO DENY; nosniff; Referrer/Permissions-Policy); robots disallows `/api/`. | smoke.spec contract; live curl | — |
| AUD-8 | Pass | No secrets or key material in tree; `dangerouslySetInnerHTML` only for the fixed theme script; React auto-escaping on all user-adjacent text; Prisma parameterizes by construction; CI workflow `permissions: contents: read` + frozen lockfile. | Tier 1 scans; `.github/workflows/verify-gate.yml` | — |
| AUD-9 | Pass | `/api/contact` method discipline (PUT/GET → 405); malformed JSON → 400; zod caps every string; 429 + `Retry-After: 600` on the 6th same-key request; SQLite file lives outside `public/` (not web-servable). | Probes P1–P5; tree inspection | — |

## Verdict

**Safe to ship** after R2-1 (rate-limit key fix, TDD) and R2-2 (PII posture doc fix): zero Critical/High *runtime* vulnerabilities; one Medium hardening gap behind the edge (AUD-1) with a tested fix path; contracts Tier 0–2 fully aligned post-pass-3. The remediation backlog below feeds the pass-3 second remediation cycle.

## Remediation backlog (second cycle of pass 3)

1. **R2-1 (AUD-1, TDD):** `clientKey()` — `cf-connecting-ip` → last XFF entry → `x-real-ip` → `local`. RED: unit tests for each header combination (incl. "spoofed, real" chain → must key on `real`). GREEN: implement; full gate + confirm 83/83 e2e (single-hop spoof pattern unaffected).
2. **R2-2 (AUD-2):** correct the PII-posture wording in SKILL §13 + route comment; add retention guidance ("treat logs containing `contact_inquiry` as PII-bearing; drain to a bounded-retention sink").
3. **R2-3 (AUD-3):** record the accepted-risk analysis in the audit (done, above) + a `bun audit` step note in SKILL §11 as a periodic (not per-ship) check.
4. **R2-4 (AUD-4/5/6):** documented-accepted, no code change.

---

# Pass 4 — Tiered Code Review + Security Audit (2026-09-14, fourth session)

**Scope:** post-remediation-pass-4 codebase (environment-aware contact e2e specs + `classifyBurstStatuses` + `scripts/live-deploy-audit.mjs` + docs realignment). **Method:** per `skills/code-quality-standards` (Six-Axis review) + `skills/security-and-hardening` (boundary/injection/header discipline) + `skills/code-review-checklist` (12-category scan); four tiers — Tier 0 documented-contract verification (AGENTS/CLAUDE/README/SKILL/PAD), Tier 1 mechanical gates + structural invariants + dependency/secret scans, Tier 2 Six-Axis source review (all files under `src/`, `e2e/`, `scripts/`, configs — `skills/` excluded by operator contract), Tier 3 security audit with runtime probes against the local production server. **Question asked:** *does the codebase match its documented contracts and is it safe to ship?*

## Tier 0 — Documented contracts: **MATCH with 3 drift findings (all in `Project_Architecture_Document.md`)**

The four core contracts (AGENTS.md, CLAUDE.md, README.md, SKILL.md v2.3.0) re-verified claim-by-claim: 71/71 unit (8 files), 83/83 e2e full-strength locally with loud skips on edge-fronted origins, typecheck covers e2e+scripts, CSP transcription byte-accurate, no root loading.tsx, `dynamicParams=false`, Prisma fail-open, env table accurate, counts/versions cross-consistent. **The PAD was not touched by the pass-4 docs round:**

| ID | Finding | Evidence | Disposition |
|---|---|---|---|
| T0-1 | PAD still claims "currently 62 tests across 8 files" (line ~493) — now 71 | `rg "62 tests" Project_Architecture_Document.md` | **Fix docs (R4-1)** |
| T0-2 | PAD ADR-009 rationale says "tests spoof unique `x-forwarded-for` values" without the edge-fronted qualification added everywhere else | PAD line ~135 | **Fix docs (R4-1)** |
| T0-3 | PAD tooling sections predate `scripts/live-deploy-audit.mjs` and `classifyBurstStatuses` | PAD §testing/tooling | **Fix docs (R4-1)** |

## Tier 1 — Mechanical gates: **ALL GREEN**

lint ✅ · typecheck (e2e+scripts) ✅ · 71/71 unit ✅ · build 20 routes ✅ · 83/83 e2e local ✅ · live run: 74 passed + 4 skipped, re-run green ✅ · structural invariants re-verified: upward imports 0, TS/eslint suppressions 0, `any` 0, `use client` = 6 files (5 components + `error.tsx` boundary — documented), raw colors in components 0 (icon.svg asset excluded, known), secrets/key-material scan clean (only `scripts/skill-verify.sh` validation-marker strings — re-checked), `bun audit` = exactly the one known accepted item (AUD-3: `deepmerge-ts@7.1.5` HIGH advisory, transitive CLI-only via `prisma`→`@prisma/config` exact pin; runtime `@prisma/client` zero-dep; unchanged since pass 3).

## Tier 2 — Six-Axis source review: **Approve**

All source, spec, script, and config files read (fresh full pass). New pass-4 code specifically:

| Axis | Verdict | Evidence |
|---|---|---|
| Correctness | Approve | `classifyBurstStatuses` unit-pinned (9 tests incl. boundary, all-429, broken-shape, too-short); spec behavior verified on BOTH origin types (local: full-strength assertions, zero skips; live: loud skips with evidence; immediate re-run inside the 10-min window: green via skips — idempotency is a new property the suite did not have); `live-deploy-audit.mjs` verified against local (6/6) and live (5/6 with the documented deploy-state failure) |
| Readability | Approve | Every skip carries its evidence in the reason string; why-comments explain the AUD-1 interaction; the classifier's doc-comment states the three verdicts and their meanings |
| Architecture | Approve | Classifier colocated with `clientKey` in `src/lib/rate-limit.ts` (keying semantics is one concern); e2e imports `../src/lib/rate-limit` following the established `../src/data/*` spec-import pattern; deploy-state tooling lives in `scripts/`, not the spec suite (code-contract vs deploy-state separation) |
| Security | Approve | The skip logic cannot mask regressions on self-managed origins (verdict "broken" fails loudly; local run keeps exact assertions); no new trust boundaries, inputs, or dependencies introduced |
| Performance | Approve | Zero additional HTTP requests introduced by the spec changes (the burst spec reuses its existing 7 requests; skip decisions are in situ); audit script cost is operator-invoked only |
| Aesthetic/UX rigor | N/A (test/tooling layer) | — |

Non-blocking nit: `live-deploy-audit.mjs`'s CLS check would report 0.0000 for a fully dead page load (`goto` catch + timeout) — mitigated in practice because checks 1–5 already fail loudly when the origin is down; acceptable for a best-effort deploy-state tool.

## Tier 3 — Security audit (runtime probes, local production server :3197)

| ID | Severity | Finding | Evidence | Disposition |
|---|---|---|---|---|
| AUD-10 | Pass | **AUD-1 fix re-verified behaviorally**: with `cf-connecting-ip: 198.51.100.77` fixed and seven distinct forged first-hop XFF values, responses were `202×5, 429, 429` — the shared cf key rate-limits on the 6th; a fresh cf IP (`203.0.113.99`) gets 202 (isolated) | Probes P4/P5 |
| AUD-11 | Pass | Method discipline: GET/PUT/DELETE on `/api/contact` → 405; malformed JSON → 400 JSON; **2.5MB oversized body → clean 400, server alive afterward** (health 200) | Probes P1/P2 |
| AUD-12 | Pass | No input reflection anywhere in API responses (static messages only); stored inquiries have **no HTML rendering path** (no admin/read surface — Prisma Studio only) → no stored-XSS surface today; React auto-escaping guards any future render path | Probe P9 + tree inspection |
| AUD-13 | Pass | `db/custom.db` and `.env` are not web-servable (404); SQLite file lives outside `public/` | Probe P7 |
| AUD-14 | Info | Control-char XFF header → graceful 400, server stays healthy (no parser crash) | Probe P6 |
| AUD-15 | Info | Honeypot remains client-side only (direct POST with `website` filled persists — zod strips unknown keys): documented accepted design (pass-3 AUD-4); the limiter is the bound and AUD-10 confirms it holds | Probe P8 |
| AUD-16 | Info | The one open deploy-state item is operator-side, not code: Cloudflare **Email Address Obfuscation is still ON** (2 rewrites in live `/contact` HTML) — now machine-checked by `scripts/live-deploy-audit.mjs` with its dashboard remediation hint | Live audit run |

## Verdict

**Safe to ship.** Zero Critical/High runtime vulnerabilities; all six quality gates green on both origin types; the Tier-2 review approves the pass-4 changes; Tier 3 re-confirms the hardened API surface. The remediation backlog is documentation-only (PAD realignment, R4-1) plus two low-value tooling notes (R4-2 SKILL §11/Appendix C cross-reference for the new audit script; R4-3 optional dead-page guard in the audit script's CLS check — recommended deferral).

## Remediation backlog (second cycle of pass 4)

1. **R4-1 (T0-1/2/3, docs):** realign `Project_Architecture_Document.md` — 62→71 tests, qualify the ADR-009 XFF claim with the P4-F1 edge-fronted behavior, add `classifyBurstStatuses` + `scripts/live-deploy-audit.mjs` to the testing/tooling inventory.
2. **R4-2 (docs):** SKILL.md §11 pre-ship checklist + Appendix C gain the post-deploy step "run `scripts/live-deploy-audit.mjs` against the live origin" so the deploy gate is discoverable from the shipping checklist.
3. **R4-3 (optional, defer):** dead-page guard in `live-deploy-audit.mjs` CLS check (verify the navigation produced a non-empty DOM before scoring CLS). Low value while checks 1–5 gate origin liveness; deferred with rationale.

---

# Pass 5 — Tiered Code Review + Security Audit (2026-09-14, fifth session)

**Scope:** prove the codebase matches its documented contracts (AGENTS/CLAUDE/README/SKILL/PAD) and is safe to ship, at the post-pass-4 baseline (`3c38b8b`) plus this session's remediation-round-1 changes. Rubrics per `skills/skills-catalog.md`: `code-quality-standards` (Six-Axis), `security-and-hardening`, `vulnerability-scanner` (OWASP 2025), `code-review-checklist`, `verification-and-review-protocol` (Iron Law — every claim below carries fresh evidence). `skills/` excluded from checking/testing/compilation throughout.

## Tier 0 — Documented contracts: **MATCH (5/5)**

| Contract | Verification | Verdict |
|---|---|---|
| AGENTS.md | Commands table ↔ `package.json` scripts (all 13 present); e2e description ↔ `playwright.config.ts` (serial, chromium+Pixel-7, :3002, `E2E_BASE_URL` override); gotchas verified in code (no root `loading.tsx`, `dynamicParams=false`, bun.lock canonical, `git ls-files db/` empty post-P5-fix); CI gate exists and runs the documented set on every push (no branch filter) | MATCH |
| CLAUDE.md | Test-strategy counts (71 unit / 8 files) match the executed suite; env-var table matches `.env.example` + `src/data/site.ts` fallback chain; five-client-component rule verified (`use client` = 5 components + `error.tsx` boundary, documented) | MATCH |
| README.md | Post-remediation-round-1 state: unit count 71 (was stale at 62 — fixed as P5-F2); key features verified (19 WebP images, 8 SSG case studies, 13-URL sitemap, native `<details>` FAQ); deployment notes match live behavior (CF beacon allowance, robots preamble, obfuscation warning) | MATCH (after round-1 fix) |
| SKILL.md v2.3.0 | Post-round-1 self-consistent ("5 of 11" components, 3,611 lines / 33 files — both re-measured); token table transcribes `globals.css` exactly; ADR table matches the twelve decisions verified in code (ADR-005 seeded LCG, ADR-007 dual CSS guards pinned by `reveal-guard.test.ts`, ADR-011 schema, ADR-012 no boundary) | MATCH (after round-1 fix) |
| PAD | Pass-4 realignment holds: test-distribution table current, ADR-009 amendment present, tooling inventory lists exactly the four live tools (`db.ts`, `cls-regression.mjs`, `gap-proxy.mjs`, `live-deploy-audit.mjs`); known-issues §10 carries the email-obfuscation operator row | MATCH |

## Tier 1 — Mechanical gates + structural invariants + scans: **ALL GREEN, one finding**

- Full gate re-run this session: lint ✓ · typecheck (covers e2e + scripts) ✓ · 71/71 unit ✓ · build 20 routes ✓ · 83/83 e2e local (zero skips) ✓ · `cls-regression.mjs` worst 0.0000 ×3 ✓.
- Structural invariants: upward imports 0 (`from "@/app` in components/lib/data → empty); `rounded-(lg|xl|2xl|md)` 0; `shadow` 0; raw colors in components 0; `any` 0; eslint/ts suppressions 0; `dangerouslySetInnerHTML` exactly 1 (the sanctioned static theme script, no user input).
- Secret scan: clean — the only "key material" strings are `[REDACTED:ssh_private_key]` placeholders in the push docs; no tracked `.env`/`.db` after the P5-F1 untrack (`git ls-files db/` → empty).
- `bun audit`: exactly the one documented accepted risk (AUD-3: `deepmerge-ts <8.0.0` HIGH, transitive CLI-only via `prisma → @prisma/config`; runtime `@prisma/client` is zero-dep) — unchanged since pass 3.

**Finding AUD5-F1 (Medium — dead reference-project tooling):** `scripts/` ships six provably dead car-care-reference scripts plus one unrunnable one-shot. Evidence (per file):

| File | Evidence it is car-care reference material |
|---|---|
| `skill-verify.sh` | Header: "verification gate for **car-care_SKILL.md** claims" (target file does not exist in this repo); checks car-care deps (`zod@4.6.4`, `zustand`, `sonner`, `embla-carousel-react`, `sharp@0.35.4` — none in this repo); expects `src/components/wcc/` (16 files) and `src/data/wcc/content.ts`; check #2 runs `npm test` (this is a bun repo — the script **hangs**, verified: killed at 120 s); check #11 expects a CI timezone matrix this repo does not have |
| `vlm-parity-audit.mjs` | "compares … against the source site (**wecarecarcare.com**)" with car-care section pairs (ceramic hydrophobic demo, pricing packages, interior-only…) |
| `vlm-audit-pass2.mjs` | BASE = `tool-results/visual-audit-2026-09-13` (car-care audit dir, absent here); describes "DARK-THEME REDESIGN" divergence — the car-care project's narrative, not this site's |
| `vlm-check.mjs` | Hardcoded sandbox path `/home/z/my-project/tool-results/verify-pricing.png` (car-care artifact) |
| `hero-variants.mjs` | SRC = `/home/z/my-project/public/images/hero-car.webp` (nonexistent in this repo) |
| `gen-images.sh` | "Generate **We Care Car Care** site imagery" |
| `optimize-images.mjs` | Hardcoded `/home/z/my-project/public/images` (not repo-relative) **and** requires `sharp`, which is not a dependency — unrunnable from a fresh clone (its one-shot job, the committed WebP set, is complete) |

None of the seven is referenced by `package.json`, CI, or any contract doc (the pass-4 audit note mentions `skill-verify.sh` only as a secret-scan false-positive, not as tooling). Risk: a future agent executing `skill-verify.sh` hangs or "remediates" the repo toward car-care expectations; the files ship misleading content in a public repo. The three generic scripts (`vlm-audit.mjs`, `capture-sections.sh`, `contrast-check.mjs`) are arg-driven and harmless but undocumented (AUD5-F2, Info).

## Tier 2 — Six-Axis source review: **Approve (no new code defects)**

All 33 non-test source files, 8 test files, 7 e2e specs, 5 configs, prisma schema, and the four live scripts were read this pass. Per axis:

1. **Correctness** — estimator math fail-fast (`RangeError` on unknown ids, UI emits only table ids); `?service=` preselect validated against `ESTIMATOR_SERVICES` before the cast; sitemap `lastmod` deterministic (`SITE.contentUpdatedAt`); marquee duplicate half `aria-hidden` with `alt=""`; rate limiter bounded (sweep-at-cap) with the AUD-1 trust order and P4-F1 classifier exactly as documented.
2. **Readability** — single-render-path estimator (`OPTION_SETS`); colocated enum+label maps; comments explain why (fail-open DB, CSP allowance, seed arithmetic in tests); no dead code in `src/`.
3. **Architecture** — layer greps empty (downward-only holds); the one sanctioned boundary exception (`api/contact/route.ts` importing `@/lib/contact`) documented; content-as-code honored (components render data, no prose).
4. **Security** — zod validation at the boundary with per-field 400s; Prisma parameterized writes; no input reflection in any response; honeypot client-side (documented); PII-aware logging (message body never logged — length only); headers complete; health `no-store`.
5. **Performance** — SSG everywhere possible (20 routes, 5 dynamic); single insert per inquiry (no N+1 surface); memoized estimate; images pre-encoded WebP with explicit dimensions (no optimizer dependency).
6. **Aesthetic/UX rigor** — the parity audit (Pass 5 record in `docs/AUDIT_VISUAL_PARITY.md`) re-verified HIGH fidelity with every VLM flag DOM-refuted; the anti-generic invariants hold mechanically (no rounded-lg/shadows/palette colors/gradients).

## Tier 3 — Runtime security probes (local production server, `next start` :3005)

| Probe | Result |
|---|---|
| Method discipline (`GET/PUT/DELETE/PATCH` on `/api/contact`) | 405 ×4 ✓ |
| 2.5 MB body | clean 400 ✓ |
| Same-key XFF burst (6 requests) | `[202,202,202,202,202,429]` — AUD-1 isolated keying ✓ |
| Fresh `cf-connecting-ip` after another key's burst | isolated 202 ✓ |
| Forged multi-hop XFF | keyed on last hop (fresh → 202) ✓ |
| XSS payload in fields | response is the fixed message only — no reflection; stored value has no rendering surface (no inquiry UI; React escaping if ever rendered) ✓ |
| Web-servable secrets (`/db/custom.db`, `/.env`, traversal) | 404 ✓ |
| Control-char header | graceful 202 ✓ |
| Health caching | `no-store` ✓ |
| Unicode | Cyrillic names accepted (202); non-ASCII email local parts rejected by zod `.email()` — standard validator behavior (SMTPUTF8 addresses), informational (AUD5-F3) |

Two probe expectations were miscalibrated on first run and re-verified as correct behavior (script-tag name passes the min-2 schema — the payload is inert and unreflected; the 400 above came from the email field, not the name). No defect found.

## Verdict

**Safe to ship.** Zero Critical/High findings in runtime code. One Medium maintainability finding (AUD5-F1 — dead car-care tooling in `scripts/`), one informational tooling note (AUD5-F2), one accepted email-validation limitation (AUD5-F3), and two carried operator-side items (email-obfuscation dashboard toggle; deepmerge-ts accepted risk). The remediation backlog below feeds remediation plan #2 (`docs/REMEDIATION_PLAN.md` § Pass 5, second cycle).

## Remediation backlog (second cycle of pass 5)

| # | Item | Sev | Action |
|---|---|---|---|
| 1 | Delete the seven dead/unrunnable car-care scripts (`skill-verify.sh`, `vlm-parity-audit.mjs`, `vlm-audit-pass2.mjs`, `vlm-check.mjs`, `hero-variants.mjs`, `gen-images.sh`, `optimize-images.mjs`) | Medium | One atomic `chore:` commit; the git history preserves them |
| 2 | Document the three retained generic scripts in the PAD tooling inventory (external-tool requirements: z-ai SDK / agent-browser CLI) | Info | PAD table addition |
| 3 | Email-obfuscation toggle + delivery-hook wiring | Info | Operator actions (standing) |
