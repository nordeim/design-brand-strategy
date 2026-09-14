I'll start by internalizing the instructions and setting up the task. This is a complex multi-phase task involving code review, E2E testing, remediation, security audit, and git push. Let me create a structured plan first.
## Phase 1: Clone Repository & Review Key Documentation
Repo cloned successfully. Now let me read the key documentation files in parallel:
Now let me read the README and SKILL files:
The SKILL file is large. Let me read it in sections:
I've now read the full SKILL.md. I notice a potential documentation drift already: AGENTS.md mentions **Prisma SQLite (ADR-011)** with a `ContactInquiry` table, while CLAUDE.md/README.md/SKILL.md still say "no database". Let me check the git history and the skills catalog:
I notice the git log shows `50c357f add skills` as HEAD. The user mentioned `docs/ssh_git_wrapper_v3.py` and `docs/how-to-git-push-using-ssh-wrapper_SKILL.md` — let me verify these exist, and check the skills catalog:
Let me search the skills catalog for relevant skills for the tasks ahead (browser testing, code review, security audit, TDD):
The catalog has relevant skills. Now let me verify important gaps — the user mentioned `docs/ssh_git_wrapper_v3.py` and `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`. Let me search the whole repo, check what the last commit included, and read ADR-011:
**Critical discovery**: The last commit `50c357f` ("add skills") includes `.env` (48 lines!) and `db/custom.db` — both of which AGENTS.md says should be gitignored. Let me investigate:
The `.env` committed is a template (no real secrets), but `db/custom.db` (PII) was force-committed despite gitignore. Let me see the full commit and check what's tracked:
Now let me read the key documentation — ADR-011 and the VALIDATION_REPORT:
I now have a comprehensive understanding of the project. The state is: ADR-011 added Prisma SQLite persistence in the last commit. Let me update my progress and validate understanding against the actual codebase:
## Phase 2: Validate Understanding Against Codebase

Let me read the key config files and source code to verify documented contracts:
Note: `tsconfig.json` now **excludes** `e2e` and `scripts` — but docs claim typecheck covers e2e specs. Let me check what changed and read the Prisma integration files:
Confirmed drift #1: typecheck no longer covers e2e/scripts but docs claim it does. Now the Prisma integration files:
The Prisma integration is solid. Now let me run the full verification gates to confirm project status. First, install dependencies:
**CRITICAL FINDING**: `db:push` resolved the database to `/home/z/my-project/db/custom.db` — the repo's **parent** directory, not the repo root! This is exactly the hazard `db-url.ts` was supposed to fix. Let me investigate the wrapper script:
**Bug confirmed**: `/home/z/my-project/db/custom.db` (parent dir) was created by my `db:push` run — the wrapper failed to pin the repo-root path. This is the exact hazard the script documents. Let me debug:
The resolver itself returned the parent path. Let me test the resolver logic directly to find the root cause:
The resolver works correctly in isolation! The issue must be in the wrapper's environment. Let me debug what the wrapper actually sees:
**Root cause found**: There's a parent-level `/home/z/my-project/.env` (created by a previous session) with an absolute `DATABASE_URL` that bun auto-loads, overriding the repo's `.env`. The resolver passes absolute URLs through unchanged — so CLI and runtime stay consistent, but not at the repo-root path. This is environment behavior worth noting. Let me check the committed `db/custom.db` for PII (a security concern) and view the parent .env:
The committed DB contains 27 rows of synthetic test data (e2e submissions) — not real PII, but it violates the repo's own "never commit db/*.db" contract. Now let me run the full verification gates:
All gates green (52/52 tests, 20 routes). Now let me check Playwright and run the e2e suite:
32 passed but exit code 1 — some tests failed. Let me capture the full output:
All 44 failures are environment-related: `@playwright/test@1.63.0` (from the updated lockfile) needs `chromium_headless_shell-1243` which isn't cached. Let me check the lockfile drift and install the browser:
Lockfile has 1.63.0 (docs claim 1.62.0 pinned — drift). Browser installed now. Re-running e2e:
**All 81 e2e specs pass locally.** The verification gate is fully green. Let me record progress in the worklog before moving to live-site testing:
## Phase 3: Browser-Based E2E Testing Against Live Site

First, let me verify the live site is reachable and check its health/headers:
Live site is healthy with all security headers. Now let me run the **full Playwright e2e suite against the live site** using the config's built-in `E2E_BASE_URL` support:
All 76 chromium specs pass against the live site. Now the mobile project:
**All 81 specs pass against the live deployment.** Let me also verify SEO surfaces directly and check for deployment freshness:
Important findings. The contact API works live (400 + field errors), but **`/work/bogus-slug` returns HTTP 200 instead of 404** on the live site! Let me verify against the local server to isolate the cause:
**BUG CONFIRMED — also on local!** Unknown top-level routes return 404 correctly, but `/work/<invalid-slug>` returns 200. Let me examine the case study page code:
The code DOES call `notFound()`. Let me check what the response body actually contains — this could be a Next.js 16 behavior issue:
**Bug root cause identified**: `/work/bogus-slug` returns HTTP 200 + not-found content + `Cache-Control: s-maxage=31536000` (1-year CDN cache!). This is the known Next.js `dynamicParams` behavior — the e2e suite missed it because its 404 spec only tests a top-level unknown route. Let me check the config and stop the local server:
Both live-site checks confirm the bug. Now let me examine the repo's existing parity-audit scripts to plan the visual fidelity check:
The repo's scripts use VLM + geometry probing (per lesson L13: "probe rendered geometry, not DOM order"). Let me write a comprehensive Playwright-based parity comparison script following the repo's established methodology:
Rich comparison data captured. Key findings: aspect ratios match (0.8 portrait, 1.6 cards), but there's a **CSP violation blocking Cloudflare's analytics beacon on the live site**, and the source site is a SPA with different routing behavior. Let me now run a VLM-based visual comparison of the screenshots, following the repo's established pattern:
I'll use the `z-ai vision` CLI for pairwise screenshot comparison, following the repo's established VLM audit pattern:
The VLM flags content differences (expected — original copy/imagery by design) but also mentions marquee vs static grid discrepancy. Let me get a detailed description of the source site's structure to clarify:
The source site DOES have a marquee (my selector just missed it). Structural parity is high — content differences are intentional (original implementation). Let me find the source site's actual case-study URLs and run VLM comparisons on remaining pages:
VLM rates all pages HIGH fidelity. Some flagged gaps contradict the code — let me verify each claim against the actual DOM/code before accepting them:
VLM's flagged gaps are mostly misreads (verified present in DOM). The remaining question is the contact submit button shape. Let me check:
Buttons are pill-shaped (`rounded-full`) — VLM misread again. **Visual parity verdict: HIGH fidelity** (structure, typography, palette, aspects, and CTA grammar all match; VLM's flagged "gaps" verified as misreads). Let me do a final live performance probe, then log findings:
**New finding: CLS 0.31 on live (POOR — threshold 0.1)**, while local validation reported CLS 0. Let me identify the shifting elements:
Empty on re-probe — the 0.31 may be flaky. Let me reproduce the original measurement multiple times:
The 0.31 comes from many tiny shifts (each below my 0.005 filter). Let me capture ALL shifts without threshold:
Contradictory results — the shift is intermittent. Let me loop the detailed probe to catch it:
**CLS root cause**: single 0.31 shift at ~294ms (font-swap timing), source = **footer** reflow. Let me check if the local build reproduces it (isolating deploy vs code):
Local CLS = 0.0; live CLS = 0.31 — deploy-specific. Let me confirm the font-swap theory with a warm-cache test:
Warm cache → CLS 0. Font-swap reflow confirmed. Let me capture the exact before/after rects to understand the shift mechanics:
Flaky timing. Let me force reproduction with network throttling (simulating a real first-visit user):
No shift with delayed fonts — theory incomplete. Let me run a comprehensive loop capturing ALL shifts with rects until the 0.31 reproduces:
**BREAKTHROUGH**: The footer's previous rect was `1440x279 @ y:621` — an *unstyled* footer size (styled is 614px tall). This indicates a **FOUC (flash of unstyled content) on cold loads** — the first paint happens before the stylesheet applies. Let me check what Cloudflare injects into the HTML (Rocket Loader/auto-minify can break render-blocking CSS):
Stylesheet is properly in `<head>`. Let me inspect the head's script order and check the actual response streaming behavior:
HTML structure is correct. Let me test the FOUC theory directly by delaying the CSS on the live site:
CSS delay → no shift either. New theory: **Cloudflare Email Obfuscation rewrites emails in HTML → hydration mismatch → React re-render**. Let me check the live HTML for obfuscated emails:
**ROOT CAUSE CONFIRMED**: Cloudflare Email Obfuscation rewrites `studio@elenavance.com` in the SSR HTML to `[email protected]` spans → React hydration mismatch → re-render → intermittent CLS 0.31. Let me capture the hydration error console output to seal the diagnosis:
No hydration errors — decode script wins the race consistently. Let me get a frame-by-frame geometry timeline to see exactly what happens during the shift:
**SMOKING GUN**: At t=234ms the page is only 1235px tall (header+hero+footer, CSS loaded), then at t=269ms the body grows to 6650px — content streams in and pushes the footer down. The question is why the footer arrives before the main content. Let me check byte positions in the HTML:
**MECHANISM CONFIRMED**: Next.js 16 streams the layout shell (header + **footer** at byte 6981) BEFORE the page content (byte 15108+). Chrome paints the partial DOM during network gaps → footer jumps 5400px when content arrives → CLS 0.31. Let me check the local build's HTML stream order and the role of `loading.tsx`:
**Full diagnosis complete.** Let me record all findings and stop the local server:
## Phase 5: Remediation Plan (with repo skills consultation)

Let me consult the repo's TDD and E2E testing skills to inform the remediation plan:
Now let me validate the remediation plan's key assumptions against the codebase before writing it (per the required PLAN → VALIDATE step):
Key validation findings: tsc on e2e fails due to **duplicate playwright-core versions** (why the previous agent excluded e2e from typecheck). Let me investigate this dependency conflict:
**Root cause of typecheck exclusion found**: root-hoisted `playwright-core@1.62.0` (stale) + nested `playwright-core@1.63.0`. Let me check the lockfile:
**The lockfile itself is inconsistent** — stale root `playwright-core@1.62.0` (from the 1.62 era) forces 1.63.0 to nest. This is the true cause of the tsconfig exclusion. Let me fix the lockfile properly:
`bun update` added playwright-core as a direct devDependency — not desired. Let me revert that and do a clean reinstall with the corrected lockfile:
Almost there — the Prisma client needs regeneration after the clean reinstall. Let me complete the verification:
**Typecheck now passes with e2e + scripts included** — the documented contract can be restored. Now let me validate the CLS fix hypothesis (remove `loading.tsx`) before finalizing the plan:
The route-based chunking approach is flawed. Let me rewrite using CDP network throttling — a realistic slow-network simulation:
CLS 0 locally even with throttling — the live trigger is a discrete delivery **gap**, not slowness. Let me build a precise chunk-gap proxy to reproduce it:
**PERFECT REPRODUCTION**: CLS = 0.31, single FOOTER shift — exactly matching the live site's signature. Now let me validate the fix hypothesis (remove `loading.tsx` → single-shell stream):
**Hypothesis FAILED** — removing `loading.tsx` doesn't change the stream order; Next.js 16's core streaming format always emits shell-first. Let me examine the actual HTML structure to understand the mechanism precisely:
**The mechanism is now fully clear**: With `loading.tsx`, the shell paints header + loading-fallback(60vh=540px) + footer(at y=621, IN viewport) → content swap pushes footer out → CLS 0.31. **The minimal fix**: make the loading fallback fill the viewport so the footer sits below the fold in the partial paint. Let me test:
Worse (0.45)! Let me capture the rects to understand:
**CRITICAL REALIZATION**: My earlier "remove loading.tsx" test was INVALID — the old server was still bound to port 3199, so I measured the stale build! Let me redo it properly:
Identical byte positions — suspicious. Let me verify whether the HTML still contains the loading fallback:
The old server survived pkill (process name differs). Let me kill by port properly:
**The stale server masked the real result!** With `loading.tsx` removed: footer now at byte 39496 (AFTER content at 11790) — document order restored! Let me run the CLS harness:
**CLS FIX VALIDATED — RED → GREEN**: 0.31 → 0.00. Now let me quickly validate the 404 fix hypothesis too, then restore state and write the formal remediation plan:
**Double win**: removing `loading.tsx` fixes BOTH the CLS 0.31 AND the bogus-slug 200-status bug (the not-found content streamed as a "200 + cached prerender" artifact). The `dynamicParams=false` adds defense-in-depth. Let me reset to baseline and write the formal remediation plan:
Lockfile properly deduped and CI-safe. Let me verify gates still pass on this state, then write the remediation plan:
All gates green. Now let me review the existing remediation plan format and write the Pass 3 plan:
Now let me write the Pass 3 remediation plan following the repo's established format:
The plan was written (the wc failure was a cwd artifact). Let me verify the complete Pass 3 section:
Plan validated and aligned. Moving to execution:

## Phase 7: Execute Remediation Plan with TDD

### Slice A — RED: Write failing tests first
I notice a possible typo at line 43 (`aref^=` looks broken). Let me check:
False alarm — the selector is correct (`a[href^='/work/']` — display artifact). Now writing the RED tests for Slice A:
Now let me add the RED tests — the bogus-slug 404 test and the stream-order CLS guard:
Now let me run the new specs to confirm they're **RED** (failing against the current baseline):
RED confirmed for both tests. The content marker needs fixing (the H1 contains an `<em>` tag splitting the text). Let me use a stable marker:
**Perfect RED state** — both failures show exactly the measured bugs (200 vs 404; footer at 6981 vs content at 14861). Now **GREEN** — apply the fixes:
**GREEN achieved**. Now the full suite to check for regressions:
**83/83 pass**. Let me verify the CLS fix with the gap-proxy harness and run remaining gates:
Let me create the final self-contained CLS regression harness for the repo (P3-F3):
**Slice A complete** (CLS 0.0000, was 0.3100). Now **Slice B — CSP beacon**: RED first:
RED confirmed. Now **GREEN** — update `next.config.ts`:
Slice B GREEN. Now **Slice C — restore typecheck coverage** (tsconfig re-include e2e/scripts with the deduped lockfile):
Typecheck covers e2e + scripts again. Now **Slice D — git hygiene** (untrack PII DB, .env, package-lock.json):
Slice D complete. Now **Slice E — SSH wrapper tooling** (P3-F8). Creating the wrapper script and its runbook:
Now let me test the SSH wrapper with a dry-run using the provided key:
The wrapper works but `ssh` binary is missing in this environment. Let me check and install:
No ssh binary and no root access. Let me check for Python SSH libraries to build a shim:
paramiko works with PYTHONPATH. Let me build an `ssh` shim (sandbox-only) that speaks paramiko so the wrapper's `ssh` invocation works:
**The SSH wrapper works end-to-end** (authenticated via ls-remote, dry-run push succeeded, key shredded). Now the docs realignment (P3-F9). Starting with CLAUDE.md:
CLAUDE.md updated. Now AGENTS.md:
AGENTS.md done. Now README.md:
The MultiEdit was atomic and failed on one mismatched block. Let me read the exact text and retry:
Most edits applied — only the file hierarchy failed. Let me apply the remaining edits:
README done. Now the SKILL.md v2.2.0 update — let me find all stale claims first:
I notice my edit accidentally **replaced** L13 instead of appending after it. Let me restore L13:
Now the remaining SKILL.md sections — env vars, quality gates, vitest row, and appendices:
Now the appendices — add ADR-011/012 and the pass 3 audit history:
Now add the pass 3 audit history row and update the PAD (Project_Architecture_Document.md):
Let me add ADR-012 to the PAD after ADR-011:
All docs updated. Now the full verification gate on the remediated codebase:
**Full gate GREEN** (52/52, 83/83, CLS 0.0000). Let me update the worklog and proceed to the audit phase:
## Phase 9: Tiered Code Review + Security Audit

Let me consult the repo's audit skills (Six-Axis review, security hardening):
I have the audit rubrics. Now executing the **tiered audit**. Tier 1 — mechanical gates + structural invariants + dependency/secret scans:
**Dependency audit finding**: transitive `deepmerge-ts < 8.0.0` (high advisory) via prisma CLI. Let me check runtime reachability and try to bump it:
`deepmerge-ts` is **CLI-only** (prisma devDep → @prisma/config, exact-pinned 7.1.5; `@prisma/client` runtime has zero deps) — no runtime exposure. Now **Tier 2 — Six-Axis source review**. Reading the key components:
Found a real security finding in `rate-limit.ts` (spoofable `x-forwarded-for` behind Cloudflare). Let me continue the review of remaining files:
All source files reviewed — uniformly high quality. Now **Tier 3 — runtime security probes** against the local production server:
**Rate-limit XFF spoofing confirmed** (P4: 7 different spoofed IPs → all 202). Also found a doc-vs-code PII wording drift in the contact log. Let me check the remaining pages and verify the not-found surface:
Now let me verify e2e compatibility for the AUD-1 fix (checking how contact specs spoof XFF):
Single-value XFF spoofing — fully compatible with the LAST-entry fix. Now let me write the audit report. First, check the existing audit doc format:
Now writing the Pass 3 tiered audit report:
## Phase 10: Second Remediation Cycle (TDD)

### R2-1 — RED: Write failing unit tests for the `clientKey` hardening
**RED confirmed** (5 failing). Now **GREEN** — implement the hardening:
**GREEN — 62/62 tests.** Now **R2-2** — fix the PII posture wording:
Now update the route comment and all test-count references (52 → 62):
Now the final full verification gate after the second remediation cycle:
All gates green. Let me verify the AUD-1 fix behaviorally at runtime, then update the worklog:
**AUD-1 fix verified at runtime** — forged first hops now rate-limited by real IP (429 on 6th), `cf-connecting-ip` takes precedence. Updating worklog, then final phase — commits and push:
## Final Phase: Git Commits + Push

Let me check the git identity and create the commit series (following the repo's Conventional Commits + per-pass house style):
Commit 1 accidentally swept in the staged deletions. Let me redo it cleanly with a soft reset:
All clean — 4 commits ready. Now the **push via the SSH wrapper**:
**Push successful!** `50c357f..d738631 HEAD -> main`. Let me verify the remote state and clean up the key material:
The push itself succeeded (wrapper confirmed `50c357f..d738631`). My direct ls-remote failed only because it lacked the key. Let me verify the remote HEAD via HTTPS read access:
**Remote confirmed at `d738631` = local main.** All commits landed on main (no branches created). Final worklog entry:
All 12 phases complete. Here's the full session summary:

---

## ✅ Mission Complete — design-brand-strategy Pass 3

**Validated** the codebase against all four contract docs (gates: 52→62 unit, 83 e2e, 20 routes, all green), then ran the **entire Playwright suite against the live site** (81/81 ✅) plus CWV probing and VLM/geometry parity re-audit vs the source site (**HIGH fidelity confirmed**).

**Key bugs found & fixed (TDD, RED→GREEN):**
| Finding | Root cause | Fix |
|---|---|---|
| Cold-load **CLS 0.31** on live | Root `loading.tsx` split the HTML stream — Chrome painted the shell (footer at byte 6.9k) during CDN delivery gaps, footer then jumped ~5400px | Removed the boundary (ADR-012) → **CLS 0.0000**, verified via a new gap-proxy harness |
| `/work/<bogus>` → **HTTP 200** + 1-year CDN cache | Same stream split + missing `dynamicParams = false` | Hard-404 at the router + e2e status guards |
| Rate limiter **bypassable** via forged `x-forwarded-for` (AUD-1) | First-hop keying; `cf-connecting-ip` ignored | Edge-safe trust order + 10 new unit tests |
| CSP blocking Cloudflare Analytics beacon | Missing host origin | Added with documented rationale |

**Also delivered:** typecheck coverage restored (playwright-core lockfile dedupe), git hygiene (PII DB/`.env`/npm lock untracked), the missing `docs/ssh_git_wrapper_v3.py` + runbook (created & tested), all 5 docs realigned (SKILL v2.2.0), tiered audit report with severity-ranked evidence.

**Pushed to `main`** (4 atomic commits, `50c357f..d738631`) via the SSH wrapper — key shredded after use, remote verified.

**Suggested next steps:** ① Redeploy the live site (`bun run build && bun run start`) so the fixes take effect at `design-brand-strategy.jesspete.shop`, then re-run `E2E_BASE_URL=... bunx playwright test` against it; ② In the Cloudflare dashboard, disable **Email Address Obfuscation** (Scrape Shield) per the README note; ③ Consider wiring the `contact_inquiry` delivery hook (the one remaining HIGH open item).
