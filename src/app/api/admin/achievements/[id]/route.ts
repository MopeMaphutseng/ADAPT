import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, handleRouteError, requireAdminUser, ApiError } from "@/lib/api-auth";
import { assertSameOrigin } from "@/lib/csrf";
import { achievementSchema, parseDateParam, idParam } from "@/lib/validation";
import { slugify } from "@/lib/slugify";
import { logActivity } from "@/lib/audit";

export const runtime = "nodejs";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminUser(req, "content.manage");
    const { id } = await ctx.params;
    if (!idParam.safeParse(id).success) throw new ApiError(400, "Invalid achievement id.");
    const achievement = await prisma.achievement.findUnique({ where: { id } });
    if (!achievement) throw new ApiError(404, "Achievement not found.");
    return json({ ok: true, data: achievement });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdminUser(req, "content.manage");
    assertSameOrigin(req);
    const { id } = await ctx.params;
    if (!idParam.safeParse(id).success) throw new ApiError(400, "Invalid achievement id.");

    const body = await req.json().catch(() => null);
    const parsed = achievementSchema.safeParse(body);
    if (!parsed.success) return json({ ok: false, error: "Please review the form and try again.", issues: parsed.error.issues }, 422);
    const d = parsed.data;

    const existing = await prisma.achievement.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Achievement not found.");

    let slug = d.slug?.trim() ? slugify(d.slug) : existing.slug;
    if (!slug) slug = slugify(d.title);
    const dup = await prisma.achievement.findFirst({ where: { slug, NOT: { id } } });
    if (dup) slug = `${slug}-${Date.now().toString(36).slice(-6)}`;

    const occurredOn = parseDateParam(d.occurredOn) ?? existing.occurredOn;
    const publishedAt = parseDateParam(d.publishedAt) ?? (d.published ? existing.publishedAt ?? new Date() : null);
    const now = Date.now();
    const statusPublishedAt = d.published && (!publishedAt || publishedAt.getTime() <= now)
      ? (publishedAt ?? new Date())
      : publishedAt;

    const achievement = await prisma.achievement.update({
      where: { id },
      data: {
        slug,
        title: d.title,
        description: d.description,
        content: d.content,
        category: d.category,
        occurredOn,
        coverImage: d.coverImage || null,
        gallery: d.gallery ?? undefined,
        videoUrl: d.videoUrl || null,
        externalUrl: d.externalUrl || null,
        author: d.author || existing.author || user.name,
        featured: d.featured,
        published: d.published,
        publishedAt: statusPublishedAt,
        order: d.order ?? 0,
      },
    });

    await logActivity({
      userId: user.id,
      action: "achievement.update",
      entity: "achievement",
      entityId: achievement.id,
      meta: { slug: achievement.slug, title: achievement.title, published: achievement.published },
      ip: req.headers.get("x-forwarded-for")?.split(",")[0] ?? undefined,
    });

    return json({ ok: true, data: achievement });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdminUser(req, "content.manage");
    assertSameOrigin(req);
    const { id } = await ctx.params;
    if (!idParam.safeParse(id).success) throw new ApiError(400, "Invalid achievement id.");
    const achievement = await prisma.achievement.findUnique({ where: { id } });
    if (!achievement) throw new ApiError(404, "Achievement not found.");
    await prisma.achievement.delete({ where: { id } });
    await logActivity({
      userId: user.id,
      action: "achievement.delete",
      entity: "achievement",
      entityId: id,
      meta: { slug: achievement.slug, title: achievement.title },
      ip: req.headers.get("x-forwarded-for")?.split(",")[0] ?? undefined,
    });
    return json({ ok: true, data: { id } });
  } catch (err) {
    return handleRouteError(err);
  }
}