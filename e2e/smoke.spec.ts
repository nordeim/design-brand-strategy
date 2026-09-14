import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Smoke — critical surfaces that must render on the production Next build
 * (webServer: `next start`, never `next dev`). Adapted from
 * home-financing/e2e/smoke.spec.ts for the Elena Vance editorial portfolio:
 * no DB liveness (stateless contact API) and an explicit security-header
 * contract emitted by next.config.ts itself.
 */

test.describe("home smoke", () => {
  test("home renders hero, primary nav, and footer", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Brands built on intention and clarity.",
    );
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav).toBeVisible();
    for (const label of ["Work", "About", "Services", "Contact"]) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("hero shows the availability pill and portrait", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText("Booking select projects for 2026", { exact: true }).first(),
    ).toBeVisible();
    await expect(
      page.getByAltText("Studio portrait of Elena Vance against a warm cream backdrop"),
    ).toBeVisible();
  });

  test("home links into the work index via the hero CTA", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "View selected work" }).click();
    await expect(page).toHaveURL(/\/work$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Eight projects, chosen with care.",
    );
  });

  test("work index lists all eight case studies", async ({ page }) => {
    await page.goto("/work");
    const cards = page.locator("a[href^='/work/']");
    await expect(cards).toHaveCount(8);
  });

  test("about, services, and contact each render their headline", async ({ page }) => {
    const headlines: Array<[string, string]> = [
      ["/about", "The designer your brand will grow into."],
      ["/services", "Six practices, one standard of care."],
      ["/contact", "Start with a conversation."],
    ];
    for (const [route, headline] of headlines) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(headline);
    }
  });

  test("case study page renders overview, meta, and next-project link", async ({ page }) => {
    await page.goto("/work/alder-pine");
    await expect(page.getByRole("heading", { level: 1, name: "Alder & Pine" })).toBeVisible();
    // Sticky meta sidebar carries the structured facts (scoped: the sector
    // string also appears inside prose).
    const meta = page.getByRole("complementary");
    await expect(meta.getByText("Home Goods", { exact: true })).toBeVisible();
    await expect(meta.getByText("Portland, OR", { exact: true })).toBeVisible();
    // The next-project footer band links onward (Vantage follows Alder & Pine).
    await expect(page.getByRole("link", { name: /Vantage Studio/ })).toBeVisible();
  });

  test("404 renders recovery paths", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist-xyz");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "This page was decided against.",
    );
    await expect(page.getByRole("link", { name: "Back home" })).toBeVisible();
    await expect(page.getByRole("link", { name: "View the work" })).toBeVisible();
  });

  test("unknown case-study slugs hard-404 (dynamicParams contract)", async ({ page }) => {
    // P3-1/P3-F2: /work/<slug> is SSG-only — every valid slug comes from
    // generateStaticParams. An unknown slug must 404 at the router with the
    // real 404 status, never a 200 shell with streamed not-found content
    // (which the CDN would cache for a year under s-maxage=31536000).
    const response = await page.goto("/work/this-slug-was-decided-against");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "This page was decided against.",
    );
  });

  test("home HTML streams in document order (CLS regression guard)", async ({ request }) => {
    // P3-2/P3-3 (ADR-012): a root-level loading boundary splits the stream
    // into shell (header + footer) then content — Chrome paints the partial
    // shell during delivery gaps and the footer jumps ~5400px when content
    // arrives (measured CLS 0.31 on the live deploy). The contract: the
    // prerendered home HTML is ONE shell in document order — page content
    // precedes the footer, and there is no Suspense move-script ($RC) or
    // streamed-segment placeholder (<!--$?-->) left in the document.
    const response = await request.get("/");
    expect(response.status()).toBe(200);
    const html = await response.text();
    // "alder-pine" (first work-card href) marks the page-content region;
    // the H1 text itself is split by an <em> tag in the markup.
    const contentByte = html.indexOf("alder-pine");
    const footerByte = html.indexOf("<footer");
    expect(contentByte).toBeGreaterThan(-1);
    expect(footerByte).toBeGreaterThan(-1);
    expect(footerByte, "footer must stream AFTER the page content").toBeGreaterThan(
      contentByte,
    );
    expect(html).not.toContain("$RC(");
    expect(html).not.toContain("<!--$?-->");
  });

  test("health endpoint reports service identity without caching", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
    expect(response.headers()["cache-control"]).toBe("no-store");
    const body = (await response.json()) as { ok: boolean; service: string; uptimeSeconds: number };
    expect(body.ok).toBe(true);
    expect(body.service).toBe("design-brand-strategy");
    expect(typeof body.uptimeSeconds).toBe("number");
  });

  test("app emits the documented security header contract", async ({ request }) => {
    // The app itself must emit the hardening (next.config.ts headers()), so
    // the contract travels with the deployment without an edge proxy.
    const response = await request.get("/api/health");
    const h = (name: string) => response.headers()[name] ?? "";
    expect(h("x-frame-options")).toBe("DENY");
    expect(h("x-content-type-options")).toBe("nosniff");
    expect(h("referrer-policy")).toBe("strict-origin-when-cross-origin");
    expect(h("permissions-policy")).toContain("camera=()");
    expect(h("permissions-policy")).toContain("microphone=()");
    expect(h("permissions-policy")).toContain("geolocation=()");
    expect(h("strict-transport-security")).toContain("max-age=63072000");
    const csp = h("content-security-policy");
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    // P3-F5: the deployment host (Cloudflare) injects its Web Analytics
    // beacon; the CSP must allow that origin or the beacon 404s against the
    // policy on every page (live console error, analytics dead).
    expect(csp).toContain("script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com");
  });

  test("no axe critical violations on home", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).include("main").analyze();
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical, `critical a11y violations: ${JSON.stringify(critical, null, 2)}`).toEqual([]);
  });

  test("no axe critical violations on contact (form-heavy surface)", async ({ page }) => {
    await page.goto("/contact");
    const results = await new AxeBuilder({ page }).include("main").analyze();
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical, `critical a11y violations: ${JSON.stringify(critical, null, 2)}`).toEqual([]);
  });
});
