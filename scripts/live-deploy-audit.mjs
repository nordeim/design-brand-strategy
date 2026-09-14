/**
 * live-deploy-audit.mjs — post-deploy state audit (remediation pass 4, P4-F2).
 *
 * The e2e suite validates the CODE contract against a self-managed origin;
 * this script validates the OPERATOR-side deploy state against a running
 * deployment (typically the live Cloudflare-fronted site). It codifies the
 * pass-3 "suggested next steps" into a repeatable gate:
 *
 *   1. /api/health          — liveness + service identity
 *   2. security headers     — the documented contract set (CSP incl. the
 *                             cloudflareinsights analytics origin, HSTS,
 *                             XFO DENY, nosniff, Referrer/Permissions-Policy)
 *   3. hard-404 contract    — an unknown /work/<slug> must 404 at the router
 *                             (ADR-012 / dynamicParams=false), never a 200
 *   4. robots.txt           — the app's Sitemap: pointer survives any
 *                             edge-injected preamble (Cloudflare Managed
 *                             Content) and /api/ stays disallowed
 *   5. email obfuscation    — the /contact HTML must contain NO
 *                             /cdn-cgi/l/email-protection rewrites: Cloudflare
 *                             Scrape Shield "Email Address Obfuscation"
 *                             rewrites studio@elenavance.com into obfuscated
 *                             spans, risking React hydration mismatches and a
 *                             [email protected] flash (README § Deployment) —
 *                             this is the one dashboard toggle the app cannot
 *                             fix in code
 *   6. cold-load CLS        — layout stability on the real network (ADR-012
 *                             threshold: worst of 2 navigations <= 0.1)
 *
 * Exit 0 = deploy state GREEN. Exit 1 = at least one check failed (each
 * failure prints a remediation hint).
 *
 * Usage:
 *   LIVE_URL=https://design-brand-strategy.jesspete.shop bun scripts/live-deploy-audit.mjs
 *   bun scripts/live-deploy-audit.mjs                       # default: the live origin
 *   LIVE_URL=http://127.0.0.1:3000 bun scripts/live-deploy-audit.mjs   # local prod server
 */
import { chromium } from "@playwright/test";

const BASE = process.env.LIVE_URL ?? "https://design-brand-strategy.jesspete.shop";

const results = [];
function record(id, pass, evidence, hint) {
  results.push({ id, pass, evidence, hint });
  console.log(`  ${pass ? "PASS" : "FAIL"}  ${id}${evidence ? ` — ${evidence}` : ""}`);
  if (!pass && hint) console.log(`        fix: ${hint}`);
}

async function main() {
  console.log(`live-deploy-audit — ${BASE}`);

  // ---- 1. health -----------------------------------------------------------
  try {
    const res = await fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(10_000) });
    const body = (await res.json().catch(() => null));
    const cc = res.headers.get("cache-control") ?? "";
    record(
      "health",
      res.status === 200 && body?.ok === true && body?.service === "design-brand-strategy" && cc.includes("no-store"),
      `status=${res.status} service=${body?.service} cache-control=${cc || "(none)"}`,
      "check the deployment logs — the app or the health route is unhealthy",
    );
  } catch (e) {
    record("health", false, String(e).slice(0, 80), "the origin is unreachable — check DNS / the deployment");
  }

  // ---- 2. security headers ---------------------------------------------------
  const EXPECTED_HEADERS = [
    ["content-security-policy", "default-src 'self'"],
    ["content-security-policy", "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com"],
    ["content-security-policy", "object-src 'none'"],
    ["content-security-policy", "frame-ancestors 'none'"],
    ["strict-transport-security", "max-age=63072000"],
    ["x-frame-options", "DENY"],
    ["x-content-type-options", "nosniff"],
    ["referrer-policy", "strict-origin-when-cross-origin"],
    ["permissions-policy", "camera=(), microphone=(), geolocation=()"],
  ];
  try {
    const res = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(10_000) });
    const joined = [...res.headers.entries()].map(([k, v]) => [k.toLowerCase(), v]);
    const get = (name) => joined.filter(([k]) => k === name).map(([, v]) => v).join("; ");
    const missing = EXPECTED_HEADERS.filter(([k, frag]) => !get(k).includes(frag));
    record(
      "security-headers",
      res.status === 200 && missing.length === 0,
      missing.length === 0 ? "full documented set present" : `missing: ${missing.map(([k, f]) => `${k}:…${f.slice(0, 30)}…`).join(", ")}`,
      "headers are emitted by next.config.ts — if missing, the edge is stripping them (check any proxy config in front of the app)",
    );
  } catch (e) {
    record("security-headers", false, String(e).slice(0, 80), "origin unreachable");
  }

  // ---- 3. hard-404 -----------------------------------------------------------
  try {
    const res = await fetch(`${BASE}/work/this-slug-was-decided-against-${Date.now()}`, {
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    });
    const cache = res.headers.get("cache-control") ?? "";
    record(
      "hard-404",
      res.status === 404,
      `unknown /work/<slug> → ${res.status} (cache-control: ${cache || "(none)"})`,
      "a 200 here means the SSG hard-404 contract regressed (ADR-012: no root loading boundary, dynamicParams=false)",
    );
  } catch (e) {
    record("hard-404", false, String(e).slice(0, 80), "origin unreachable");
  }

  // ---- 4. robots.txt ---------------------------------------------------------
  try {
    const res = await fetch(`${BASE}/robots.txt`, { signal: AbortSignal.timeout(10_000) });
    const text = await res.text();
    const sitemapOk = /Sitemap:\s*https?:\/\/\S+\/sitemap\.xml/i.test(text);
    const apiDisallowed = /Disallow:\s*\/api\//i.test(text);
    const cfManaged = /BEGIN Cloudflare Managed [Cc]ontent/i.test(text);
    record(
      "robots",
      res.status === 200 && sitemapOk && apiDisallowed,
      `sitemap pointer=${sitemapOk} /api/ disallowed=${apiDisallowed}${cfManaged ? " (CF managed-content preamble present — expected, informational)" : ""}`,
      "the app's robots directives are missing — check that app/robots.ts output reaches the response (an edge rewrite may have replaced the file)",
    );
  } catch (e) {
    record("robots", false, String(e).slice(0, 80), "origin unreachable");
  }

  // ---- 5. email obfuscation ----------------------------------------------------
  try {
    const res = await fetch(`${BASE}/contact`, { signal: AbortSignal.timeout(10_000) });
    const html = await res.text();
    const rewrites = html.match(/cdn-cgi\/l\/email-protection/g)?.length ?? 0;
    const plain = html.includes("studio@elenavance.com");
    record(
      "email-obfuscation",
      rewrites === 0,
      `${rewrites} obfuscated email rewrite(s) on /contact; plain studio@elenavance.com present=${plain}`,
      "Cloudflare dashboard → Scrape Shield → disable Email Address Obfuscation for this zone (README § Deployment — hydration-mismatch + [email protected]-flash risk)",
    );
  } catch (e) {
    record("email-obfuscation", false, String(e).slice(0, 80), "origin unreachable");
  }

  // ---- 6. cold-load CLS --------------------------------------------------------
  try {
    const browser = await chromium.launch();
    let worst = 0;
    for (let i = 0; i < 2; i++) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await ctx.newPage();
      let cls = 0;
      await page.exposeFunction("__reportCls", (v) => { cls = v; });
      await page.addInitScript(() => {
        let total = 0;
        try {
          new PerformanceObserver((l) => {
            for (const e of l.getEntries()) if (!e.hadRecentInput) total += e.value;
          }).observe({ type: "layout-shift", buffered: true });
        } catch { /* older engine */ }
        setTimeout(() => window.__reportCls(total), 5000);
      });
      await page.goto(`${BASE}/`, { waitUntil: "load", timeout: 45_000 }).catch(() => {});
      await page.waitForTimeout(5500);
      worst = Math.max(worst, cls);
      await ctx.close();
    }
    await browser.close();
    record(
      "cold-load-cls",
      worst <= 0.1,
      `worst of 2 cold navigations = ${worst.toFixed(4)} (threshold 0.1, ADR-012)`,
      "layout shifts on cold load — suspect a reintroduced streaming boundary (loading.tsx) or late layout-affecting injection at the edge",
    );
  } catch (e) {
    record("cold-load-cls", false, String(e).slice(0, 80), "browser measurement failed — is the Playwright chromium binary installed?");
  }

  // ---- summary -----------------------------------------------------------------
  const failed = results.filter((r) => !r.pass);
  console.log(`\nlive-deploy-audit: ${results.length - failed.length}/${results.length} checks passed${failed.length ? ` — FAILED: ${failed.map((f) => f.id).join(", ")}` : " — deploy state GREEN"}`);
  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
