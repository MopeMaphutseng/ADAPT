import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSessionToken, verifySessionToken } from "@/lib/session";
import { seedAdmin, seedRoleUser, tokenFor, adminRequest, publicRequest, BASE } from "./helpers";
import { resetRateLimits } from "@/lib/rate-limit";
import { POST as loginPOST } from "@/app/api/auth/login/route";
import { GET as meGET } from "@/app/api/auth/me/route";
import { GET as projectsGET } from "@/app/api/admin/projects/route";

describe("password hashing", () => {
  it("hashes and verifies a password", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(hash).not.toContain("correct horse");
    expect(await verifyPassword("correct horse battery staple", hash)).toBe(true);
    expect(await verifyPassword("wrong password", hash)).toBe(false);
  });

  it("produces unique salts", async () => {
    const a = await hashPassword("same-password");
    const b = await hashPassword("same-password");
    expect(a).not.toBe(b);
  });
});

describe("session tokens", () => {
  it("round-trips a signed JWT", async () => {
    const token = await createSessionToken({ sub: "u1", email: "a@b.c", name: "A", role: "SUPER_ADMIN" });
    const payload = await verifySessionToken(token);
    expect(payload?.sub).toBe("u1");
    expect(payload?.email).toBe("a@b.c");
    expect(payload?.role).toBe("SUPER_ADMIN");
  });

  it("rejects tampered tokens", async () => {
    const token = await createSessionToken({ sub: "u1", email: "a@b.c", name: "A", role: "SUPER_ADMIN" });
    const tampered = token.slice(0, -2) + (token.endsWith("ab") ? "cd" : "aa");
    expect(await verifySessionToken(tampered)).toBeNull();
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(() => resetRateLimits());

  it("logs in an active admin and sets a session cookie", async () => {
    const { user } = await seedAdmin();
    const res = await loginPOST(
      publicRequest(`${BASE}/api/auth/login`, {
        withOrigin: true,
        withHeader: true,
        body: { email: "admin@adapt.test", password: "test-admin-password-123" },
      }),
    );
    expect(res.status).toBe(200);
    const cookie = res.cookies.get("adapt_session");
    expect(cookie).toBeDefined();
    const body = await res.json();
    expect(body.data.user.email).toBe("admin@adapt.test");
    expect(user.active).toBe(true);
  });

  it("rejects a bad password", async () => {
    await seedAdmin();
    const res = await loginPOST(
      publicRequest(`${BASE}/api/auth/login`, {
        withOrigin: true,
        withHeader: true,
        body: { email: "admin@adapt.test", password: "wrong-password-123" },
      }),
    );
    expect(res.status).toBe(401);
  });

  it("rejects unknown email", async () => {
    const res = await loginPOST(
      publicRequest(`${BASE}/api/auth/login`, {
        withOrigin: true,
        withHeader: true,
        body: { email: "nobody@adapt.test", password: "test-admin-password-123" },
      }),
    );
    expect(res.status).toBe(401);
  });

  it("rejects an inactive account", async () => {
    await seedAdmin();
    await prisma.user.update({ where: { email: "admin@adapt.test" }, data: { active: false } });
    const res = await loginPOST(
      publicRequest(`${BASE}/api/auth/login`, {
        withOrigin: true,
        withHeader: true,
        body: { email: "admin@adapt.test", password: "test-admin-password-123" },
      }),
    );
    expect(res.status).toBe(401);
  });

  it("rejects missing CSRF header", async () => {
    await seedAdmin();
    const res = await loginPOST(
      publicRequest(`${BASE}/api/auth/login`, {
        body: { email: "admin@adapt.test", password: "test-admin-password-123" },
      }),
    );
    expect(res.status).toBe(403);
  });

  it("rate-limits after too many attempts", async () => {
    await seedAdmin();
    const attempt = () =>
      loginPOST(
        publicRequest(`${BASE}/api/auth/login`, {
          withOrigin: true,
          withHeader: true,
          body: { email: "admin@adapt.test", password: "wrong-password-123" },
        }),
      );
    const codes = [];
    for (let i = 0; i < 12; i++) {
      const res = await attempt();
      codes.push(res.status);
    }
    const limited = codes.filter((c) => c === 429);
    expect(limited.length).toBeGreaterThan(0);
  });
});

describe("GET /api/auth/me", () => {
  it("returns null user when unauthenticated", async () => {
    const res = await meGET(publicRequest(`${BASE}/api/auth/me`, { withHeader: true }));
    const body = await res.json();
    expect(body.data).toBeNull();
  });

  it("returns the fresh user for a valid session", async () => {
    const { user } = await seedAdmin();
    const token = await tokenFor(user.id, "SUPER_ADMIN");
    const res = await meGET(adminRequest(`${BASE}/api/auth/me`, token, { method: "GET" }));
    const body = await res.json();
    expect(body.data.user.email).toBe("admin@adapt.test");
  });

  it("returns null for a disabled user", async () => {
    const { user } = await seedAdmin();
    await prisma.user.update({ where: { id: user.id }, data: { active: false } });
    const token = await tokenFor(user.id, "SUPER_ADMIN");
    const res = await meGET(adminRequest(`${BASE}/api/auth/me`, token, { method: "GET" }));
    const body = await res.json();
    expect(body.data).toBeNull();
  });
});

describe("roles & permissions", () => {
  it("grants role permissions from configuration", async () => {
    const content = await seedRoleUser("CONTENT_ADMIN", "content@adapt.test");
    const comms = await seedRoleUser("COMMS_ADMIN", "comms@adapt.test");
    const contentToken = await tokenFor(content.id, "CONTENT_ADMIN", "content@adapt.test");
    const commsToken = await tokenFor(comms.id, "COMMS_ADMIN", "comms@adapt.test");

    // Content admin can read projects (content.manage routes require logged-in user).
    const res = await projectsGET(adminRequest(`${BASE}/api/admin/projects`, contentToken, { method: "GET" }));
    expect(res.status).toBe(200);

    // Comms admin is blocked from content routes.
    const blocked = await projectsGET(adminRequest(`${BASE}/api/admin/projects`, commsToken, { method: "GET" }));
    expect(blocked.status).toBe(403);
  });
});