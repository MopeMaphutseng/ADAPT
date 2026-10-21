import { NextRequest } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { json, handleRouteError, requireAdminUser, ApiError } from "@/lib/api-auth";
import { processImageUpload } from "@/lib/upload";
import { logActivity } from "@/lib/audit";
import { z } from "zod";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req, "media.manage");
    const media = await prisma.media.findMany({ orderBy: { createdAt: "desc" } });
    return json({ ok: true, data: media });
  } catch (err) {
    return handleRouteError(err);
  }
}

const altSchema = z.object({ alt: z.string().max(300).optional() });

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdminUser(req, "media.manage");
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      throw new ApiError(400, "No file provided.");
    }
    const alt = typeof formData.get("alt") === "string" ? String(formData.get("alt")) : "";
    const parsedAlt = altSchema.safeParse({ alt });
    if (!parsedAlt.success) throw new ApiError(400, "Invalid alt text.");

    const processed = await processImageUpload(file);
    const record = await prisma.media.create({
      data: {
        filename: processed.filename,
        originalName: file.name.slice(0, 255),
        mimeType: processed.mimeType,
        size: processed.size,
        width: processed.width,
        height: processed.height,
        url: processed.url,
        alt: parsedAlt.data.alt || null,
        uploadedById: user.id,
      },
    });
    await logActivity({
      userId: user.id, action: "media.upload", entity: "media",
      entityId: record.id, meta: { url: record.url, mime: record.mimeType },
    });
    return json({ ok: true, data: record });
  } catch (err) {
    return handleRouteError(err);
  }
}