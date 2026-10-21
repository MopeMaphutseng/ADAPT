import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, handleRouteError, requireAdminUser, ApiError } from "@/lib/api-auth";
import { assertSameOrigin } from "@/lib/csrf";
import { idParam } from "@/lib/validation";
import { logActivity } from "@/lib/audit";
import { z } from "zod";

export const runtime = "nodejs";

const statusSchema = z.object({
  status: z.enum(["NEW", "READ", "RESPONDED", "CLOSED"]),
});

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminUser(req, "comms.manage");
    const { id } = await ctx.params;
    if (!idParam.safeParse(id).success) throw new ApiError(400, "Invalid message id.");
    const message = await prisma.contactMessage.findUnique({ where: { id } });
    if (!message) throw new ApiError(404, "Message not found.");
    return json({ ok: true, data: message });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdminUser(req, "comms.manage");
    assertSameOrigin(req);
    const { id } = await ctx.params;
    if (!idParam.safeParse(id).success) throw new ApiError(400, "Invalid message id.");
    const body = await req.json().catch(() => null);
    const parsed = statusSchema.safeParse(body);
    if (!parsed.success) return json({ ok: false, error: "Invalid status." }, 422);
    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Message not found.");

    const message = await prisma.contactMessage.update({
      where: { id },
      data: {
        status: parsed.data.status,
        readAt:
          parsed.data.status === "NEW"
            ? null
            : existing.readAt ?? (parsed.data.status === "READ" ? new Date() : existing.readAt),
      },
    });
    await logActivity({
      userId: user.id, action: "message.status_update", entity: "contact_message",
      entityId: id, meta: { status: parsed.data.status },
    });
    return json({ ok: true, data: message });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdminUser(req, "comms.manage");
    assertSameOrigin(req);
    const { id } = await ctx.params;
    if (!idParam.safeParse(id).success) throw new ApiError(400, "Invalid message id.");
    await prisma.contactMessage.delete({ where: { id } });
    await logActivity({
      userId: user.id, action: "message.delete", entity: "contact_message", entityId: id,
    });
    return json({ ok: true, data: { id } });
  } catch (err) {
    return handleRouteError(err);
  }
}