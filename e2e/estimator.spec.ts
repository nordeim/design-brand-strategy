import { expect, test, type Page } from "@playwright/test";

/**
 * Investment estimator — static four-group form (pass-2 parity redesign).
 * The source site renders ALL groups simultaneously (1 Project type /
 * 2 Business stage / 3 Timeline / 4 Deliverables) and gates the estimate
 * until every group has a selection. The pricing math itself is unit-tested
 * (vitest); these specs pin the static wiring: group visibility, radio
 * semantics, gated estimate, label parity (durations, "Core Essentials"),
 * and the deep-link preselect.
 */

const estimateRegion = (page: Page) =>
  page.locator('[aria-live="polite"]').filter({ hasText: /estimate/i });

test.describe("estimator static form", () => {
  test("renders all four numbered groups with all fifteen options visible", async ({ page }) => {
    await page.goto("/contact");
    for (const group of ["Project type", "Business stage", "Timeline", "Deliverables"]) {
      await expect(page.getByRole("radiogroup", { name: group })).toBeVisible();
    }
    // Every option is on the page at once — no step machine.
    await expect(page.getByRole("radio")).toHaveCount(15);
    // Timeline labels carry durations (source parity).
    await expect(page.getByRole("radio", { name: /Flexible \(12\+ weeks\)/ })).toBeVisible();
    await expect(page.getByRole("radio", { name: /Rush \(under 6 weeks\)/ })).toBeVisible();
    // Scope label parity.
    await expect(page.getByRole("radio", { name: "Core Essentials" })).toBeVisible();
  });

  test("estimate is gated until all four groups are selected", async ({ page }) => {
    await page.goto("/contact");
    // Nothing selected: the gate copy shows, no range, no CTA.
    await expect(estimateRegion(page)).toContainText(
      "Complete all selections to see your personalized estimate.",
    );
    await expect(page.getByRole("link", { name: "Start a project" })).toHaveCount(0);

    // One selection is not enough.
    await page.getByRole("radio", { name: /Brand Identity/ }).click();
    await expect(estimateRegion(page)).toContainText(
      "Complete all selections to see your personalized estimate.",
    );
    await page.getByRole("radio", { name: "Growing", exact: true }).click();
    await page.getByRole("radio", { name: /Standard \(8-12 weeks\)/ }).click();
    await expect(estimateRegion(page)).toContainText(
      "Complete all selections to see your personalized estimate.",
    );

    // All four: the range appears — 30–50k × 1 × 1.1 × 1 → $33k – $55k.
    await page.getByRole("radio", { name: "Comprehensive", exact: true }).click();
    await expect(estimateRegion(page)).toContainText("$33k – $55k");
    await expect(page.getByRole("link", { name: "Start a project" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Start a project" })).toHaveAttribute(
      "href",
      "#contact-form",
    );
  });

  test("changing an earlier selection updates the revealed estimate", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("radio", { name: /Brand Identity/ }).click();
    await page.getByRole("radio", { name: "Growing", exact: true }).click();
    await page.getByRole("radio", { name: /Standard \(8-12 weeks\)/ }).click();
    await page.getByRole("radio", { name: "Comprehensive", exact: true }).click();
    await expect(estimateRegion(page)).toContainText("$33k – $55k");
    // Switch service: 25–45k × 1 × 1.1 × 1 → $28k – $50k.
    await page.getByRole("radio", { name: /Visual Design System/ }).click();
    await expect(estimateRegion(page)).toContainText("$28k – $50k");
    // Switch stage to Startup (×0.8): 0.88 multiplier → $22k – $40k.
    await page.getByRole("radio", { name: "Startup", exact: true }).click();
    await expect(estimateRegion(page)).toContainText("$22k – $40k");
    // Switch scope to Core Essentials (×0.8): 0.8 × 1.1 × 0.8 = 0.704 → $18k – $32k.
    await page.getByRole("radio", { name: "Core Essentials" }).click();
    await expect(estimateRegion(page)).toContainText("$18k – $32k");
  });

  test("selections render checked state per group", async ({ page }) => {
    await page.goto("/contact");
    const service = page.getByRole("radio", { name: /Art Direction/ });
    await expect(service).toHaveAttribute("aria-checked", "false");
    await service.click();
    await expect(service).toHaveAttribute("aria-checked", "true");
    // Other groups remain unchecked.
    await expect(page.getByRole("radio", { name: "Enterprise", exact: true })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  test("?service= deep link preselects the service group only", async ({ page }) => {
    await page.goto("/contact?service=art-direction");
    await expect(page.getByRole("radio", { name: /Art Direction/ })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    // Still incomplete: the estimate stays gated.
    await expect(estimateRegion(page)).toContainText(
      "Complete all selections to see your personalized estimate.",
    );
  });

  test("an invalid ?service= value preselects nothing", async ({ page }) => {
    await page.goto("/contact?service=nonexistent-service");
    const checked = await page.getByRole("radio").evaluateAll((radios) =>
      radios.filter((r) => r.getAttribute("aria-checked") === "true").length,
    );
    expect(checked).toBe(0);
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
