import { describe, expect, it } from "vitest";

import {
  ESTIMATOR_SERVICES,
  COMPANY_STAGES,
  TIMELINES,
  SCOPES,
} from "@/data/site";
import {
  estimateRange,
  formatCompactUsd,
  formatRange,
  type EstimatorSelection,
} from "@/lib/estimator";

/** Builds a selection with explicit ids from the config tables (index-based). */
function selection(overrides: Partial<EstimatorSelection> = {}): EstimatorSelection {
  return {
    serviceId: ESTIMATOR_SERVICES[0]!.id,
    stageId: COMPANY_STAGES[1]!.id,
    timelineId: TIMELINES[0]!.id,
    scopeId: SCOPES[1]!.id,
    ...overrides,
  };
}

describe("estimateRange", () => {
  it("returns the base range when all multipliers are 1", () => {
    // Brand Identity ($30k–$50k), Growing (1), Flexible (1), Comprehensive (1)
    const range = estimateRange(selection());
    expect(range.low).toBe(30_000);
    expect(range.high).toBe(50_000);
    expect(range.multiplier).toBe(1);
  });

  it("applies the combined multiplier to both bounds", () => {
    // Established (1.2) × Standard (1.1) × Full System (1.3) = 1.716
    // raw: 30000×1.716 = 51480 → 51000; 50000×1.716 = 85800 → 86000 (nearest $1k)
    const range = estimateRange(
      selection({
        stageId: COMPANY_STAGES[2]!.id,
        timelineId: TIMELINES[1]!.id,
        scopeId: SCOPES[2]!.id,
      }),
    );
    expect(range.low).toBe(51_000);
    expect(range.high).toBe(86_000);
    expect(range.multiplier).toBeCloseTo(1.716, 3);
  });

  it("rounds each bound to the nearest $1,000", () => {
    // Art Direction ($15k–$30k) × Startup (.8) × Accelerated (1.25) × Core (.8)
    // raw: 15000×0.8=12000 → 12000; 30000×0.8×1.25×0.8=24000 → both already round.
    // Use Rush (1.5) to force rounding: 15000×.8×1.5×.8 = 14400 → 14000.
    const range = estimateRange(
      selection({
        serviceId: "art-direction",
        stageId: "startup",
        timelineId: "rush",
        scopeId: "core",
      }),
    );
    expect(range.low).toBe(14_000);
    expect(range.high).toBe(29_000); // 30000×0.8×1.5×0.8 = 28800 → 29000
  });

  it("computes the maximum combination for every service without overlap inversions", () => {
    for (const service of ESTIMATOR_SERVICES) {
      const range = estimateRange(
        selection({
          serviceId: service.id,
          stageId: "enterprise",
          timelineId: "rush",
          scopeId: "full-system",
        }),
      );
      expect(range.low).toBeLessThanOrEqual(range.high);
      expect(range.low).toBeGreaterThan(0);
    }
  });

  it("throws a RangeError on unknown ids (fail fast)", () => {
    expect(() => estimateRange(selection({ serviceId: "nonexistent" as never }))).toThrow(RangeError);
    expect(() => estimateRange(selection({ stageId: "nope" }))).toThrow(RangeError);
    expect(() => estimateRange(selection({ timelineId: "nope" }))).toThrow(RangeError);
    expect(() => estimateRange(selection({ scopeId: "nope" }))).toThrow(RangeError);
  });
});

describe("formatCompactUsd", () => {
  it("formats whole thousands compactly", () => {
    expect(formatCompactUsd(38_000)).toBe("$38k");
    expect(formatCompactUsd(30_000)).toBe("$30k");
  });

  it("formats non-whole thousands with one decimal", () => {
    expect(formatCompactUsd(45_500)).toBe("$45.5k");
  });

  it("rejects non-finite values", () => {
    expect(() => formatCompactUsd(Number.NaN)).toThrow(TypeError);
    expect(() => formatCompactUsd(Number.POSITIVE_INFINITY)).toThrow(TypeError);
  });
});

describe("formatRange", () => {
  it("renders a range with an en dash", () => {
    expect(formatRange({ low: 33_000, high: 55_000, multiplier: 1.1 })).toBe("$33k – $55k");
  });
});
