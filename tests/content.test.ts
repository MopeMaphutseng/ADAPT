import { describe, it, expect } from "vitest";
import { prisma } from "@/lib/db";
import { seedAdmin, tokenFor, adminRequest, BASE } from "./helpers";
import { POST as projectsPOST } from "@/app/api/admin/projects/route";
import { GET as projectsGET } from "@/app/api/admin/projects/route";
import { PUT as projectPUT, DELETE as projectDELETE } from "@/app/api/admin/projects/[id]/route";
import { POST as achievementsPOST, GET as achievementsGET } from "@/app/api/admin/achievements/route";
import {
  PUT as achievementPUT,
  DELETE as achievementDELETE,
} from "@/app/api/admin/achievements/[id]/route";

describe("admin projects", () => {
  it("creates, lists, updates and deletes a project", async () => {
    const { user } = await seedAdmin();
    const token = await tokenFor(user.id, "SUPER_ADMIN");

    const createRes = await projectsPOST(
      adminRequest(`${BASE}/api/admin/projects`, token, {
        body: {
          title: "Test Project",
          summary: "Summary here",
          description: "Full description here",
          status: "IDEA",
          technologies: ["TypeScript", "AI"],
          published: true,
          featured: true,
        },
      }),
    );
    expect(createRes.status).toBe(200);
    const created = (await createRes.json()).data;
    expect(created.slug).toBe("test-project");

    const listRes = await projectsGET(adminRequest(`${BASE}/api/admin/projects`, token, { method: "GET" }));
    const listed = (await listRes.json()).data;
    expect(listed.some((p: { id: string }) => p.id === created.id)).toBe(true);

    const updateRes = await projectPUT(
      adminRequest(`${BASE}/api/admin/projects/${created.id}`, token, {
        method: "PUT",
        body: { title: "Test Project Renamed", summary: "S", description: "D", status: "PROTOTYPE", published: true },
      }),
      { params: Promise.resolve({ id: created.id }) },
    );
    expect(updateRes.status).toBe(200);
    const updated = (await updateRes.json()).data;
    expect(updated.title).toBe("Test Project Renamed");

    const delRes = await projectDELETE(
      adminRequest(`${BASE}/api/admin/projects/${created.id}`, token, { method: "DELETE" }),
      { params: Promise.resolve({ id: created.id }) },
    );
    expect(delRes.status).toBe(200);
    expect(await prisma.project.findUnique({ where: { id: created.id } })).toBeNull();
  });

  it("script-injection in text is stored but not executed (safe render via React escaping)", async () => {
    const { user } = await seedAdmin();
    const token = await tokenFor(user.id, "SUPER_ADMIN");
    const payload = {
      title: "XSS <img src=x onerror=alert(1)>",
      summary: "<script>alert(1)</script>",
      description: "desc",
      status: "IDEA",
    };
    const res = await projectsPOST(adminRequest(`${BASE}/api/admin/projects`, token, { body: payload }));
    expect(res.status).toBe(200);
    const created = (await res.json()).data;
    const row = await prisma.project.findUnique({ where: { id: created.id } });
    expect(row?.title).toContain("<img");
    await prisma.project.delete({ where: { id: created.id } });
  });
});

describe("admin achievements", () => {
  it("creates, updates and deletes an achievement", async () => {
    const { user } = await seedAdmin();
    const token = await tokenFor(user.id, "SUPER_ADMIN");

    const createRes = await achievementsPOST(
      adminRequest(`${BASE}/api/admin/achievements`, token, {
        body: {
          title: "Milestone",
          description: "We reached a milestone",
          content: "Details about the milestone",
          category: "MILESTONE",
          occurredOn: "2026-10-01",
          published: true,
        },
      }),
    );
    expect(createRes.status).toBe(200);
    const created = (await createRes.json()).data;
    expect(created.slug).toBe("milestone");

    const updateRes = await achievementPUT(
      adminRequest(`${BASE}/api/admin/achievements/${created.id}`, token, {
        method: "PUT",
        body: {
          title: "Milestone Two",
          description: "Updated",
          content: "More",
          category: "AWARD",
          occurredOn: "2026-10-02",
          published: false,
        },
      }),
      { params: Promise.resolve({ id: created.id }) },
    );
    expect(updateRes.status).toBe(200);
    const updated = (await updateRes.json()).data;
    expect(updated.category).toBe("AWARD");

    const listRes = await achievementsGET(adminRequest(`${BASE}/api/admin/achievements`, token, { method: "GET" }));
    expect((await listRes.json()).data.some((a: { id: string }) => a.id === created.id)).toBe(true);

    const delRes = await achievementDELETE(
      adminRequest(`${BASE}/api/admin/achievements/${created.id}`, token, { method: "DELETE" }),
      { params: Promise.resolve({ id: created.id }) },
    );
    expect(delRes.status).toBe(200);
    expect(await prisma.achievement.findUnique({ where: { id: created.id } })).toBeNull();
  });

  it("rejects a payload missing required fields (422)", async () => {
    const { user } = await seedAdmin();
    const token = await tokenFor(user.id, "SUPER_ADMIN");
    const res = await achievementsPOST(
      adminRequest(`${BASE}/api/admin/achievements`, token, { body: { title: "No description" } }),
    );
    expect(res.status).toBe(422);
  });
});