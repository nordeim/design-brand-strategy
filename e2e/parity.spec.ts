import { expect, test } from "@playwright/test";

import { PROJECTS } from "../src/data/projects";

/**
 * Regression guards for the 2026-09-13 remediation pass — the DBS
 * counterpart of home-financing/e2e/parity.spec.ts. Each describe pins one
 * fix so a regression is named, not mysterious:
 *
 *  - K-1  no-JS reveal guards   (html:not(.js) + scripting:none)
 *  - V-1/V-2 mixed-aspect grid  (alternating 8/5 and 3/4 covers)
 *  - V-3  marquee motion contract (56s loop, 2×24 items, reduced-motion off)
 *  - a11y skip link + theme persistence (no-flash boot script)
 */

test.describe("no-JS reveal safety (K-1)", () => {
  // The whole point of the dual guard: with scripting disabled the inline
  // boot script never adds `.js`, so html:not(.js) [data-reveal] forces all
  // content visible. A regression here traps real content at opacity 0.
  //
  // NOTE: Playwright's locator engine cannot inject its utility script when
  // page JavaScript is disabled (getByRole / toBeVisible do not resolve), so
  // these specs assert through page.evaluate — CDP evaluation still runs —
  // which is also how we read computed opacity, the exact signal the K-1
  // guard controls.
  test.use({ javaScriptEnabled: false });

  test("home renders hero, marquee, and featured projects fully visible", async ({ page }) => {
    await page.goto("/");
    const state = await page.evaluate(() => ({
      hasJsClass: document.documentElement.classList.contains("js"),
      h1: document.querySelector("h1")?.textContent?.trim() ?? null,
      hiddenReveals: [...document.querySelectorAll("[data-reveal]")].filter(
        (el) => getComputedStyle(el).opacity === "0",
      ).length,
      totalReveals: document.querySelectorAll("[data-reveal]").length,
      marqueeItems: document.querySelectorAll(".animate-marquee > div").length,
      h3Titles: [...document.querySelectorAll("h3")].map((h) => h.textContent?.trim() ?? ""),
    }));
    expect(state.hasJsClass).toBe(false);
    expect(state.h1).toContain("Brands built on intention and clarity.");
    // THE guard: zero reveal wrappers may sit at opacity 0 without JS.
    expect(state.totalReveals).toBeGreaterThan(0);
    expect(state.hiddenReveals).toBe(0);
    expect(state.marqueeItems).toBe(48);
    for (const project of PROJECTS.filter((p) => p.featured)) {
      expect(state.h3Titles).toContain(project.title);
    }
  });

  test("work index and a case study render without scripting", async ({ page }) => {
    await page.goto("/work");
    const work = await page.evaluate(() => ({
      hiddenReveals: [...document.querySelectorAll("[data-reveal]")].filter(
        (el) => getComputedStyle(el).opacity === "0",
      ).length,
      coverCount: document.querySelectorAll("a[href^='/work/'] img").length,
    }));
    expect(work.coverCount).toBe(8);
    expect(work.hiddenReveals).toBe(0);

    await page.goto("/work/alder-pine");
    const study = await page.evaluate(() => ({
      h1: document.querySelector("h1")?.textContent?.trim() ?? null,
      h2s: [...document.querySelectorAll("h2")].map((h) => h.textContent?.trim() ?? ""),
      hiddenReveals: [...document.querySelectorAll("[data-reveal]")].filter(
        (el) => getComputedStyle(el).opacity === "0",
      ).length,
    }));
    expect(study.h1).toBe("Alder & Pine");
    expect(study.h2s).toContain("The challenge");
    expect(study.h2s).toContain("The approach");
    expect(study.hiddenReveals).toBe(0);
  });

  test("contact form and estimator render as plain HTML", async ({ page }) => {
    await page.goto("/contact");
    const state = await page.evaluate(() => ({
      radios: document.querySelectorAll("[role='radio']").length,
      checkedService: [...document.querySelectorAll("[role='radio']")]
        .find((el) => el.getAttribute("aria-checked") === "true")
        ?.textContent?.trim() ?? null,
      nameField: document.querySelector("#name") !== null,
      messageField: document.querySelector("#message") !== null,
      hiddenReveals: [...document.querySelectorAll("[data-reveal]")].filter(
        (el) => getComputedStyle(el).opacity === "0",
      ).length,
    }));
    expect(state.radios).toBe(4);
    expect(state.checkedService).toContain("Brand Identity");
    expect(state.nameField).toBe(true);
    expect(state.messageField).toBe(true);
    expect(state.hiddenReveals).toBe(0);
  });
});

test.describe("skip link (a11y hardening)", () => {
  test("skip link is keyboard-reachable and becomes visible on focus", async ({ page }) => {
    await page.goto("/");
    const skip = page.locator('a[href="#main-content"]');
    await expect(skip).toHaveCount(1);
    // Hidden from pointer users via sr-only: effectively a 1px clipped box.
    const hiddenBox = await skip.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    expect(hiddenBox.width).toBeLessThanOrEqual(1);
    // Real keyboard focus (not programmatic) so :focus-visible applies.
    await page.keyboard.press("Tab");
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await expect(skip).toHaveText("Skip to main content");
    // Focus lands above the header (z-[60] overlay, real dimensions).
    const box = await skip.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(50);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y).toBeLessThan(120);
  });
});

test.describe("mixed-aspect editorial grid (V-1/V-2)", () => {
  test("work index alternates 8/5 and 3/4 cover aspects in catalog order", async ({ page }) => {
    await page.goto("/work");
    const ratios = await page.locator("a[href^='/work/'] img").evaluateAll((imgs) =>
      imgs.map((img) => {
        const value = getComputedStyle(img).aspectRatio;
        // Computed form is "a / b" (or "auto" when unset).
        const [a, b = "1"] = value.split("/").map((part) => part.trim());
        return a === "auto" ? 0 : Number(a) / Number(b);
      }),
    );
    expect(ratios).toHaveLength(PROJECTS.length);
    PROJECTS.forEach((project, i) => {
      const expected = project.coverAspect === "landscape" ? 8 / 5 : 3 / 4;
      expect(
        ratios[i],
        `${project.slug} (${project.coverAspect}) at index ${i}: ${ratios[i]}`,
      ).toBeCloseTo(expected, 2);
    });
    // And the rhythm genuinely alternates (the source site's signature).
    expect(new Set(ratios.map((r) => r.toFixed(2))).size).toBe(2);
  });

  test("home marquee is a mixed-shape gallery, not a row of clones", async ({ page }) => {
    await page.goto("/");
    const heights = await page
      .locator("[aria-label='Studio imagery and practice areas'] > div > div")
      .evaluateAll((nodes) =>
        nodes.slice(0, 24).map((node) => parseFloat(getComputedStyle(node.firstElementChild as HTMLElement).height)),
      );
    // tall(236px) / wide(180px) / landscape(148px) / tile(176px) mix.
    const distinct = new Set(heights);
    expect(distinct.size).toBeGreaterThanOrEqual(3);
  });
});

test.describe("marquee motion contract (V-3)", () => {
  test("track animates: 56s marquee loop, doubled sequence, hidden duplicate", async ({ page }) => {
    await page.goto("/");
    const track = page.locator(".animate-marquee");
    await expect(track).toHaveCount(1);
    const style = await track.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { name: cs.animationName, duration: cs.animationDuration, iterations: cs.animationIterationCount };
    });
    expect(style.name).toBe("marquee");
    expect(style.duration).toBe("56s");
    expect(style.iterations).toBe("infinite");
    // The sequence renders twice for the seamless -50% loop.
    const items = page.locator(".animate-marquee > div");
    await expect(items).toHaveCount(48);
    // Second half is aria-hidden (screen readers hear one sequence only).
    const hidden = await items.evaluateAll((nodes) =>
      nodes.slice(24).map((node) => node.getAttribute("aria-hidden")),
    );
    expect(hidden.every((v) => v === "true")).toBe(true);
  });

  test("reduced motion disables the marquee and keeps reveals visible", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const track = page.locator(".animate-marquee");
    const animationName = await track.evaluate((el) => getComputedStyle(el).animationName);
    expect(animationName).toBe("none");
    // Reveal wrappers are forced visible — content is never trapped.
    const revealOpacity = await page
      .locator("[data-reveal]")
      .first()
      .evaluate((el) => getComputedStyle(el).opacity);
    expect(revealOpacity).toBe("1");
  });
});

test.describe("theme toggle and no-flash persistence", () => {
  test("toggle flips the dark class, stores intent, and syncs the pressed state", async ({
    page,
  }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).not.toHaveClass(/dark/);
    const toggle = page.getByRole("button", { name: "Switch to dark mode" });
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await toggle.click();
    await expect(html).toHaveClass(/dark/);
    await expect(page.getByRole("button", { name: "Switch to light mode" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("dark");
  });

  test("stored theme is applied before first paint (no flash of wrong scheme)", async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem("theme", "dark"));
    // domcontentloaded: the inline boot script has run, React may not have.
    await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(await page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(
      true,
    );
    // And the js marker (no-JS guard switch) is present on scripted visits.
    expect(await page.evaluate(() => document.documentElement.classList.contains("js"))).toBe(true);
  });

  test("dark mode restyles the palette tokens", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("theme", "dark"));
    await page.goto("/");
    const bg = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    );
    // Dark background is near-black (light mode is cream ~hsl(45,20%,98%)).
    const [r, g, b] = bg.match(/\d+/g)!.map(Number);
    expect(r + g + b).toBeLessThan(120);
  });
});

test.describe("focus visibility on interactive elements", () => {
  test("keyboard Tab reaches the skip link with a visible focus ring", async ({ page }) => {
    await page.goto("/");
    // Real keyboard focus (not programmatic) so :focus-visible applies.
    await page.keyboard.press("Tab");
    const skip = page.locator('a[href="#main-content"]');
    await expect(skip).toBeFocused();
    const style = await skip.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { width: cs.outlineWidth, style: cs.outlineStyle };
    });
    expect(style.width !== "0px" || style.style !== "none").toBe(true);
  });
});
