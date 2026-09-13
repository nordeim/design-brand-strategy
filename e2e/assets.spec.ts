import { expect, test } from "@playwright/test";

import { getMarqueeItems, PROJECTS } from "../src/data/projects";

/**
 * Asset regression guards — adapted from home-financing/e2e/assets.spec.ts.
 * That spec was born from a production incident (six images 404'd on the
 * deployed site); this adaptation derives the full image inventory from the
 * data layer (covers, case-study detail shots, marquee assembly) so a missing
 * file in public/ fails loudly here instead of shipping.
 *
 * The marquee renders its 24-item sequence twice; detail imagery is shared
 * across case studies, so the union below is the true on-disk contract.
 */

const STATIC_IMAGES = [
  "/images/portrait-main.webp", // home hero portrait
  "/images/portrait-about.webp", // about page portrait
  "/images/workspace.webp", // default OG image + shared detail shot
];

const referencedImages = [
  ...PROJECTS.flatMap((project) => [
    project.cover,
    ...project.details.map((detail) => detail.src),
  ]),
  ...getMarqueeItems()
    .filter((item) => item.kind === "image")
    .map((item) => (item.kind === "image" ? item.src : "")),
  ...STATIC_IMAGES,
];

const uniqueImages = [...new Set(referencedImages)];

test.describe("referenced image assets resolve", () => {
  for (const src of uniqueImages) {
    test(`asset ${src} returns 200`, async ({ request }) => {
      const resp = await request.get(src);
      expect(resp.status(), `${src} must be served`).toBe(200);
      expect(resp.headers()["content-type"]).toContain("image");
    });
  }
});

/** Pages whose broken-image state we assert on (all data-bearing surfaces). */
const RENDERED_PAGES = [
  "/",
  "/work",
  "/work/alder-pine",
  "/work/vantage",
  "/about",
  "/services",
  "/contact",
];

test.describe("pages render no broken images", () => {
  for (const route of RENDERED_PAGES) {
    test(`${route} renders no broken images`, async ({ page }) => {
      await page.goto(route);
      // Give in-viewport images a beat to settle, then any completed image
      // with zero natural width is a genuine 404/decode failure. Lazy-loaded
      // below-fold images are exercised by the 200-asset checks above.
      await page.waitForLoadState("networkidle");
      const broken = await page.evaluate(() =>
        [...document.querySelectorAll("img")]
          .filter((img) => img.complete && img.naturalWidth === 0)
          .map((img) => img.getAttribute("src")),
      );
      expect(broken, `broken imgs on ${route}: ${broken.join(", ")}`).toEqual([]);
    });
  }
});
