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

/** Derives a client key from proxy headers (best-effort, as behind an edge). */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}
