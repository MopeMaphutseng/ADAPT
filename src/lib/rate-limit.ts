/**
 * Lightweight in-memory sliding-window rate limiter.
 * Suited for single-instance deployments; for multi-instance production,
 * swap the store for Redis without changing the API.
 */

interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();

function now() {
  return Date.now();
}

/**
 * @returns `true` if the request is allowed, `false` if limited.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterMs?: number } {
  const bucket = buckets.get(key) ?? { hits: [] };
  const cutoff = now() - windowMs;
  bucket.hits = bucket.hits.filter((t) => t > cutoff);
  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0] ?? now();
    const retryAfterMs = Math.max(1, oldest + windowMs - now());
    buckets.set(key, bucket);
    return { allowed: false, retryAfterMs };
  }
  bucket.hits.push(now());
  buckets.set(key, bucket);
  return { allowed: true };
}

export function resetRateLimits() {
  buckets.clear();
}

export function resetRateLimitFor(key: string) {
  buckets.delete(key);
}

/** Best-effort client IP (behind proxies this requires X-Forwarded-For trust). */
export function ipFromRequest(req: { headers: Headers }, fallback = "unknown"): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return fallback;
}