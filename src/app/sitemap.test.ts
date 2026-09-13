import { describe, expect, it } from "vitest";

import sitemap from "@/app/sitemap";
import { PROJECTS } from "@/data/projects";
import { SITE } from "@/data/site";

describe("sitemap()", () => {
  const entries = sitemap();

  it("covers all five static pages and every case study", () => {
    expect(entries).toHaveLength(5 + PROJECTS.length);
    const urls = entries.map((entry) => entry.url);
    for (const page of ["/", "/work", "/about", "/services", "/contact"]) {
      expect(urls).toContain(`${SITE.url}${page}`);
    }
    for (const project of PROJECTS) {
      expect(urls).toContain(`${SITE.url}/work/${project.slug}`);
    }
  });

  it("stamps the deterministic content date, not the build time", () => {
    const expected = new Date(SITE.contentUpdatedAt);
    for (const entry of entries) {
      expect(entry.lastModified, entry.url).toEqual(expected);
    }
  });

  it("never exposes the API routes", () => {
    expect(entries.some((entry) => entry.url.includes("/api/"))).toBe(false);
  });
});
