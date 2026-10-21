import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, handleRouteError, requireAdminUser } from "@/lib/api-auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req, "comms.manage");
    const url = new URL(req.url);
    const status = url.searchParams.get("status") ?? undefined;
    const q = url.searchParams.get("q")?.trim();
    const inquiries = await prisma.investorInquiry.findMany({
      where: {
        ...(status ? { status: status as never } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
                { organization: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });
    return json({ ok: true, data: inquiries });
  } catch (err) {
    return handleRouteError(err);
  }
}