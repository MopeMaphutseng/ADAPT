import { describe, it, expect } from "vitest";
import { safeHref, isHttpUrl, isInternalPath } from "@/lib/safe-url";
import { escapeHtml, sanitizeHeader } from "@/lib/mail";
import { ipFromRequest } from "@/lib/rate-limit";
import { enumParam, textParam } from "@/lib/query";

describe("safe URL handling", () => {
  it("accepts http(s) URLs and local absolute paths", () => {
    expect(isHttpUrl("https://example.com/demo")).toBe(true);
    expect(isHttpUrl("http://example.com")).toBe(true);
    expect(isInternalPath("/projects/adapt")).toBe(true);
    expect(safeHref("https://example.com")).toBe("https://example.com");
    expect(safeHref("/projects/adapt")).toBe("/projects/adapt");
  });

  it("rejects dangerous and protocol-relative values", () => {
    for (const value of [
      "javascript:alert(1)",
      "data:text/html,<script>alert(1)</script>",
      "vbscript:msgbox(1)",
      "//evil.example",
      "/\\evil.example",
      " https://ok.example ",
    ]) {
      const expected = value === " https://ok.example " ? "https://ok.example" : "#";
      expect(safeHref(value)).toBe(expected);
    }
    expect(safeHref("", "#")).toBe("#");
    expect(safeHref(null, "fallback")).toBe("fallback");
  });
});

describe("email sanitisation", () => {
  it("escapes HTML metacharacters", () => {
    expect(escapeHtml(`<img src=x onerror="alert('x')">&`)).toBe(
      "&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;&amp;",
    );
  });

  it("strips CR/LF and control characters from headers", () => {
    expect(sanitizeHeader("Hello\r\nBcc: victim@example.com")).toBe(
      "Hello Bcc: victim@example.com",
    );
    expect(sanitizeHeader("")).toBe("");
    expect(sanitizeHeader("", "fallback")).toBe("fallback");
  });
});

describe("ipFromRequest", () => {
  const req = (headers: Record<string, string>) => ({ headers: new Headers(headers) });

  it("prefers Vercel's trusted client IP header", () => {
    expect(ipFromRequest(req({ "x-real-ip": "203.0.113.9", "x-forwarded-for": "1.2.3.4" }))).toBe(
      "203.0.113.9",
    );
  });

  it("uses the right-most forwarded-for hop and validates it", () => {
    expect(
      ipFromRequest(req({ "x-forwarded-for": "spoofed, 198.51.100.7, 2001:db8::1" })),
    ).toBe("2001:db8::1");
    expect(ipFromRequest(req({ "x-forwarded-for": "not-an-ip" }))).toBe("unknown");
  });

  it("ignores invalid trusted headers", () => {
    expect(ipFromRequest(req({ "x-real-ip": "evil<script>" }), "unknown")).toBe("unknown");
  });
});

describe("query parameter helpers", () => {
  it("validates enum parameters", () => {
    const allowed = ["NEW", "CLOSED"] as const;
    expect(enumParam("NEW", allowed)).toBe("NEW");
    expect(enumParam("BOGUS", allowed)).toBeUndefined();
    expect(enumParam(null, allowed)).toBeUndefined();
  });

  it("caps free-text parameters", () => {
    expect(textParam("  hello  ")).toBe("hello");
    expect(textParam("x".repeat(500), 10)).toHaveLength(10);
    expect(textParam("   ")).toBeUndefined();
  });
});
