import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, handleRouteError, requireAdminUser } from "@/lib/api-auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req);
    const [
      projects,
      achievements,
      announcements,
      messages,
      unreadMessages,
      investors,
      newInvestors,
      media,
      users,
      recentActivity,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.achievement.count(),
      prisma.announcement.count(),
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { status: "NEW" } }),
      prisma.investorInquiry.count(),
      prisma.investorInquiry.count({ where: { status: "NEW" } }),
      prisma.media.count(),
      prisma.user.count(),
      prisma.activityLog.findMany({
        take: 12,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

    return json({
      ok: true,
      data: {
        projects,
        achievements,
        announcements,
        messages,
        unreadMessages,
        investors,
        newInvestors,
        media,
        users,
        recentActivity,
      },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}