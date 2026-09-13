import { expect, test } from "@playwright/test";

import { PROJECTS } from "../src/data/projects";
import { SITE } from "../src/data/site";

/**
 * SEO surfaces — sitemap.xml / robots.txt / per-route metadata, pinned to the
 * data layer (src/data). Adapted from home-financing/e2e/seo.spec.ts: the
 * sitemap derives from PROJECTS (8 case studies) instead of seeded DB rows,
 * so these guards are fully deterministic. NEXT_PUBLIC_SITE_URL defaults to
 * http://localhost:3000 when unset, so locs are rewritten to the served
 * origin before resolution checks (mirrors the reference approach).
 */

const SERVED_ORIGIN = new URL(
  process.env.E2E_BASE_URL ?? `http://127.0.0.1:${process.env.E2E_PORT ?? 3002}`,
).origin;

const STATIC_PATHS = ["/", "/work", "/about", "/services", "/contact"];

test.describe("sitemap.xml", () => {
  test("serves XML with all 13 URLs and absolute locs", async ({ request }) => {
    const resp = await request.get("/sitemap.xml");
    expect(resp.status()).toBe(200);
    const body = await resp.text();
    expect(body).toContain("<urlset");
    const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1] ?? "");
    // 5 static pages + 8 case studies, in catalog order.
    expect(locs).toHaveLength(STATIC_PATHS.length + PROJECTS.length);
    for (const path of STATIC_PATHS) {
      expect(locs.some((loc) => loc.endsWith(path === "/" ? "/" : path))).toBe(true);
    }
    for (const project of PROJECTS) {
      expect(locs.some((loc) => loc.endsWith(`/work/${project.slug}`))).toBe(true);
    }
    // Every loc is absolute (NEXT_PUBLIC_SITE_URL / metadataBase contract).
    expect(locs.every((loc) => /^https?:\/\//.test(loc))).toBe(true);
    // The deterministic content-revision stamp, not build time.
    expect(body).toContain(SITE.contentUpdatedAt);
  });

  test("every listed URL resolves (no 404 in sitemap)", async ({ request }) => {
    const body = await (await request.get("/sitemap.xml")).text();
    const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1] ?? "");
    expect(locs.length).toBeGreaterThan(5);
    const broken: string[] = [];
    for (const loc of locs) {
      const localUrl = loc.replace(/^https?:\/\/[^/]+/, SERVED_ORIGIN);
      const resp = await request.get(localUrl);
      if (resp.status() !== 200) broken.push(`${loc} → ${resp.status()}`);
    }
    expect(broken, "sitemap URLs returning non-200").toEqual([]);
  });
});

test.describe("robots.txt", () => {
  test("allows crawl, disallows /api/, and references the sitemap", async ({ request }) => {
    const resp = await request.get("/robots.txt");
    expect(resp.status()).toBe(200);
    const body = await resp.text();
    expect(body).toMatch(/user-agent:\s*\*/i);
    expect(body).toMatch(/allow:\s*\//i);
    expect(body).toMatch(/disallow:\s*\/api\//i);
    expect(body).toMatch(/sitemap:/i);
    expect(body).toContain("/sitemap.xml");
  });
});

test.describe("metadata", () => {
  test("home title and description carry the persona", async ({ page }) => {
    await page.goto("/");
    const title = await page.title();
    expect(title).toBe(`${SITE.name} — ${SITE.role}`);
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute("content", SITE.description);
  });

  test("home declares Open Graph and Twitter card metadata", async ({ request }) => {
    const resp = await request.get("/");
    expect(resp.status()).toBe(200);
    const html = await resp.text();
    expect(html).toContain('property="og:title"');
    expect(html).toContain('property="og:image"');
    expect(html).toContain("/images/workspace.webp");
    // metadataBase resolves OG images to absolute URLs.
    expect(html).toMatch(/property="og:image"[^>]*content="https?:\/\//);
    expect(html).toContain('name="twitter:card"');
    expect(html).toContain("summary_large_image");
  });

  // Exact title pins — the layout template is `%s — ${SITE.name}`.
  test("route titles follow the layout template", async ({ page }) => {
    const cases: Array<[string, string]> = [
      ["/work", `Work — ${SITE.name}`],
      ["/about", `About — ${SITE.name}`],
      ["/services", `Services — ${SITE.name}`],
      ["/contact", `Contact — ${SITE.name}`],
      ["/work/alder-pine", "Alder & Pine — Elena Vance"],
      ["/work/solace", "Solace — Elena Vance"],
    ];
    for (const [route, expected] of cases) {
      await page.goto(route);
      expect(await page.title()).toBe(expected);
    }
  });

  test("case studies carry per-project OG images (not the shared default)", async ({ request }) => {
    // Guards the K-8 remediation: each case study advertises its own cover.
    const alder = await (await request.get("/work/alder-pine")).text();
    expect(alder).toContain('property="og:image"');
    expect(alder).toContain("/images/alder-pine-cover.webp");
    expect(alder).toContain("Alder &amp; Pine — case study");

    const solace = await (await request.get("/work/solace")).text();
    expect(solace).toContain("/images/solace-portrait.webp");
  });

  test("favicon route resolves", async ({ request }) => {
    const resp = await request.get("/icon.svg");
    expect(resp.status()).toBe(200);
    expect(resp.headers()["content-type"]).toContain("svg");
  });
});
