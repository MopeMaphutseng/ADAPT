import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, handleRouteError, requireAdminUser, ApiError } from "@/lib/api-auth";
import { assertSameOrigin } from "@/lib/csrf";
import { logActivity } from "@/lib/audit";
import { hashPassword } from "@/lib/password";
import { z } from "zod";

export const runtime = "nodejs";

const updateUserSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  role: z.enum(["SUPER_ADMIN", "CONTENT_ADMIN", "COMMS_ADMIN"]).optional(),
  active: z.boolean().optional(),
  newPassword: z
    .string()
    .min(12, "Password must be at least 12 characters.")
    .max(256)
    .optional()
    .or(z.literal("")),
});

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireAdminUser(req, "users.manage");
    assertSameOrigin(req);
    const { id } = await ctx.params;
    if (id === actor.id) {
      throw new ApiError(403, "Use the profile page to change your own password; role/status of your own account cannot be edited here.");
    }
    const target = await prisma.user.findUnique({ where: { id }, include: { role: true } });
    if (!target) throw new ApiError(404, "User not found.");

    const body = await req.json().catch(() => null);
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) return json({ ok: false, error: "Please review the form.", issues: parsed.error.issues }, 422);
    const d = parsed.data;

    if (target.role.name === "SUPER_ADMIN" && ((d.role && d.role !== "SUPER_ADMIN") || d.active === false)) {
      const activeSuperAdmins = await prisma.user.count({ where: { role: { name: "SUPER_ADMIN" }, active: true } });
      if (activeSuperAdmins <= 1) throw new ApiError(409, "Cannot demote or disable the last active Super Admin.");
    }

    let roleId = target.roleId;
    if (d.role) {
      const role = await prisma.role.findUnique({ where: { name: d.role } });
      if (!role) throw new ApiError(400, "Invalid role.");
      roleId = role.id;
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        name: d.name ?? target.name,
        roleId,
        active: d.active ?? target.active,
        ...(d.newPassword ? { passwordHash: await hashPassword(d.newPassword) } : {}),
      },
    });
    await logActivity({
      userId: actor.id, action: "user.update", entity: "user", entityId: id, meta: { email: target.email },
    });
    return json({ ok: true, data: { id: user.id, name: user.name, email: user.email, active: user.active } });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireAdminUser(req, "users.manage");
    assertSameOrigin(req);
    const { id } = await ctx.params;
    if (id === actor.id) throw new ApiError(400, "You cannot delete your own account.");
    const target = await prisma.user.findUnique({ where: { id }, include: { role: true } });
    if (!target) throw new ApiError(404, "User not found.");
    if (target.role.name === "SUPER_ADMIN") {
      const activeSuperAdmins = await prisma.user.count({ where: { role: { name: "SUPER_ADMIN" }, active: true } });
      if (activeSuperAdmins <= 1) throw new ApiError(409, "Cannot delete the last Super Admin.");
    }
    await prisma.user.delete({ where: { id } });
    await logActivity({
      userId: actor.id, action: "user.delete", entity: "user", entityId: id, meta: { email: target.email },
    });
    return json({ ok: true, data: { id } });
  } catch (err) {
    return handleRouteError(err);
  }
}