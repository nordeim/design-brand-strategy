import { expect, test, type Page } from "@playwright/test";

/**
 * Mobile viewport — runs only in the "mobile" project (Pixel 7 emulation,
 * see playwright.config.ts). The desktop nav (md:flex) collapses to a
 * hamburger overlay below the md breakpoint; these specs pin that fork:
 * overlay nav, body scroll lock, Escape handling, and menu-close-on-nav
 * (the set-state-in-effect fix from the original build review).
 *
 * NOTE on locators: the hamburger's accessible name flips with state
 * ("Open menu" ↔ "Close menu") and the overlay links carry index suffixes
 * ("Work 01"), so these specs use structural locators (aria-controls /
 * href) that are stable across states.
 */

const toggle = (page: Page) => page.locator("button[aria-controls='mobile-menu']");

test.describe("mobile navigation", () => {
  test("hamburger opens the overlay nav with all four destinations", async ({ page }) => {
    await page.goto("/");
    // Desktop nav is hidden below md; the toggle is the way in.
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeHidden();
    await expect(toggle(page)).toBeVisible();
    await expect(toggle(page)).toHaveAttribute("aria-expanded", "false");
    await expect(toggle(page)).toHaveAttribute("aria-label", "Open menu");
    await toggle(page).click();
    const menu = page.getByRole("navigation", { name: "Primary mobile" });
    await expect(menu).toBeVisible();
    await expect(toggle(page)).toHaveAttribute("aria-expanded", "true");
    await expect(toggle(page)).toHaveAttribute("aria-label", "Close menu");
    for (const href of ["/work", "/about", "/services", "/contact"]) {
      await expect(menu.locator(`a[href='${href}']`)).toBeVisible();
    }
    // The overlay carries the studio status line.
    await expect(menu.getByText("New York, NY — Booking select projects for 2026")).toBeVisible();
  });

  test("body scroll is locked while the menu is open and released on close", async ({ page }) => {
    await page.goto("/");
    await toggle(page).click();
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
    await toggle(page).click();
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  });

  test("navigating from the menu closes it (no set-state-in-effect regression)", async ({
    page,
  }) => {
    await page.goto("/");
    await toggle(page).click();
    const menu = page.getByRole("navigation", { name: "Primary mobile" });
    await menu.locator("a[href='/work']").click();
    await expect(page).toHaveURL(/\/work$/);
    await expect(menu).toBeHidden();
    await expect(toggle(page)).toHaveAttribute("aria-expanded", "false");
    await expect(toggle(page)).toHaveAttribute("aria-label", "Open menu");
  });

  test("Escape closes the menu and returns focus to the toggle", async ({ page }) => {
    await page.goto("/");
    await toggle(page).click();
    // Focus was moved into the menu when it opened.
    const firstLink = page
      .getByRole("navigation", { name: "Primary mobile" })
      .locator("a[href='/work']");
    await expect(firstLink).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("navigation", { name: "Primary mobile" })).toBeHidden();
    await expect(toggle(page)).toBeFocused();
  });

  test("hero and marquee still render at mobile width", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Studio imagery and practice areas" }),
    ).toBeVisible();
    // Portrait hero keeps its 4/5 aspect at small widths.
    const ratio = await page
      .getByAltText("Studio portrait of Elena Vance against a warm cream backdrop")
      .evaluate((img) => {
        const [a, b = "1"] = getComputedStyle(img).aspectRatio.split("/").map((p) => p.trim());
        return Number(a) / Number(b);
      });
    expect(ratio).toBeCloseTo(4 / 5, 2);
  });
});
