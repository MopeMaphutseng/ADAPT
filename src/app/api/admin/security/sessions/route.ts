import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, handleRouteError, requireAdminUser } from "@/lib/api-auth";

export const runtime = "nodejs";

/**
 * Login & session monitoring. There is no server-side session store (stateless
 * JWT), so this surfaces sign-in activity plus currently-active admins derived
 * from recent authenticated activity.
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req, "security.manage");

    const now = Date.now();
    const since = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const admins = await prisma.user.findMany({
      include: { role: true },
      orderBy: { lastLoginAt: "desc" },
    });

    const loginEvents = await prisma.activityLog.findMany({
      where: { action: { in: ["auth.login", "auth.login_failed", "auth.logout"] }, createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    const activeWindowMs = 60 * 60 * 1000;
    const recentAuthActivity = await prisma.activityLog.groupBy({
      by: ["userId"],
      where: { userId: { not: null }, createdAt: { gte: new Date(now - activeWindowMs) } },
      _max: { createdAt: true },
    });
    const activeUserIds = new Set(
      recentAuthActivity
        .filter((r) => r._max.createdAt && now - r._max.createdAt.getTime() <= activeWindowMs)
        .map((r) => r.userId as string),
    );

    const sessions = admins.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role.name,
      active: u.active,
      lastLoginAt: u.lastLoginAt,
      currentlyActive: activeUserIds.has(u.id),
    }));

    const failedByIp = await prisma.activityLog.groupBy({
      by: ["ip"],
      where: { action: "auth.login_failed", createdAt: { gte: since }, ip: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { ip: "desc" } },
      take: 20,
    });

    return json({
      ok: true,
      data: {
        sessions,
        loginEvents,
        failuresByIp: failedByIp.map((f) => ({ ip: f.ip, count: f._count._all })),
      },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
