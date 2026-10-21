import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, handleRouteError, requireAdminUser, ApiError } from "@/lib/api-auth";
import { assertSameOrigin } from "@/lib/csrf";
import { announcementSchema, parseDateParam, idParam } from "@/lib/validation";
import { uniqueSlug, slugify } from "@/lib/slugify";
import { logActivity } from "@/lib/audit";

export const runtime = "nodejs";

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdminUser(req, "content.manage");
    assertSameOrigin(req);
    const { id } = await ctx.params;
    if (!idParam.safeParse(id).success) throw new ApiError(400, "Invalid announcement id.");
    const body = await req.json().catch(() => null);
    const parsed = announcementSchema.safeParse(body);
    if (!parsed.success) return json({ ok: false, error: "Please review the form and try again.", issues: parsed.error.issues }, 422);
    const d = parsed.data;
    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Announcement not found.");

    let slug = d.slug?.trim() ? slugify(d.slug) : existing.slug;
    const dup = await prisma.announcement.findFirst({ where: { slug, NOT: { id } } });
    if (dup) slug = `${slug}-${Date.now().toString(36).slice(-6)}`;

    const publishedAt = parseDateParam(d.publishedAt) ?? (d.published ? existing.publishedAt ?? new Date() : null);
    const now = Date.now();
    const statusPublishedAt = d.published && (!publishedAt || publishedAt.getTime() <= now)
      ? (publishedAt ?? new Date())
      : publishedAt;

    const announcement = await prisma.announcement.update({
      where: { id },
      data: { slug, title: d.title, body: d.body, pinned: d.pinned, published: d.published, publishedAt: statusPublishedAt },
    });
    await logActivity({
      userId: user.id, action: "announcement.update", entity: "announcement",
      entityId: announcement.id, meta: { slug: announcement.slug, published: announcement.published },
    });
    return json({ ok: true, data: announcement });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdminUser(req, "content.manage");
    assertSameOrigin(req);
    const { id } = await ctx.params;
    if (!idParam.safeParse(id).success) throw new ApiError(400, "Invalid announcement id.");
    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Announcement not found.");
    await prisma.announcement.delete({ where: { id } });
    await logActivity({
      userId: user.id, action: "announcement.delete", entity: "announcement", entityId: id,
    });
    return json({ ok: true, data: { id } });
  } catch (err) {
    return handleRouteError(err);
  }
}