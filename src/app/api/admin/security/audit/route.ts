import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, handleRouteError, requireAdminUser } from "@/lib/api-auth";
import { textParam } from "@/lib/query";

export const runtime = "nodejs";

/** Audit / activity log for the founder console. SUPER_ADMIN only. */
export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req, "security.manage");

    const url = new URL(req.url);
    const action = textParam(url.searchParams.get("action"), 80);
    const userId = textParam(url.searchParams.get("userId"), 40);
    const q = textParam(url.searchParams.get("q"));
    const take = Math.min(200, Math.max(1, parseInt(url.searchParams.get("take") ?? "100", 10) || 100));

    const logs = await prisma.activityLog.findMany({
      where: {
        ...(action ? { action: { contains: action, mode: "insensitive" } } : {}),
        ...(userId ? { userId } : {}),
        ...(q
          ? {
              OR: [
                { action: { contains: q, mode: "insensitive" } },
                { entity: { contains: q, mode: "insensitive" } },
                { ip: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take,
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    const distinctActions = await prisma.activityLog.findMany({
      distinct: ["action"],
      select: { action: true },
      orderBy: { action: "asc" },
    });

    return json({
      ok: true,
      data: {
        logs,
        actions: distinctActions.map((a) => a.action),
      },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
