import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, handleRouteError, requireAdminUser } from "@/lib/api-auth";

export const runtime = "nodejs";

/** Inbox: list conversations with filtering + unread badge counts. */
export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req, "comms.manage");
    const url = new URL(req.url);
    const status = url.searchParams.get("status")?.trim() || undefined;
    const kind = url.searchParams.get("kind")?.trim() || undefined;
    const q = url.searchParams.get("q")?.trim() || undefined;
    const unreadOnly = url.searchParams.get("unread") === "true";

    const conversations = await prisma.conversation.findMany({
      where: {
        ...(status ? { status: status as never } : {}),
        ...(kind ? { kind: kind as never } : {}),
        ...(unreadOnly ? { unreadForAdmin: true } : {}),
        ...(q
          ? {
              OR: [
                { subject: { contains: q, mode: "insensitive" } },
                { participantName: { contains: q, mode: "insensitive" } },
                { participantEmail: { contains: q, mode: "insensitive" } },
                { participantOrg: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ pinned: "desc" }, { lastMessageAt: "desc" }],
      take: 200,
      include: {
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
        _count: { select: { messages: true } },
      },
    });

    const [open, unread] = await Promise.all([
      prisma.conversation.count({ where: { status: "OPEN" } }),
      prisma.conversation.count({ where: { unreadForAdmin: true } }),
    ]);

    return json({
      ok: true,
      data: {
        conversations: conversations.map((c) => ({
          id: c.id,
          kind: c.kind,
          status: c.status,
          subject: c.subject,
          participantName: c.participantName,
          participantEmail: c.participantEmail,
          participantOrg: c.participantOrg,
          investorType: c.investorType,
          unreadForAdmin: c.unreadForAdmin,
          pinned: c.pinned,
          lastMessageAt: c.lastMessageAt,
          messageCount: c._count.messages,
          lastMessage: c.messages[0] ?? null,
        })),
        counts: { open, unread, total: conversations.length },
      },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
