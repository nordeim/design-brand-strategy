import { expect, test, type Page } from "@playwright/test";

/**
 * Investment estimator — the DBS counterpart of home-financing's calculator
 * e2e coverage. The pricing math itself is unit-tested (vitest, 9 cases);
 * these specs pin the WIRING: step machine, radio semantics, the live
 * estimate region, deep-link preselect, and the exact display strings the
 * pure layer produces (formatRange: "$33k – $55k").
 */

const estimateRegion = (page: Page) =>
  page.locator('[aria-live="polite"]').filter({ hasText: "Estimated starting range" });

test.describe("estimator wiring", () => {
  test("renders the four-step shell with priced service options", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByText("Investment estimator")).toBeVisible();
    await expect(page.getByText("What does the project need?")).toBeVisible();
    await expect(page.getByText("Step 1 of 4 — Service")).toBeVisible();
    // Step indicator is a real ordered list with the active step marked.
    await expect(page.getByRole("list", { name: "Estimator steps" })).toBeVisible();
    await expect(page.getByRole("button", { name: "1", exact: true })).toHaveAttribute(
      "aria-current",
      "step",
    );
    // Service options carry their base ranges (compact format, en dash).
    await expect(page.getByRole("radio", { name: /Brand Identity/ })).toContainText(
      "$30k–$50k",
    );
    await expect(page.getByRole("radio", { name: /Art Direction/ })).toContainText("$15k–$30k");
  });

  test("default selection shows the honest starting range $33k – $55k", async ({ page }) => {
    await page.goto("/contact");
    // brand-identity (30–50k) × growing (1) × standard (1.1) × comprehensive (1)
    await expect(estimateRegion(page)).toContainText("$33k – $55k");
    await expect(page.getByRole("radio", { name: /Brand Identity/ })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  test("full walk-through updates the live estimate at every step", async ({ page }) => {
    await page.goto("/contact");

    // Step 1 — Visual Design System ($25k–$45k base).
    await page.getByRole("radio", { name: /Visual Design System/ }).click();
    await expect(page.getByText("Where is the company today?")).toBeVisible();
    await expect(page.getByText("Step 2 of 4 — Company")).toBeVisible();
    // 25–45k × 1 × 1.1 × 1 → $28k – $50k (rounded to $1k).
    await expect(estimateRegion(page)).toContainText("$28k – $50k");

    // Step 2 — Startup (×0.8) → 0.88 multiplier.
    await page.getByRole("radio", { name: "Startup", exact: true }).click();
    await expect(page.getByText("How should the work be paced?")).toBeVisible();
    await expect(estimateRegion(page)).toContainText("$22k – $40k");

    // Step 3 — Flexible (×1.0 replaces the default standard ×1.1) → 0.8 multiplier.
    await page.getByRole("radio", { name: "Flexible", exact: true }).click();
    await expect(page.getByText("How far should the system go?")).toBeVisible();
    await expect(estimateRegion(page)).toContainText("$20k – $36k");

    // Step 4 — Core (×0.8) → 0.64 multiplier: $16k – $29k, and the CTA lands.
    await page.getByRole("radio", { name: "Core", exact: true }).click();
    await expect(estimateRegion(page)).toContainText("$16k – $29k");
    const cta = page.getByRole("link", { name: "Start a project" });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "#contact-form");
    await expect(page.getByText("Step 4 of 4 — Scope")).toBeVisible();
  });

  test("back button revisits earlier steps without losing the running estimate", async ({
    page,
  }) => {
    await page.goto("/contact");
    await page.getByRole("radio", { name: /Visual Design System/ }).click();
    await page.getByRole("radio", { name: "Startup", exact: true }).click();
    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.getByText("Where is the company today?")).toBeVisible();
    // Selection survives: Startup stays checked when re-rendered.
    await expect(page.getByRole("radio", { name: "Startup", exact: true })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  test("step indicator jumps are direct navigation", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("button", { name: "3", exact: true }).click();
    await expect(page.getByText("How should the work be paced?")).toBeVisible();
    await expect(page.getByRole("button", { name: "3", exact: true })).toHaveAttribute(
      "aria-current",
      "step",
    );
  });

  test("?service= deep link preselects the estimator service", async ({ page }) => {
    await page.goto(`/contact?service=art-direction`);
    await expect(page.getByRole("radio", { name: /Art Direction/ })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    // 15–30k × 1 × 1.1 × 1 → $17k – $33k (16.5k rounds to 17k).
    await expect(estimateRegion(page)).toContainText("$17k – $33k");
  });

  test("an invalid ?service= value falls back to the default", async ({ page }) => {
    await page.goto(`/contact?service=nonexistent-service`);
    await expect(page.getByRole("radio", { name: /Brand Identity/ })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await expect(estimateRegion(page)).toContainText("$33k – $55k");
  });

  test("services page deep-links each estimable practice into the estimator", async ({ page }) => {
    // SERVICES with an estimatorId link to /contact?service=<id> (six
    // catalogue entries, four of them estimable).
    await page.goto("/services");
    const links = page.locator("a[href^='/contact?service=']");
    await expect(links).toHaveCount(4);
    await expect(links.first()).toHaveAttribute("href", "/contact?service=brand-identity#estimator");
    await expect(page.getByRole("link", { name: "Get an estimate" }).first()).toBeVisible();
  });
});
