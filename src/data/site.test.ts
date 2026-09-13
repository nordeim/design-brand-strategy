import { describe, expect, it } from "vitest";

import { FAQ_ITEMS, PROCESS_STEPS, SITE } from "@/data/site";

describe("PROCESS_STEPS (services page process section)", () => {
  it("documents five numbered steps with the source-parity titles", () => {
    // Pass-2 parity: the source renders five process steps
    // (Discovery → Strategy → Design → Refinement → Delivery).
    expect(PROCESS_STEPS).toHaveLength(5);
    expect(PROCESS_STEPS.map((s) => s.title)).toEqual([
      "Discover",
      "Strategy",
      "Design",
      "Refinement",
      "Delivery",
    ]);
    PROCESS_STEPS.forEach((step, i) => {
      expect(step.number).toBe(String(i + 1).padStart(2, "0"));
      expect(step.title.trim().length).toBeGreaterThan(0);
      expect(step.body.trim().length).toBeGreaterThan(40);
    });
  });
});

describe("FAQ_ITEMS (services page common questions)", () => {
  it("holds at least five substantive, unique questions", () => {
    expect(FAQ_ITEMS.length).toBeGreaterThanOrEqual(5);
    const questions = FAQ_ITEMS.map((f) => f.question);
    expect(new Set(questions).size).toBe(questions.length);
    for (const item of FAQ_ITEMS) {
      expect(item.question.trim().length).toBeGreaterThan(10);
      expect(item.answer.trim().length).toBeGreaterThan(40);
    }
  });
});

describe("SITE.contentUpdatedAt", () => {
  it("is a stable ISO date used for deterministic sitemap stamps", () => {
    expect(SITE.contentUpdatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
