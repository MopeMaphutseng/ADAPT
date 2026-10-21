import { NextRequest } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { json, handleRouteError, requireAdminUser, ApiError } from "@/lib/api-auth";
import { assertSameOrigin } from "@/lib/csrf";
import { idParam } from "@/lib/validation";
import { logActivity } from "@/lib/audit";

export const runtime = "nodejs";

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdminUser(req, "media.manage");
    assertSameOrigin(req);
    const { id } = await ctx.params;
    if (!idParam.safeParse(id).success) throw new ApiError(400, "Invalid media id.");
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) throw new ApiError(404, "Media not found.");

    if (media.url.startsWith("/uploads/")) {
      const abs = path.join(process.cwd(), "public", media.url.replace(/^\//, ""));
      try {
        await unlink(abs);
      } catch {
        // File already gone — nothing to do.
      }
    }
    await prisma.media.delete({ where: { id } });
    await logActivity({
      userId: user.id, action: "media.delete", entity: "media", entityId: id, meta: { url: media.url },
    });
    return json({ ok: true, data: { id } });
  } catch (err) {
    return handleRouteError(err);
  }
}