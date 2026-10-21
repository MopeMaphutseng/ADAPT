import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { readSession } from "@/lib/api-auth";
import { json } from "@/lib/api-auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await readSession(req);
  if (!session) {
    return json({ ok: true, data: null });
  }
  // Fresh DB check — a disabled/deleted user is never authorised.
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { role: true },
  });
  if (!user || !user.active) {
    return json({ ok: true, data: null });
  }
  return json({
    ok: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
      },
    },
  });
}