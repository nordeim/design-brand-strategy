import { expect, test } from "@playwright/test";

/**
 * Contact funnel + API contract — the DBS counterpart of
 * home-financing/e2e/funnel.spec.ts. The API is stateless (no persistence by
 * design), so instead of DB assertions we pin the validation contract, the
 * JSON-always discipline (400/429/202), and the in-memory rate limiter
 * (5 per 10 min per client key). Per-test spoofed `x-forwarded-for` values
 * keep the shared server state isolated.
 */

const VALID_PAYLOAD = {
  name: "Jordan Lee",
  email: "jordan@example.com",
  company: "Northbeam Studio",
  projectType: "brand-identity",
  budget: "25-50k",
  message: "We are repositioning our studio and need a full identity in Q2.",
  referral: "A colleague",
};

test.describe("contact API contract", () => {
  test("POST /api/contact accepts a valid inquiry with 202", async ({ request }) => {
    const resp = await request.post("/api/contact", {
      data: VALID_PAYLOAD,
      headers: { "x-forwarded-for": `valid-${Date.now()}` },
    });
    expect(resp.status()).toBe(202);
    expect(resp.headers()["content-type"]).toContain("application/json");
    const body = (await resp.json()) as { ok: boolean; message: string };
    expect(body.ok).toBe(true);
    expect(body.message).toContain("two business days");
  });

  test("malformed JSON body is rejected with 400 and a message", async ({ request }) => {
    const resp = await request.post("/api/contact", {
      data: "{not-json",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `malformed-${Date.now()}`,
      },
    });
    expect(resp.status()).toBe(400);
    expect(resp.headers()["content-type"]).toContain("application/json");
    const body = (await resp.json()) as { ok: boolean; message: string };
    expect(body.ok).toBe(false);
    expect(body.message).toBe("Malformed request body.");
  });

  test("invalid payload returns 400 with per-field errors", async ({ request }) => {
    const resp = await request.post("/api/contact", {
      data: {
        name: "x",
        email: "not-an-email",
        projectType: "",
        budget: "",
        message: "too short",
      },
      headers: { "x-forwarded-for": `invalid-${Date.now()}` },
    });
    expect(resp.status()).toBe(400);
    const body = (await resp.json()) as { ok: boolean; errors: Record<string, string> };
    expect(body.ok).toBe(false);
    // Every violated field is reported — the client form renders these inline.
    expect(body.errors.name).toBe("Please share your name.");
    expect(body.errors.email).toBe("Please share a valid email address.");
    expect(body.errors.projectType).toBe("Please choose a project type.");
    expect(body.errors.budget).toBe("Please choose a budget range.");
    expect(body.errors.message).toBe(
      "A sentence or two about the project helps me respond well.",
    );
  });

  test("burst over the limit trips 429 with Retry-After, always JSON", async ({ request }) => {
    // 5 requests per 10-minute window per client key; the 6th must be limited.
    const burstIp = `burst-${Date.now()}`;
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) {
      const resp = await request.post("/api/contact", {
        data: VALID_PAYLOAD,
        headers: { "x-forwarded-for": burstIp },
      });
      statuses.push(resp.status());
    }
    expect(statuses).toEqual([202, 202, 202, 202, 202, 429]);

    const limited = await request.post("/api/contact", {
      data: VALID_PAYLOAD,
      headers: { "x-forwarded-for": burstIp },
    });
    expect(limited.status()).toBe(429);
    expect(limited.headers()["content-type"]).toContain("application/json");
    expect(limited.headers()["retry-after"]).toBe("600");
    const body = (await limited.json()) as { ok: boolean; message: string };
    expect(body.ok).toBe(false);
    expect(body.message).toContain("Too many inquiries");
  });

  test("client keys are isolated — a fresh IP is not limited by another's burst", async ({
    request,
  }) => {
    const burned = `burned-${Date.now()}`;
    for (let i = 0; i < 6; i++) {
      await request.post("/api/contact", {
        data: VALID_PAYLOAD,
        headers: { "x-forwarded-for": burned },
      });
    }
    const fresh = await request.post("/api/contact", {
      data: VALID_PAYLOAD,
      headers: { "x-forwarded-for": `fresh-${Date.now()}` },
    });
    expect(fresh.status()).toBe(202);
  });
});

test.describe("contact form UI", () => {
  test("every field is label-wired and the honeypot is hidden", async ({ page }) => {
    await page.goto("/contact");
    for (const label of [
      "Name",
      "Email",
      "Company",
      "Project type",
      "Budget",
      "About the project",
      "How did you find me?",
    ]) {
      await expect(page.getByLabel(label)).toBeAttached();
    }
    // Selects must be real comboboxes wired to their labels (C-3 remediation).
    await expect(page.getByLabel("Project type")).toHaveRole("combobox");
    await expect(page.getByLabel("Budget")).toHaveRole("combobox");
    // Honeypot is positioned far off-screen and excluded from the tab order
    // (Playwright treats off-screen elements as "visible", so assert the
    // actual hiding mechanism: the -9999px offset).
    const honeypot = page.locator("#website");
    await expect(honeypot).toBeAttached();
    const honeypotBox = await honeypot.boundingBox();
    expect(honeypotBox).not.toBeNull();
    expect(honeypotBox!.x).toBeLessThan(-9000);
    await expect(honeypot).toHaveAttribute("tabindex", "-1");
  });

  test("empty submit shows inline errors for all five required fields", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("button", { name: "Send inquiry" }).click();
    await expect(page.getByText("Please share your name.")).toBeVisible();
    await expect(page.getByText("Please share a valid email address.")).toBeVisible();
    await expect(page.getByText("Please choose a project type.")).toBeVisible();
    await expect(page.getByText("Please choose a budget range.")).toBeVisible();
    await expect(
      page.getByText("A sentence or two about the project helps me respond well."),
    ).toBeVisible();
    // Invalid fields announce themselves to assistive tech.
    await expect(page.locator("#name")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#email")).toHaveAttribute("aria-invalid", "true");
  });

  test("valid submit reaches the API and renders the success state", async ({ page }) => {
    await page.goto("/contact");
    await page.getByLabel("Name").fill("Jordan Lee");
    await page.getByLabel("Email").fill(`jordan-${Date.now()}@example.com`);
    await page.getByLabel("Company").fill("Northbeam Studio");
    await page.getByLabel("Project type").selectOption("brand-identity");
    await page.getByLabel("Budget").selectOption("25-50k");
    await page
      .getByLabel("About the project")
      .fill("We are repositioning our studio and need a full identity in Q2.");
    await page.getByRole("button", { name: "Send inquiry" }).click();
    const status = page.getByRole("status");
    await expect(status).toBeVisible();
    await expect(status).toContainText("Thank you — it landed.");
    await expect(status).toContainText("reply within two business days");
  });

  test("honeypot swallow: a filled website field never reaches the API", async ({ page }) => {
    let apiCalls = 0;
    await page.route("**/api/contact", (route) => {
      apiCalls += 1;
      return route.fulfill({ status: 202, contentType: "application/json", body: "{}" });
    });
    await page.goto("/contact");
    await page.getByLabel("Name").fill("Bot Botsworth");
    await page.getByLabel("Email").fill("bot@example.com");
    await page.getByLabel("Project type").selectOption("other");
    await page.getByLabel("Budget").selectOption("not-sure");
    await page
      .getByLabel("About the project")
      .fill("Automated filler text long enough to pass validation.");
    await page.locator("#website").fill("http://spam.example");
    await page.getByRole("button", { name: "Send inquiry" }).click();
    // Silently accepted, but no submission was created.
    await expect(page.getByRole("status")).toContainText("Thank you — it landed.");
    expect(apiCalls, "honeypot submissions must not hit the API").toBe(0);
  });

  test("a 429 response surfaces the rate-limit message inline", async ({ page }) => {
    await page.route("**/api/contact", (route) =>
      route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({
          ok: false,
          message: "Too many inquiries — please try again in a little while.",
        }),
      }),
    );
    await page.goto("/contact");
    await page.getByLabel("Name").fill("Jordan Lee");
    await page.getByLabel("Email").fill("jordan@example.com");
    await page.getByLabel("Project type").selectOption("art-direction");
    await page.getByLabel("Budget").selectOption("50-100k");
    await page
      .getByLabel("About the project")
      .fill("Campaign art direction retainer starting next quarter.");
    await page.getByRole("button", { name: "Send inquiry" }).click();
    // Scoped: Next.js also mounts a route announcer with role="alert".
    await expect(page.locator('form [role="alert"]')).toContainText(
      "a few too many inquiries",
    );
  });
});
