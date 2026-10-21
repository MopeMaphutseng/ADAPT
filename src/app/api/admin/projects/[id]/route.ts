import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, handleRouteError, requireAdminUser, ApiError } from "@/lib/api-auth";
import { assertSameOrigin } from "@/lib/csrf";
import { projectSchema, parseDateParam, idParam } from "@/lib/validation";
import { slugify } from "@/lib/slugify";
import { logActivity } from "@/lib/audit";

export const runtime = "nodejs";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminUser(req, "content.manage");
    const { id } = await ctx.params;
    if (!idParam.safeParse(id).success) throw new ApiError(400, "Invalid project id.");
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw new ApiError(404, "Project not found.");
    return json({ ok: true, data: project });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdminUser(req, "content.manage");
    assertSameOrigin(req);
    const { id } = await ctx.params;
    if (!idParam.safeParse(id).success) throw new ApiError(400, "Invalid project id.");

    const body = await req.json().catch(() => null);
    const parsed = projectSchema.safeParse(body);
    if (!parsed.success) return json({ ok: false, error: "Please review the form and try again.", issues: parsed.error.issues }, 422);
    const d = parsed.data;

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Project not found.");

    let slug = d.slug?.trim() ? slugify(d.slug) : existing.slug;
    if (!slug) slug = slugify(d.title);
    const dup = await prisma.project.findFirst({ where: { slug, NOT: { id } } });
    if (dup) slug = `${slug}-${Date.now().toString(36).slice(-6)}`;

    const publishedAt = parseDateParam(d.publishedAt) ?? (d.published ? existing.publishedAt ?? new Date() : null);
    const now = Date.now();
    const statusPublishedAt = d.published && (!publishedAt || publishedAt.getTime() <= now)
      ? (publishedAt ?? new Date())
      : publishedAt;

    const project = await prisma.project.update({
      where: { id },
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
      action: "project.update",
      entity: "project",
      entityId: project.id,
      meta: { slug: project.slug, title: project.title, published: project.published },
      ip: req.headers.get("x-forwarded-for")?.split(",")[0] ?? undefined,
    });

    return json({ ok: true, data: project });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdminUser(req, "content.manage");
    assertSameOrigin(req);
    const { id } = await ctx.params;
    if (!idParam.safeParse(id).success) throw new ApiError(400, "Invalid project id.");
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw new ApiError(404, "Project not found.");
    await prisma.project.delete({ where: { id } });
    await logActivity({
      userId: user.id,
      action: "project.delete",
      entity: "project",
      entityId: id,
      meta: { slug: project.slug, title: project.title },
      ip: req.headers.get("x-forwarded-for")?.split(",")[0] ?? undefined,
    });
    return json({ ok: true, data: { id } });
  } catch (err) {
    return handleRouteError(err);
  }
}