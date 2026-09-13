import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config — adapted from home-financing/playwright.config.ts (ModFii) for
 * design-brand-strategy (Elena Vance editorial portfolio).
 *
 * Differences from the reference, adapted as appropriate:
 *  - Runs against a production build (`next start`, never `next dev`) — same
 *    principle: validate the shipped artifact, where dev HMR hydration can
 *    diverge from prod.
 *  - Projects: Desktop Chromium + a mobile-emulation project (Pixel 7) instead
 *    of chromium+webkit. This sandbox caches only the Chromium build; the
 *    mobile project covers the responsive breakpoints (md: nav → hamburger
 *    overlay) which is where this site's layout actually forks. Adding a
 *    WebKit project is a documented deferral (see docs/REMEDIATION_PLAN.md).
 *  - No database dependency: the contact API is stateless (in-memory rate
 *    limiter), so tests spoof `x-forwarded-for` per test instead of seeding.
 *
 * Env:
 *   E2E_PORT     — port for webServer (default 3002)
 *   E2E_BASE_URL — full base URL to reuse an external server (CI: set to reuse)
 */
const PORT = Number(process.env.E2E_PORT ?? 3002);
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  // Serial: contact-API tests mutate shared server state (in-memory rate-limit
  // buckets) and must not interleave with parallel page loads.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      // Desktop project: everything except the mobile-only spec.
      testIgnore: /mobile\.spec\.ts/,
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
      // Mobile project: only the mobile-viewport spec (hamburger menu, scroll
      // lock, overlay nav) — desktop specs already cover the shared surface.
      testMatch: /mobile\.spec\.ts/,
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npx next start --port ${PORT}`,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 90_000,
      },
});
