/**
 * URL helpers for untrusted content (admin-editable fields, form input).
 * These are used both to validate writes and to sanitise values at render
 * time, so old database rows can never become a `javascript:` XSS sink.
 */

/** True only for absolute http(s) URLs. Rejects javascript:, data:, etc. */
export function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const v = value.trim();
  if (!/^https?:\/\//i.test(v)) return false;
  try {
    const url = new URL(v);
    return (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}

/**
 * True for a same-origin absolute path such as "/projects/x".
 * Rejects protocol-relative ("//host") and backslash tricks ("/\\host").
 */
export function isInternalPath(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const v = value.trim();
  if (!v.startsWith("/") || v.startsWith("//") || v.startsWith("/\\")) return false;
  return !/[\u0000-\u001f\u007f\\]/.test(v);
}

/** True when a value is safe to use as an href or asset URL. */
export function isSafeUrlOrPath(value: unknown): boolean {
  return isHttpUrl(value) || isInternalPath(value);
}

/**
 * Returns a value safe for an href/src attribute, or `fallback` when the
 * supplied value is not an http(s) URL or a local absolute path.
 */
export function safeHref(value: unknown, fallback = "#"): string {
  if (isHttpUrl(value)) return value.trim();
  if (isInternalPath(value)) return value.trim();
  return fallback;
}
