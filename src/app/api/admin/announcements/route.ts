import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, handleRouteError, requireAdminUser } from "@/lib/api-auth";
import { assertSameOrigin } from "@/lib/csrf";
import { announcementSchema, parseDateParam } from "@/lib/validation";
import { uniqueSlug, slugify } from "@/lib/slugify";
import { logActivity } from "@/lib/audit";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req, "content.manage");
    const announcements = await prisma.announcement.findMany({
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    });
    return json({ ok: true, data: announcements });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdminUser(req, "content.manage");
    assertSameOrigin(req);
    const body = await req.json().catch(() => null);
    const parsed = announcementSchema.safeParse(body);
    if (!parsed.success) return json({ ok: false, error: "Please review the form and try again.", issues: parsed.error.issues }, 422);
    const d = parsed.data;

    let slug = d.slug?.trim() ? slugify(d.slug) : "";
    if (!slug) slug = uniqueSlug(d.title);
    const existing = await prisma.announcement.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now().toString(36).slice(-6)}`;

    const publishedAt = parseDateParam(d.publishedAt) ?? (d.published ? new Date() : null);
    const now = Date.now();
    const statusPublishedAt = d.published && (!publishedAt || publishedAt.getTime() <= now)
      ? (publishedAt ?? new Date())
      : publishedAt;

    const announcement = await prisma.announcement.create({
      data: {
        slug,
        title: d.title,
        body: d.body,
        pinned: d.pinned,
        published: d.published,
        publishedAt: statusPublishedAt,
      },
    });
    await logActivity({
      userId: user.id, action: "announcement.create", entity: "announcement",
      entityId: announcement.id, meta: { slug: announcement.slug },
    });
    return json({ ok: true, data: announcement });
  } catch (err) {
    return handleRouteError(err);
  }
}