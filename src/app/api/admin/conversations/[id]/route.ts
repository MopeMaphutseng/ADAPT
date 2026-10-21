import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, handleRouteError, requireAdminUser } from "@/lib/api-auth";
import { assertSameOrigin } from "@/lib/csrf";
import { logActivity } from "@/lib/audit";
import { z } from "zod";

export const runtime = "nodejs";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdminUser(req, "comms.manage");
    const { id } = await ctx.params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        assignedTo: { select: { id: true, name: true } },
      },
    });
    if (!conversation) return json({ ok: false, error: "Conversation not found." }, 404);

    // Opening a thread clears its admin unread marker.
    if (conversation.unreadForAdmin) {
      await prisma.conversation.update({ where: { id }, data: { unreadForAdmin: false } });
    }

    void user;
    return json({ ok: true, data: conversation });
  } catch (err) {
    return handleRouteError(err);
  }
}

const updateSchema = z.object({
  status: z.enum(["OPEN", "PENDING", "CLOSED", "ARCHIVED"]).optional(),
  pinned: z.boolean().optional(),
  unreadForAdmin: z.boolean().optional(),
  assignedToId: z.string().nullable().optional(),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdminUser(req, "comms.manage");
    assertSameOrigin(req);
    const { id } = await ctx.params;
    const body = await req.json().catch(() => null);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return json({ ok: false, error: "Invalid update.", issues: parsed.error.issues }, 422);
    }

    const conversation = await prisma.conversation.update({ where: { id }, data: parsed.data });
    await logActivity({
      userId: user.id,
      action: "conversation.update",
      entity: "conversation",
      entityId: id,
      meta: parsed.data,
    });
    return json({ ok: true, data: conversation });
  } catch (err) {
    return handleRouteError(err);
  }
}
