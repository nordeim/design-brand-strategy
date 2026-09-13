/**
 * Investment estimator — pure calculation layer.
 *
 * Mirrors the reference site's engagement model: each service carries a base
 * investment range, adjusted by company stage, timeline, and deliverable
 * scope multipliers. The result is a rounded range presented as a starting
 * point for a scoping conversation, never a quote.
 */

import {
  COMPANY_STAGES,
  ESTIMATOR_SERVICES,
  SCOPES,
  TIMELINES,
  type EstimatorServiceId,
} from "@/data/site";

export type EstimatorSelection = {
  serviceId: EstimatorServiceId;
  stageId: string;
  timelineId: string;
  scopeId: string;
};

export type EstimateRange = {
  /** Lower bound, rounded to the nearest $1,000. */
  low: number;
  /** Upper bound, rounded to the nearest $1,000. */
  high: number;
  /** Combined multiplier applied to the base range. */
  multiplier: number;
};

const ROUND_TO = 1_000;

function roundToNearest(value: number, step: number): number {
  return Math.round(value / step) * step;
}

/**
 * Compute the estimated investment range for a selection.
 *
 * @throws {RangeError} if any selection id is unknown — the UI only emits
 *   known ids, so an invalid id is a programming error and fails fast.
 */
export function estimateRange(selection: EstimatorSelection): EstimateRange {
  const service = ESTIMATOR_SERVICES.find((s) => s.id === selection.serviceId);
  const stage = COMPANY_STAGES.find((s) => s.id === selection.stageId);
  const timeline = TIMELINES.find((t) => t.id === selection.timelineId);
  const scope = SCOPES.find((s) => s.id === selection.scopeId);

  if (!service) throw new RangeError(`Unknown estimator service: ${selection.serviceId}`);
  if (!stage) throw new RangeError(`Unknown company stage: ${selection.stageId}`);
  if (!timeline) throw new RangeError(`Unknown timeline: ${selection.timelineId}`);
  if (!scope) throw new RangeError(`Unknown scope: ${selection.scopeId}`);

  const multiplier = stage.multiplier * timeline.multiplier * scope.multiplier;

  return {
    low: roundToNearest(service.baseLow * multiplier, ROUND_TO),
    high: roundToNearest(service.baseHigh * multiplier, ROUND_TO),
    multiplier: Number(multiplier.toFixed(4)),
  };
}

/** Format a dollar amount in compact thousands (e.g. 38000 → "$38k"). */
export function formatCompactUsd(value: number): string {
  if (!Number.isFinite(value)) throw new TypeError(`Invalid amount: ${value}`);
  const thousands = value / 1_000;
  // Drop trailing ".0" for whole thousands.
  const compact = Number.isInteger(thousands) ? String(thousands) : thousands.toFixed(1);
  return `$${compact}k`;
}

/** Format the full range for display (e.g. "$33k – $55k"). */
export function formatRange(range: EstimateRange): string {
  return `${formatCompactUsd(range.low)} – ${formatCompactUsd(range.high)}`;
}
