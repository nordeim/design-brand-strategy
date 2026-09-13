import { NextResponse } from "next/server";

/** Liveness probe for uptime checks and deploy smoke tests. */
export async function GET() {
  return NextResponse.json(
    { ok: true, service: "design-brand-strategy", uptimeSeconds: Math.round(process.uptime()) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
