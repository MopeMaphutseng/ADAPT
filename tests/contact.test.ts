import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { POST as contactPOST } from "@/app/api/contact/route";
import { POST as investorPOST } from "@/app/api/investors/route";
import { POST as trackPOST } from "@/app/api/track/route";
import { publicRequest, BASE } from "./helpers";
import { resetRateLimits } from "@/lib/rate-limit";

const validContact = {
  name: "Jane Doe",
  email: "jane@example.com",
  subject: "Project inquiry",
  message: "Hello, I would like to discuss a project.",
};

const validInvestor = {
  name: "John Investor",
  email: "john@investor.com",
  investorType: "ANGEL_INVESTOR",
  message: "I want to invest in ADAPT.",
};

describe("POST /api/contact", () => {
  beforeEach(() => resetRateLimits());

  it("accepts a valid message with CSRF headers", async () => {
    const res = await contactPOST(
      publicRequest(`${BASE}/api/contact`, { withOrigin: true, withHeader: true, body: validContact }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);

    const msg = await prisma.contactMessage.findFirst({ where: { email: "jane@example.com" } });
    expect(msg?.subject).toBe("Project inquiry");
  });

  it("rejects an origin-less request with no custom header (curl/script)", async () => {
    const res = await contactPOST(
      publicRequest(`${BASE}/api/contact`, { body: { ...validContact, email: "forged@example.com" } }),
    );
    expect(res.status).toBe(403);
    expect(await prisma.contactMessage.findFirst({ where: { email: "forged@example.com" } })).toBeNull();
  });

  it("rejects a cross-origin (forged) request even with the custom header", async () => {
    const hostile = new Request(`${BASE}/api/contact`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-adapt-requested-with": "adapt-client",
        origin: "https://evil.example.com",
      },
      body: JSON.stringify(validContact),
    });
    const res = await contactPOST(hostile as never);
    expect(res.status).toBe(403);
  });

  it("rejects validation errors", async () => {
    const res = await contactPOST(
      publicRequest(`${BASE}/api/contact`, {
        withOrigin: true,
        withHeader: true,
        body: { ...validContact, email: "not-an-email" },
      }),
    );
    expect(res.status).toBe(422);
  });

  it("rate-limits spam after the per-IP window fills", async () => {
    const res = await contactPOST(
      publicRequest(`${BASE}/api/contact`, { withOrigin: true, withHeader: true, body: validContact }),
    );
    expect(res.status).toBe(200);
    const codes: number[] = [];
    for (let i = 0; i < 40; i++) {
      const r = await contactPOST(
        publicRequest(`${BASE}/api/contact`, { withOrigin: true, withHeader: true, body: validContact }),
      );
      codes.push(r.status);
    }
    expect(codes.filter((c) => c === 429).length).toBeGreaterThan(0);
  });
});

describe("POST /api/investors", () => {
  beforeEach(() => resetRateLimits());

  it("accepts a valid inquiry", async () => {
    const res = await investorPOST(
      publicRequest(`${BASE}/api/investors`, { withOrigin: true, withHeader: true, body: validInvestor }),
    );
    expect(res.status).toBe(200);
    const inquiry = await prisma.investorInquiry.findFirst({ where: { email: "john@investor.com" } });
    expect(inquiry?.investorType).toBe("ANGEL_INVESTOR");
  });

  it("rejects without any origin or header (non-browser forgery)", async () => {
    const res = await investorPOST(
      publicRequest(`${BASE}/api/investors`, { body: validInvestor }),
    );
    expect(res.status).toBe(403);
  });

  it("rejects cross-origin forgery", async () => {
    const hostile = new Request(`${BASE}/api/investors`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-adapt-requested-with": "adapt-client",
        origin: "https://evil.example.com",
      },
      body: JSON.stringify(validInvestor),
    });
    const res = await investorPOST(hostile as never);
    expect(res.status).toBe(403);
  });
});

describe("POST /api/track", () => {
  it("records a page view for a valid beacon", async () => {
    const before = await prisma.pageView.count();
    const res = await trackPOST(
      publicRequest(`${BASE}/api/track`, { withOrigin: true, withHeader: true, body: { path: "/about" } }),
    );
    expect(res.status).toBe(200);
    expect(await prisma.pageView.count()).toBe(before + 1);
  });

  it("ignores malformed payloads", async () => {
    const res = await trackPOST(
      publicRequest(`${BASE}/api/track`, { withOrigin: true, withHeader: true, body: { path: 42 } }),
    );
    expect(res.status).toBe(200);
  });

  it("rejects beacons with no origin and no custom header", async () => {
    const res = await trackPOST(
      publicRequest(`${BASE}/api/track`, { body: { path: "/home" } }),
    );
    expect(res.status).toBe(403);
  });
});