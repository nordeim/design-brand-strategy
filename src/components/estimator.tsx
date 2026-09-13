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
import { estimateRange, formatCompactUsd, formatRange, type EstimatorSelection } from "@/lib/estimator";

type StepKey = keyof EstimatorSelection;

type EstimatorOption = { id: string; label: string; baseLow?: number; baseHigh?: number };

const STEPS: ReadonlyArray<{
  key: StepKey;
  label: string;
  question: string;
}> = [
  { key: "serviceId", label: "Service", question: "What does the project need?" },
  { key: "stageId", label: "Company", question: "Where is the company today?" },
  { key: "timelineId", label: "Timeline", question: "How should the work be paced?" },
  { key: "scopeId", label: "Scope", question: "How far should the system go?" },
];

/** Options for every step, keyed by step — one render path, no copy-paste drift. */
const OPTION_SETS: Record<StepKey, ReadonlyArray<EstimatorOption>> = {
  serviceId: ESTIMATOR_SERVICES,
  stageId: COMPANY_STAGES,
  timelineId: TIMELINES,
  scopeId: SCOPES,
};

/**
 * Four-step investment estimator. Selecting an option records the choice and
 * advances; the running estimate is always derived from the full selection,
 * so it stays honest as the visitor refines earlier steps.
 */
export function Estimator({ initialServiceId }: { initialServiceId?: EstimatorServiceId }) {
  const [step, setStep] = useState(0);
  const [selection, setSelection] = useState<EstimatorSelection>({
    serviceId: initialServiceId ?? "brand-identity",
    stageId: "growing",
    timelineId: "standard",
    scopeId: "comprehensive",
  });

  const range = useMemo(() => estimateRange(selection), [selection]);

  function choose(key: StepKey, id: string) {
    setSelection((prev) => ({ ...prev, [key]: id }) as EstimatorSelection);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  const active = STEPS[step]!;
  const done = step === STEPS.length - 1;
  const options = OPTION_SETS[active.key];
  const showPrice = active.key === "serviceId";

  return (
    <div className="border border-border">
      {/* Step header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-5 md:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Investment estimator
        </p>
        <ol className="flex items-center gap-2" aria-label="Estimator steps">
          {STEPS.map((s, i) => {
            const state = i === step ? "active" : i < step ? "done" : "todo";
            return (
              <li key={s.key}>
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  aria-current={i === step ? "step" : undefined}
                  className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] tabular-nums transition-colors ${
                    state === "active"
                      ? "border-foreground bg-foreground text-background"
                      : state === "done"
                        ? "border-foreground text-foreground"
                        : "border-border text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Step body */}
      <div className="px-6 py-8 md:px-8">
        <p className="font-serif text-3xl tracking-tight md:text-4xl">{active.question}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Step {step + 1} of {STEPS.length} — {active.label}
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label={active.question}>
          {options.map((option) => {
            const selected = selection[active.key] === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => choose(active.key, option.id)}
                className={`flex text-left transition-colors duration-200 ${
                  showPrice ? "items-baseline justify-between gap-4" : ""
                } border px-5 py-4 ${
                  selected
                    ? "border-foreground bg-muted"
                    : "border-border hover:border-foreground/40"
                }`}
              >
                <span className="text-sm font-medium">{option.label}</span>
                {typeof option.baseLow === "number" && typeof option.baseHigh === "number" ? (
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {formatCompactUsd(option.baseLow)}–{formatCompactUsd(option.baseHigh)}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(s - 1, 0))}
            className="link-underline mt-6 text-xs uppercase tracking-[0.18em] text-muted-foreground"
          >
            Back
          </button>
        ) : null}
      </div>

      {/* Running estimate */}
      <div
        className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-muted px-6 py-6 md:px-8"
        aria-live="polite"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Estimated starting range
          </p>
          <p className="mt-1 font-serif text-3xl tracking-tight md:text-4xl tabular-nums">
            {formatRange(range)}
          </p>
        </div>
        {done ? (
          <Link
            href="#contact-form"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-background transition-opacity duration-300 hover:opacity-80"
          >
            Start a project
          </Link>
        ) : (
          <p className="max-w-[28ch] text-xs leading-relaxed text-muted-foreground">
            Ranges adjust with your choices — final investment is set together after a scoping call.
          </p>
        )}
      </div>
    </div>
  );
}
