import { NextResponse } from "next/server";

import { contactSchema, fieldErrors } from "@/lib/contact";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";

/**
 * Contact inquiry intake.
 *
 * Validates authoritatively server-side and rate-limits per client.
 * Validated inquiries are persisted to SQLite via Prisma (ADR-011) and
 * emitted as structured logs — the log remains the integration point for
 * email/CRM delivery; the DB is the durable sink.
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

  // Persist to SQLite — fail-open: a DB error must not turn a valid
  // inquiry into a 500 (the log remains the delivery integration point).
  try {
    await db.contactInquiry.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        company: parsed.data.company || null,
        projectType: parsed.data.projectType,
        budget: parsed.data.budget,
        message: parsed.data.message,
        referral: parsed.data.referral || null,
      },
    });
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        event: "contact_inquiry_db_failed",
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }

  // Structured log line — the integration point for delivery (AUD-2 posture:
  // the message BODY is never logged, only its length; name/email/company/
  // referral are logged deliberately as delivery-hook data and also persist
  // to SQLite (ADR-011) — treat these lines as PII-bearing).
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
