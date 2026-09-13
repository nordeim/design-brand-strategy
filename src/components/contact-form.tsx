"use client";

import { useState, type FormEvent } from "react";

import { SITE } from "@/data/site";
import {
  BUDGET_LABELS,
  BUDGET_RANGES,
  contactSchema,
  fieldErrors,
  PROJECT_TYPE_LABELS,
  PROJECT_TYPES,
} from "@/lib/contact";

type Status = "idle" | "submitting" | "success" | "error";

const FIELD_CLASS =
  "w-full border-b border-border bg-transparent py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    // Honeypot — humans never see this field; bots fill it.
    const honeypot = String(data.get("website") ?? "");
    if (honeypot) {
      // Silently accept; no submission is created.
      setStatus("success");
      return;
    }

    const parsed = contactSchema.safeParse({
      name: data.get("name"),
      email: data.get("email"),
      company: data.get("company") ?? "",
      projectType: data.get("projectType"),
      budget: data.get("budget"),
      message: data.get("message"),
      referral: data.get("referral") ?? "",
    });

    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      setStatus("error");
      setServerMessage(null);
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (response.ok) {
        setStatus("success");
        form.reset();
        return;
      }

      if (response.status === 429) {
        setServerMessage("That's a few too many inquiries in a short window — please try again in a little while.");
      } else if (response.status === 400) {
        const body = (await response.json().catch(() => null)) as { errors?: Record<string, string> } | null;
        if (body?.errors) {
          setErrors(body.errors);
        } else {
          setServerMessage("Some details need a second look — please check the highlighted fields.");
        }
      } else {
        setServerMessage(`Something went wrong on my end. Please email ${SITE.email} directly.`);
      }
      setStatus("error");
    } catch {
      setStatus("error");
      setServerMessage(`The network dropped the message. Please try again, or email ${SITE.email} directly.`);
    }
  }

  if (status === "success") {
    return (
      <div className="border border-border p-8 md:p-10" role="status">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Message received
        </p>
        <p className="mt-4 font-serif text-3xl tracking-tight md:text-4xl">Thank you — it landed.</p>
        <p className="mt-4 max-w-[48ch] text-sm leading-relaxed text-muted-foreground">
          I read every inquiry personally and reply within two business days. If the project looks
          like a fit, the next step is a 30-minute scoping call.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-7">
      {serverMessage ? (
        <p role="alert" className="border border-border bg-muted px-5 py-4 text-sm">
          {serverMessage}
        </p>
      ) : null}

      <div className="grid gap-7 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Name <span aria-hidden="true">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            aria-describedby={errors.name ? "name-error" : undefined}
            aria-invalid={Boolean(errors.name)}
            placeholder="Your name"
            className={FIELD_CLASS}
          />
          {errors.name ? (
            <p id="name-error" className="mt-2 text-xs text-foreground">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="email" className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Email <span aria-hidden="true">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-describedby={errors.email ? "email-error" : undefined}
            aria-invalid={Boolean(errors.email)}
            placeholder="you@company.com"
            className={FIELD_CLASS}
          />
          {errors.email ? (
            <p id="email-error" className="mt-2 text-xs text-foreground">
              {errors.email}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="company" className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Company <span className="text-muted-foreground/70">(optional)</span>
        </label>
        <input
          id="company"
          name="company"
          type="text"
          autoComplete="organization"
          placeholder="Company or organization"
          className={FIELD_CLASS}
        />
      </div>

      <div className="grid gap-7 sm:grid-cols-2">
        <div>
          <label htmlFor="projectType" className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Project type <span aria-hidden="true">*</span>
          </label>
          <select
            id="projectType"
            name="projectType"
            required
            defaultValue=""
            aria-describedby={errors.projectType ? "projectType-error" : undefined}
            aria-invalid={Boolean(errors.projectType)}
            className={FIELD_CLASS}
          >
            <option value="" disabled>
              Choose a type
            </option>
            {PROJECT_TYPES.map((type) => (
              <option key={type} value={type}>
                {PROJECT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          {errors.projectType ? (
            <p id="projectType-error" className="mt-2 text-xs">
              {errors.projectType}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="budget" className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Budget <span aria-hidden="true">*</span>
          </label>
          <select
            id="budget"
            name="budget"
            required
            defaultValue=""
            aria-describedby={errors.budget ? "budget-error" : undefined}
            aria-invalid={Boolean(errors.budget)}
            className={FIELD_CLASS}
          >
            <option value="" disabled>
              Choose a range
            </option>
            {BUDGET_RANGES.map((range) => (
              <option key={range} value={range}>
                {BUDGET_LABELS[range]}
              </option>
            ))}
          </select>
          {errors.budget ? (
            <p id="budget-error" className="mt-2 text-xs">
              {errors.budget}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="message" className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          About the project <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          aria-describedby={errors.message ? "message-error" : undefined}
          aria-invalid={Boolean(errors.message)}
          placeholder="A sentence or two about the project, timing, and what success looks like."
          className={`${FIELD_CLASS} resize-y`}
        />
        {errors.message ? (
          <p id="message-error" className="mt-2 text-xs">
            {errors.message}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="referral" className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          How did you find me? <span className="text-muted-foreground/70">(optional)</span>
        </label>
        <input
          id="referral"
          name="referral"
          type="text"
          placeholder="A name, a site, a stroke of luck"
          className={FIELD_CLASS}
        />
      </div>

      {/* Honeypot — visually and assistively hidden from humans. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-medium uppercase tracking-[0.14em] text-background transition-opacity duration-300 hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "submitting" ? "Sending…" : "Send inquiry"}
        </button>
        <p className="text-xs text-muted-foreground">
          Replies within two business days. <span aria-hidden="true">*</span> Required.
        </p>
      </div>
    </form>
  );
}
