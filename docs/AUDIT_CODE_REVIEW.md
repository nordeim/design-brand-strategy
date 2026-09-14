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
