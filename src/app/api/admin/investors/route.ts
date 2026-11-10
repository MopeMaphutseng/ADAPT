import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, handleRouteError, requireAdminUser } from "@/lib/api-auth";
import { enumParam, textParam } from "@/lib/query";
import { InvestorStatus } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req, "comms.manage");
    const url = new URL(req.url);
    const status = enumParam(url.searchParams.get("status"), Object.values(InvestorStatus));
    const q = textParam(url.searchParams.get("q"));
    const inquiries = await prisma.investorInquiry.findMany({
      where: {
        ...(status ? { status } : {}),
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