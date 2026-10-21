import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, handleRouteError, requireAdminUser } from "@/lib/api-auth";
import { assertSameOrigin } from "@/lib/csrf";
import { achievementSchema, parseDateParam } from "@/lib/validation";
import { uniqueSlug, slugify } from "@/lib/slugify";
import { logActivity } from "@/lib/audit";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req, "content.manage");
    const url = new URL(req.url);
    const category = url.searchParams.get("category") ?? undefined;
    const search = url.searchParams.get("q")?.trim();
    const achievements = await prisma.achievement.findMany({
      where: {
        ...(category ? { category: category as never } : {}),
        ...(search
          ? { OR: [{ title: { contains: search, mode: "insensitive" } }, { description: { contains: search, mode: "insensitive" } }] }
          : {}),
      },
      orderBy: [{ occurredOn: "desc" }, { updatedAt: "desc" }],
    });
    return json({ ok: true, data: achievements });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdminUser(req, "content.manage");
    assertSameOrigin(req);

    const body = await req.json().catch(() => null);
    const parsed = achievementSchema.safeParse(body);
    if (!parsed.success) return json({ ok: false, error: "Please review the form and try again.", issues: parsed.error.issues }, 422);
    const d = parsed.data;

    let slug = d.slug?.trim() ? slugify(d.slug) : "";
    if (!slug) slug = uniqueSlug(d.title);
    const existing = await prisma.achievement.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now().toString(36).slice(-6)}`;

    const occurredOn = parseDateParam(d.occurredOn) ?? new Date();
    const publishedAt = parseDateParam(d.publishedAt) ?? (d.published ? new Date() : null);
    const now = Date.now();
    const statusPublishedAt = d.published && (!publishedAt || publishedAt.getTime() <= now)
      ? (publishedAt ?? new Date())
      : publishedAt;

    const achievement = await prisma.achievement.create({
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
        author: d.author || user.name,
        featured: d.featured,
        published: d.published,
        publishedAt: statusPublishedAt,
        order: d.order ?? 0,
      },
    });

    await logActivity({
      userId: user.id,
      action: "achievement.create",
      entity: "achievement",
      entityId: achievement.id,
      meta: { slug: achievement.slug, title: achievement.title },
      ip: req.headers.get("x-forwarded-for")?.split(",")[0] ?? undefined,
    });

    return json({ ok: true, data: achievement });
  } catch (err) {
    return handleRouteError(err);
  }
}