import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, handleRouteError, requireAdminUser } from "@/lib/api-auth";
import { assertSameOrigin } from "@/lib/csrf";
import { projectSchema, parseDateParam } from "@/lib/validation";
import { uniqueSlug } from "@/lib/slugify";
import { slugify } from "@/lib/slugify";
import { logActivity } from "@/lib/audit";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req, "content.manage");
    const url = new URL(req.url);
    const featured = url.searchParams.get("featured") === "true";
    const status = url.searchParams.get("status") ?? undefined;
    const search = url.searchParams.get("q")?.trim();
    const projects = await prisma.project.findMany({
      where: {
        ...(featured ? { featured: true } : {}),
        ...(status ? { status: status as never } : {}),
        ...(search
          ? { OR: [{ title: { contains: search, mode: "insensitive" } }, { summary: { contains: search, mode: "insensitive" } }] }
          : {}),
      },
      orderBy: [{ updatedAt: "desc" }],
    });
    return json({ ok: true, data: projects });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdminUser(req, "content.manage");
    assertSameOrigin(req);

    const body = await req.json().catch(() => null);
    const parsed = projectSchema.safeParse(body);
    if (!parsed.success) return json({ ok: false, error: "Please review the form and try again.", issues: parsed.error.issues }, 422);

    const d = parsed.data;
    let slug = d.slug?.trim() ? slugify(d.slug) : "";
    if (!slug) slug = uniqueSlug(d.title);

    const existing = await prisma.project.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36).slice(-6)}`;
    }

    const publishedAt = parseDateParam(d.publishedAt) ?? (d.published ? new Date() : null);
    const now = Date.now();
    const statusPublishedAt = d.published && (!publishedAt || publishedAt.getTime() <= now)
      ? (publishedAt ?? new Date())
      : publishedAt;

    const project = await prisma.project.create({
      data: {
        slug,
        title: d.title,
        summary: d.summary,
        description: d.description,
        status: d.status,
        category: d.category ?? "Technology",
        technologies: d.technologies ?? [],
        coverImage: d.coverImage || null,
        gallery: d.gallery ?? undefined,
        videoUrl: d.videoUrl || null,
        externalUrl: d.externalUrl || null,
        featured: d.featured,
        published: d.published,
        publishedAt: statusPublishedAt,
        order: d.order ?? 0,
      },
    });

    await logActivity({
      userId: user.id,
      action: "project.create",
      entity: "project",
      entityId: project.id,
      meta: { slug: project.slug, title: project.title },
      ip: req.headers.get("x-forwarded-for")?.split(",")[0] ?? undefined,
    });

    return json({ ok: true, data: project });
  } catch (err) {
    return handleRouteError(err);
  }
}