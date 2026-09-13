import { NextResponse } from "next/server";

import { contactSchema, fieldErrors } from "@/lib/contact";
import { clientKey, rateLimit } from "@/lib/rate-limit";

/**
 * Contact inquiry intake.
 *
 * Validates authoritatively server-side and rate-limits per client. This
 * deployment has no persistence layer by design — validated inquiries are
 * emitted as structured logs (wire an email provider or CRM hook here in
 * production; see README "Contact form" section).
 */

const WINDOW_MS = 10 * 60 * 1_000;
const LIMIT = 5;

export async function POST(request: Request) {
  if (!rateLimit(clientKey(request), LIMIT, WINDOW_MS)) {
    return NextResponse.json(
      { ok: false, message: "Too many inquiries — please try again in a little while." },
      { status: 429, headers: { "Retry-After": "600" } },
    );
  }

  const body: unknown = await request.json().catch(() => null);
  if (body === null || typeof body !== "object") {
    return NextResponse.json(
      { ok: false, message: "Malformed request body." },
      { status: 400 },
    );
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: fieldErrors(parsed.error) },
      { status: 400 },
    );
  }

  // Structured, size-capped log line — the integration point for delivery.
  console.info(
    JSON.stringify({
      level: "info",
      event: "contact_inquiry",
      receivedAt: new Date().toISOString(),
      inquiry: {
        name: parsed.data.name,
        email: parsed.data.email,
        company: parsed.data.company || null,
        projectType: parsed.data.projectType,
        budget: parsed.data.budget,
        messageLength: parsed.data.message.length,
        referral: parsed.data.referral || null,
      },
    }),
  );

  return NextResponse.json(
    {
      ok: true,
      message: "Inquiry received. Expect a personal reply within two business days.",
    },
    { status: 202 },
  );
}
