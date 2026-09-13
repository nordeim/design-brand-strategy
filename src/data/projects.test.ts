import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { FEATURED_PROJECTS, getMarqueeItems, PROJECTS } from "@/data/projects";

const COVER_ASPECTS = ["landscape", "portrait"] as const;
const DETAIL_ASPECTS = ["wide", "landscape", "portrait"] as const;

describe("PROJECTS cover aspect contract (mixed editorial rhythm)", () => {
  it("every project declares a valid coverAspect", () => {
    for (const project of PROJECTS) {
      expect(COVER_ASPECTS, project.slug).toContain(project.coverAspect);
    }
  });

  it("cover aspects strictly alternate landscape/portrait in list order", () => {
    PROJECTS.forEach((project, i) => {
      expect(project.coverAspect, project.slug).toBe(i % 2 === 0 ? "landscape" : "portrait");
    });
  });

  it("the set is balanced: four landscape and four portrait covers", () => {
    const landscape = PROJECTS.filter((p) => p.coverAspect === "landscape").length;
    expect(landscape).toBe(4);
    expect(PROJECTS.length - landscape).toBe(4);
  });

  it("keeps exactly four featured projects", () => {
    expect(FEATURED_PROJECTS.length).toBe(4);
  });
});

describe("PROJECTS detail aspect contract", () => {
  it("every detail declares a valid aspect", () => {
    for (const project of PROJECTS) {
      for (const detail of project.details) {
        expect(DETAIL_ASPECTS, `${project.slug} ${detail.src}`).toContain(detail.aspect);
      }
    }
  });

  it("the first detail of every case study is the wide banner", () => {
    for (const project of PROJECTS) {
      expect(project.details[0]?.aspect, project.slug).toBe("wide");
    }
  });

  it("featured cases pair the wide banner with a portrait detail; others keep landscape", () => {
    for (const project of PROJECTS) {
      const second = project.details[1]?.aspect;
      expect(second, project.slug).toBe(project.featured ? "portrait" : "landscape");
    }
  });
});

describe("referenced imagery integrity", () => {
  it("every cover and detail src resolves to a file under public/", () => {
    const paths = [
      ...PROJECTS.map((p) => p.cover),
      ...PROJECTS.flatMap((p) => p.details.map((d) => d.src)),
    ];
    for (const rel of paths) {
      expect(rel.startsWith("/images/"), rel).toBe(true);
      expect(existsSync(resolve("public", rel.slice(1))), `missing file: ${rel}`).toBe(true);
    }
  });

  it("portrait artwork follows the -portrait naming contract", () => {
    for (const project of PROJECTS) {
      if (project.coverAspect === "portrait") {
        expect(project.cover, project.slug).toContain("portrait");
      }
      if (project.featured) {
        expect(project.details[1]?.src, project.slug).toContain("portrait");
      }
    }
  });
});

describe("marquee assembly", () => {
  it("returns exactly 24 items", () => {
    expect(getMarqueeItems().length).toBe(24);
  });

  it("image items carry at least three distinct shapes (mixed gallery rhythm)", () => {
    const shapes = new Set(
      getMarqueeItems().flatMap((item) => (item.kind === "image" ? [item.shape] : [])),
    );
    expect(shapes.size).toBeGreaterThanOrEqual(3);
  });

  it("every image item declares a valid shape", () => {
    for (const item of getMarqueeItems()) {
      if (item.kind === "image") {
        expect(["tall", "wide", "landscape"], item.src).toContain(item.shape);
      }
    }
  });

  it("every project cover appears in the strip", () => {
    const srcs = new Set(getMarqueeItems().flatMap((i) => (i.kind === "image" ? [i.src] : [])));
    for (const project of PROJECTS) {
      expect(srcs.has(project.cover), project.slug).toBe(true);
    }
  });
});
