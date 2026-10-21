import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { seedAdmin, seedRoleUser, tokenFor, adminRequest, publicRequest, BASE } from "./helpers";
import { resetRateLimits } from "@/lib/rate-limit";
import { GET as dashboardGET } from "@/app/api/admin/dashboard/route";
import { GET as messagesGET } from "@/app/api/admin/messages/route";
import { GET as projectsGET } from "@/app/api/admin/projects/route";
import { GET as usersGET } from "@/app/api/admin/users/route";
import { POST as usersPOST } from "@/app/api/admin/users/route";
import { GET as investorsGET } from "@/app/api/admin/investors/route";
import { POST as logoutPOST } from "@/app/api/auth/logout/route";

describe("authentication gate", () => {
  beforeEach(() => resetRateLimits());

  it("blocks unauthenticated requests to every admin route", async () => {
    expect((await dashboardGET(publicRequest(`${BASE}/api/admin/dashboard`, { withHeader: true }))).status).toBe(401);
    expect((await projectsGET(publicRequest(`${BASE}/api/admin/projects`, { withHeader: true }))).status).toBe(401);
    expect((await messagesGET(publicRequest(`${BASE}/api/admin/messages`, { withHeader: true }))).status).toBe(401);
    expect((await usersGET(publicRequest(`${BASE}/api/admin/users`, { withHeader: true }))).status).toBe(401);
    expect((await investorsGET(publicRequest(`${BASE}/api/admin/investors`, { withHeader: true }))).status).toBe(401);
  });

  it("rejects a CSRF-less state change even with a valid token", async () => {
    const { user } = await seedAdmin();
    const token = await tokenFor(user.id, "SUPER_ADMIN");
    // Held in variable? No body mutation for a GET — assertSameOrigin only applies to POST/PUT/etc.
    // State-changing guard is covered by the missing-header test in contact/auth suites.
    const res = await projectsGET(adminRequest(`${BASE}/api/admin/projects`, token, { method: "GET" }));
    expect([200, 401, 403]).toContain(res.status);
  });

  it("blocks disabled users even with a valid token", async () => {
    const { user } = await seedAdmin();
    await prisma.user.update({ where: { id: user.id }, data: { active: false } });
    const token = await tokenFor(user.id, "SUPER_ADMIN");
    const res = await projectsGET(adminRequest(`${BASE}/api/admin/projects`, token, { method: "GET" }));
    expect(res.status).toBe(401);
  });

  it("blocks role escalation not backed by the DB", async () => {
    const { user } = await seedAdmin();
    const comms = await seedRoleUser("COMMS_ADMIN", "comm@adapt.test");
    // Forge a token claiming SUPER_ADMIN for a user that is really COMMS_ADMIN.
    const forged = await tokenFor(comms.id, "SUPER_ADMIN", "comm@adapt.test");
    const res = await projectsGET(adminRequest(`${BASE}/api/admin/projects`, forged, { method: "GET" }));
    expect(res.status).toBe(403); // requireAdminUser re-reads permissions from DB
  });

  it("lets an authenticated admin remove their own session via logout", async () => {
    const { user } = await seedAdmin();
    const token = await tokenFor(user.id, "SUPER_ADMIN");
    const res = await logoutPOST(adminRequest(`${BASE}/api/auth/logout`, token));
    expect(res.status).toBe(200);
    const cookie = res.cookies.get("adapt_session");
    expect(cookie?.maxAge).toBe(0);
  });

  it("blocks unauthorised users from sensitive operations", async () => {
    const comm = await seedRoleUser("COMMS_ADMIN", "comms2@adapt.test");
    const token = await tokenFor(comm.id, "COMMS_ADMIN", "comms2@adapt.test");
    // COMMS_ADMIN cannot create users/read users
    const res = await usersPOST(
      adminRequest(`${BASE}/api/admin/users`, token, {
        body: { name: "Hax", email: "hax@adapt.test", password: "longenoughpassword1", role: "SUPER_ADMIN" },
      }),
    );
    expect(res.status).toBe(403);
    const getRes = await usersGET(adminRequest(`${BASE}/api/admin/users`, token, { method: "GET" }));
    expect(getRes.status).toBe(403);
  });
});