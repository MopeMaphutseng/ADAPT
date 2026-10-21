import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { json, handleRouteError } from "@/lib/api-auth";
import { assertSameOrigin } from "@/lib/csrf";

export const runtime = "nodejs";

const trackSchema = z.object({
  path: z.string().max(500),
  referrer: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    assertSameOrigin(req);
    const body = await req.json().catch(() => null);
    const parsed = trackSchema.safeParse(body);
    if (!parsed.success) return json({ ok: true });
    const { path, referrer } = parsed.data;
    if (!path.startsWith("/") || path.length > 200) return json({ ok: true });
    await prisma.pageView.create({
      data: { path: path.slice(0, 200), referrer: referrer?.slice(0, 300) || null, source: "WEB" },
    });
    return json({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
}