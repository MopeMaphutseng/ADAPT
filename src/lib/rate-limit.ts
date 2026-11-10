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
  // Bound memory usage if an attacker rotates spoofed/resolved keys.
  if (buckets.size > 10_000) {
    const cutoff = now() - windowMs;
    for (const [k, b] of buckets) {
      if (b.hits.length === 0 || b.hits[b.hits.length - 1] < cutoff) buckets.delete(k);
    }
    if (buckets.size > 10_000) buckets.clear();
  }

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

function isIPv4(value: string): boolean {
  const parts = value.split(".");
  return (
    parts.length === 4 &&
    parts.every((p) => /^\d{1,3}$/.test(p) && Number(p) >= 0 && Number(p) <= 255)
  );
}

function isIPv6(value: string): boolean {
  return /^[0-9a-f:]+$/i.test(value) && value.includes(":");
}

/** Normalises an IP header value; returns null when it is not a plain IP. */
function normaliseIp(value: string | null | undefined): string | null {
  if (!value) return null;
  let v = value.trim();
  if (!v) return null;
  // Strip an IPv4 port ("1.2.3.4:1234") and IPv6 brackets.
  if (v.startsWith("[")) {
    const end = v.indexOf("]");
    if (end > 0) v = v.slice(1, end);
  } else if (/^\d{1,3}(\.\d{1,3}){3}:\d+$/.test(v)) {
    v = v.slice(0, v.lastIndexOf(":"));
  }
  return isIPv4(v) || isIPv6(v) ? v : null;
}

/**
 * Best-effort client IP for rate limiting and audit logs.
 *
 * Vercel sets `x-real-ip` to the actual client and `x-forwarded-for` can be
 * influenced by the caller, so only trusted headers are consulted and every
 * value is validated before use (prevents spoofed limits/log injection).
 */
export function ipFromRequest(req: { headers: Headers }, fallback = "unknown"): string {
  for (const header of ["x-real-ip", "x-vercel-forwarded-for"]) {
    const ip = normaliseIp(req.headers.get(header));
    if (ip) return ip;
  }

  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const parts = fwd.split(",").map((p) => p.trim()).filter(Boolean);
    // The right-most entry is the hop closest to the platform proxy.
    for (let i = parts.length - 1; i >= 0; i -= 1) {
      const ip = normaliseIp(parts[i]);
      if (ip) return ip;
    }
  }

  return fallback;
}