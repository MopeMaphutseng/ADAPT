import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, handleRouteError, requireAdminUser, ApiError } from "@/lib/api-auth";
import { assertSameOrigin } from "@/lib/csrf";
import { logActivity } from "@/lib/audit";
import { hashPassword, verifyPassword } from "@/lib/password";
import { z } from "zod";

export const runtime = "nodejs";

const userRole = z.enum(["SUPER_ADMIN", "CONTENT_ADMIN", "COMMS_ADMIN"]);

const createUserSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.email().max(254),
  password: z.string().min(12, "Password must be at least 12 characters.").max(256),
  role: userRole,
  active: z.boolean().optional().default(true),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(12, "New password must be at least 12 characters.").max(256),
});

export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req, "users.manage");
    const users = await prisma.user.findMany({ include: { role: true }, orderBy: { createdAt: "asc" } });
    return json({
      ok: true,
      data: users.map(({ passwordHash: _ph, ...u }) => u),
    });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await requireAdminUser(req, "users.manage");
    assertSameOrigin(req);
    const body = await req.json().catch(() => null);
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) return json({ ok: false, error: "Please review the form.", issues: parsed.error.issues }, 422);
    const d = parsed.data;
    const email = d.email.toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new ApiError(409, "A user with that email already exists.");
    const role = await prisma.role.findUnique({ where: { name: d.role } });
    if (!role) throw new ApiError(400, "Invalid role.");
    const user = await prisma.user.create({
      data: {
        name: d.name,
        email,
        passwordHash: await hashPassword(d.password),
        roleId: role.id,
        active: d.active,
      },
    });
    await logActivity({
      userId: actor.id, action: "user.create", entity: "user", entityId: user.id, meta: { email },
    });
    return json({ ok: true, data: { id: user.id, name: user.name, email: user.email, active: user.active } });
  } catch (err) {
    return handleRouteError(err);
  }
}

/** Change own password (password reset capability for every signed-in admin). */
export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAdminUser(req);
    assertSameOrigin(req);
    const body = await req.json().catch(() => null);
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) return json({ ok: false, error: "Please review the form.", issues: parsed.error.issues }, 422);
    const current = await prisma.user.findUnique({ where: { id: user.id } });
    if (!current) throw new ApiError(401, "Account not found.");
    const ok = await verifyPassword(parsed.data.currentPassword, current.passwordHash);
    if (!ok) throw new ApiError(403, "Current password is incorrect.");
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(parsed.data.newPassword) },
    });
    await logActivity({ userId: user.id, action: "user.password_changed", entity: "user", entityId: user.id });
    return json({ ok: true, data: { id: user.id } });
  } catch (err) {
    return handleRouteError(err);
  }
}