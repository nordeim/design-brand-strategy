/**
 * cls-regression.mjs — CLS regression guard (ADR-012, remediation pass 3).
 *
 * Guards the cold-load layout-stability contract: the prerendered home HTML
 * must stream in DOCUMENT ORDER (single shell). The original bug: the root
 * loading.tsx Suspense boundary made Next 16 stream the layout shell
 * (header + loading fallback + footer) BEFORE the page content; during
 * chunked delivery (Cloudflare-proxied origin), Chrome painted the partial
 * shell and the footer jumped ~5400px when content arrived — measured CLS
 * 0.31 on the live deploy, ~50-75% of cold loads.
 *
 * Method: this script manages its own servers —
 *   1. `next start` on :3199 (requires a fresh `bun run build`),
 *   2. a gap proxy on :3200 that replays the upstream HTML with a 300ms
 *      delivery gap after the first 7KB (simulating CF edge chunking),
 *   3. three Chromium loads through the proxy measuring layout-shift totals.
 *
 * Exit 0 = GREEN (worst CLS <= 0.1). Exit 1 = RED (regression).
 *
 * Usage: bun scripts/cls-regression.mjs
 * (Run from the repo root; `bun run build` first.)
 */
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";

const UPSTREAM_PORT = 3199;
const PROXY_PORT = 3200;
const PROXY_URL = `http://127.0.0.1:${PROXY_PORT}/`;
const GAP_MS = 300;
const FIRST_BYTES = 7000;

function startServer(command, args, readyUrl, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "ignore", detached: true });
    const started = Date.now();
    const poll = setInterval(async () => {
      if (Date.now() - started > timeoutMs) {
        clearInterval(poll);
        reject(new Error(`server not ready: ${command} ${args.join(" ")}`));
        return;
      }
      try {
        const res = await fetch(readyUrl, { signal: AbortSignal.timeout(1500) });
        if (res.ok || res.status < 500) {
          clearInterval(poll);
          resolve(child);
        }
      } catch { /* not up yet */ }
    }, 500);
  });
}

async function measureCls(browser) {
  let worst = 0;
  for (let i = 0; i < 3; i++) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.addInitScript(() => {
      window.__shifts = [];
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) if (!e.hadRecentInput) window.__shifts.push(e.value);
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto(PROXY_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(3000);
    const entries = await page.evaluate(() => window.__shifts);
    const total = entries.reduce((a, v) => a + v, 0);
    worst = Math.max(worst, total);
    console.log(`  run ${i + 1}: shifts=${entries.length} CLS=${total.toFixed(4)}`);
    await ctx.close();
  }
  return worst;
}

async function main() {
  // 1. Production server on :3199 (the shipped artifact, never dev HMR).
  const nextServer = await startServer("npx", ["next", "start", "--port", String(UPSTREAM_PORT)], `http://127.0.0.1:${UPSTREAM_PORT}/api/health`);
  // 2. Gap proxy on :3200 (replays upstream HTML with a mid-stream pause).
  const proxy = await startServer("bun", ["scripts/gap-proxy.mjs", String(UPSTREAM_PORT), String(PROXY_PORT), String(GAP_MS), String(FIRST_BYTES)], PROXY_URL);

  console.log(`CLS regression harness — gap ${GAP_MS}ms after ${FIRST_BYTES}B, via :${PROXY_PORT}`);
  let exitCode = 0;
  try {
    const browser = await chromium.launch();
    const worst = await measureCls(browser);
    await browser.close();
    console.log(`WORST CLS: ${worst.toFixed(4)} (threshold 0.1)`);
    exitCode = worst > 0.1 ? 1 : 0;
  } finally {
    try { process.kill(-nextServer.pid, "SIGKILL"); } catch { /* already down */ }
    try { process.kill(-proxy.pid, "SIGKILL"); } catch { /* already down */ }
  }
  process.exit(exitCode);
}

main().catch((e) => { console.error(e); process.exit(1); });
