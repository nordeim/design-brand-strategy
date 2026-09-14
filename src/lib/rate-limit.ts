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
