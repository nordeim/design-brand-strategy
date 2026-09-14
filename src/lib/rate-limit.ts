/**
 * In-memory sliding-window rate limiter for the contact API.
 *
 * Adapted from the foundation repo's battle-tested implementation: bounded
 * memory (a spoofed x-forwarded-for flood cannot grow the map without
 * limit — expired buckets are swept at the cap before insert), O(1) hot
 * path, and no external dependencies.
 */

const buckets = new Map<string, { count: number; resetAt: number }>();

const MAX_BUCKETS = 10_000;

function sweepExpired(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

/** Returns true when the request is allowed; false when over the limit. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt < now) {
    if (buckets.size >= MAX_BUCKETS) sweepExpired(now);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

/**
 * Derives a client key for rate limiting from proxy headers.
 *
 * Trust order (AUD-1 hardening, audit pass 3):
 *  1. `cf-connecting-ip` — Cloudflare overwrites it with the real connecting
 *     IP and clients cannot forge it through the edge. Preferred whenever
 *     present (the live deploy is CF-fronted).
 *  2. The **last** `x-forwarded-for` entry — proxies APPEND the real client
 *     IP to the chain, so the final hop is the proxy-added value; earlier
 *     entries are client-supplied and forgeable. (Single-hop chains — the
 *     e2e isolation pattern — key on themselves, so specs are unaffected.)
 *  3. `x-real-ip` — set by some reverse proxies to the direct peer.
 *  4. `local` — direct development traffic.
 *
 * Still best-effort identity (K-7): a single-instance in-memory limiter is
 * a bound, not an auth boundary.
 */
export function clientKey(request: Request): string {
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp && cfIp.trim()) return cfIp.trim();

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded
      .split(",")
      .map((hop) => hop.trim())
      .filter(Boolean);
    if (hops.length > 0) return hops[hops.length - 1];
  }

  return request.headers.get("x-real-ip") ?? "local";
}

/**
 * Classifies the status sequence of a same-key burst probe (limit+1 requests
 * sharing one spoofed `x-forwarded-for`) so the contact e2e specs can tell
 * whether per-XFF bucket isolation actually works on the target origin
 * (P4-F1). Behind an edge proxy that overwrites client identity (Cloudflare
 * sets `cf-connecting-ip` — see clientKey's trust order), every request lands
 * in ONE bucket regardless of the spoofed header, and the limiter trips early
 * or immediately; on a self-managed origin the exact contract sequence
 * `[202 × limit, 429]` is observed.
 *
 *  - "isolated": exactly 202×limit followed by 429 — per-XFF keying works.
 *  - "shared":   a 429 appears before the limit-th response, or every request
 *                was limited — the origin keys requests by something the
 *                client cannot spoof (or the bucket was pre-burned by traffic
 *                from an earlier run inside the window).
 *  - "broken":   no 429 at all, an unexpected status shape, or too few
 *                responses — the limiter contract itself looks wrong.
 *
 * Used by `e2e/contact.spec.ts` to skip (loudly, with evidence) the two
 * isolation-dependent specs when the suite runs against an edge-fronted
 * external server via `E2E_BASE_URL`.
 */
export function classifyBurstStatuses(
  statuses: number[],
  limit: number,
): "isolated" | "shared" | "broken" {
  if (statuses.length < limit + 1) return "broken";

  const firstLimited = statuses.indexOf(429);
  if (firstLimited === -1) return "broken";

  // Everything before the first 429 must be an allowed submission; anything
  // else (400/500/403…) means the responses are not describing the limiter.
  const beforeLimit = statuses.slice(0, firstLimited);
  if (beforeLimit.some((s) => s !== 202)) return "broken";

  if (firstLimited === limit) {
    // The boundary case: `limit` successes then the (limit+1)-th is limited —
    // but only "isolated" if the tail is entirely limited as well.
    const tail = statuses.slice(firstLimited);
    return tail.every((s) => s === 429) ? "isolated" : "broken";
  }

  // The limiter tripped before the bucket could have filled from this burst
  // alone — requests are being keyed together beyond the spoofed header.
  return "shared";
}
