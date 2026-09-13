"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  COMPANY_STAGES,
  ESTIMATOR_SERVICES,
  SCOPES,
  TIMELINES,
  type EstimatorServiceId,
} from "@/data/site";
import { estimateRange, formatRange } from "@/lib/estimator";

/**
 * Investment estimator — a static four-group form.
 *
 * Pass-2 parity redesign: the source renders every group simultaneously
 * (1 Project type / 2 Business stage / 3 Timeline / 4 Deliverables) and
 * gates the estimate until each group has a selection, rather than walking
 * the visitor through a step machine. Selecting an option in any group is
 * recorded immediately; the estimate appears only once the selection is
 * complete, and stays honest as earlier choices are revised.
 */

/** Partial selection — a group is unchosen until the visitor picks. */
type StaticSelection = {
  serviceId: EstimatorServiceId | null;
  stageId: string | null;
  timelineId: string | null;
  scopeId: string | null;
};

type GroupKey = keyof StaticSelection;

/** The four numbered groups, in the source's order and wording. */
const GROUPS: ReadonlyArray<{ n: string; key: GroupKey; label: string }> = [
  { n: "1", key: "serviceId", label: "Project type" },
  { n: "2", key: "stageId", label: "Business stage" },
  { n: "3", key: "timelineId", label: "Timeline" },
  { n: "4", key: "scopeId", label: "Deliverables" },
];

type EstimatorOption = { id: string; label: string };

/** Options for every group, keyed by group — one render path, no copy-paste drift. */
const OPTION_SETS: Record<GroupKey, ReadonlyArray<EstimatorOption>> = {
  serviceId: ESTIMATOR_SERVICES,
  stageId: COMPANY_STAGES,
  timelineId: TIMELINES,
  scopeId: SCOPES,
};

export function Estimator({ initialServiceId }: { initialServiceId?: EstimatorServiceId }) {
  const [selection, setSelection] = useState<StaticSelection>({
    serviceId: initialServiceId ?? null,
    stageId: null,
    timelineId: null,
    scopeId: null,
  });

  const complete =
    selection.serviceId !== null &&
    selection.stageId !== null &&
    selection.timelineId !== null &&
    selection.scopeId !== null;

  const range = useMemo(
    () =>
      complete
        ? estimateRange({
            serviceId: selection.serviceId as EstimatorServiceId,
            stageId: selection.stageId as string,
            timelineId: selection.timelineId as string,
            scopeId: selection.scopeId as string,
          })
        : null,
    [complete, selection],
  );

  function choose(key: GroupKey, id: string) {
    setSelection((prev) => ({ ...prev, [key]: id }));
  }

  return (
    <div>
      {/* Header — open text, no boxed card (the source's estimator floats
          directly on the page background). */}
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Investment estimator
        </p>
        <p className="text-xs text-muted-foreground">Get a personalized estimate.</p>
      </div>

      <p className="mt-5 text-sm text-muted-foreground">
        Answer a few questions to receive a tailored investment range — final numbers are set
        together after a scoping call.
      </p>

      {/* Groups — all four visible at once, numbered like the source, in a
          2×2 column grid: Project type | Business stage / Timeline | Deliverables. */}
      <div className="mt-10 grid gap-x-10 gap-y-10 md:grid-cols-2">
        {GROUPS.map((group) => (
          <div key={group.key}>
            <p className="flex items-baseline gap-3">
              <span className="text-xs tabular-nums text-muted-foreground">{group.n}</span>
              <span className="text-xs font-medium uppercase tracking-[0.22em]">
                {group.label}
              </span>
            </p>
            <div
              className="mt-4 grid gap-3 sm:grid-cols-2"
              role="radiogroup"
              aria-label={group.label}
            >
              {OPTION_SETS[group.key].map((option) => {
                const selected = selection[group.key] === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => choose(group.key, option.id)}
                    className={`border px-5 py-4 text-left text-sm font-medium transition-colors duration-200 ${
                      selected
                        ? "border-foreground bg-muted"
                        : "border-border hover:border-foreground/40"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Estimate — gated until every group has a selection. */}
      <div
        className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border py-8"
        aria-live="polite"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Your estimate
          </p>
          {complete && range ? (
            <p className="mt-1 font-serif text-3xl tracking-tight tabular-nums md:text-4xl">
              {formatRange(range)}
            </p>
          ) : (
            <p className="mt-1 max-w-[42ch] text-sm leading-relaxed text-muted-foreground">
              Complete all selections to see your personalized estimate.
            </p>
          )}
        </div>
        {complete ? (
          <Link
            href="#contact-form"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-background transition-opacity duration-300 hover:opacity-80"
          >
            Start a project
          </Link>
        ) : (
          <p className="max-w-[28ch] text-xs leading-relaxed text-muted-foreground">
            Ranges adjust with your choices — final investment is set together after a scoping
            call.
          </p>
        )}
      </div>
    </div>
  );
}
