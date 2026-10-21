import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, handleRouteError, requireAdminUser, ApiError } from "@/lib/api-auth";
import { assertSameOrigin } from "@/lib/csrf";
import { idParam } from "@/lib/validation";
import { logActivity } from "@/lib/audit";
import { z } from "zod";

export const runtime = "nodejs";

const statusSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "IN_DISCUSSION", "FOLLOW_UP", "CLOSED"]),
});

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminUser(req, "comms.manage");
    const { id } = await ctx.params;
    if (!idParam.safeParse(id).success) throw new ApiError(400, "Invalid inquiry id.");
    const inquiry = await prisma.investorInquiry.findUnique({ where: { id } });
    if (!inquiry) throw new ApiError(404, "Inquiry not found.");
    return json({ ok: true, data: inquiry });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdminUser(req, "comms.manage");
    assertSameOrigin(req);
    const { id } = await ctx.params;
    if (!idParam.safeParse(id).success) throw new ApiError(400, "Invalid inquiry id.");
    const body = await req.json().catch(() => null);
    const parsed = statusSchema.safeParse(body);
    if (!parsed.success) return json({ ok: false, error: "Invalid status." }, 422);
    const existing = await prisma.investorInquiry.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Inquiry not found.");
    const inquiry = await prisma.investorInquiry.update({
      where: { id },
      data: { status: parsed.data.status },
    });
    await logActivity({
      userId: user.id, action: "investor.status_update", entity: "investor_inquiry",
      entityId: id, meta: { status: parsed.data.status },
    });
    return json({ ok: true, data: inquiry });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdminUser(req, "comms.manage");
    assertSameOrigin(req);
    const { id } = await ctx.params;
    if (!idParam.safeParse(id).success) throw new ApiError(400, "Invalid inquiry id.");
    await prisma.investorInquiry.delete({ where: { id } });
    await logActivity({
      userId: user.id, action: "investor.delete", entity: "investor_inquiry", entityId: id,
    });
    return json({ ok: true, data: { id } });
  } catch (err) {
    return handleRouteError(err);
  }
}