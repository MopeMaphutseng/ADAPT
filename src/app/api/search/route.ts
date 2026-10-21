import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { json, handleRouteError } from "@/lib/api-auth";
import { assertSameOrigin } from "@/lib/csrf";
import { rateLimit, ipFromRequest } from "@/lib/rate-limit";
import { searchQuerySchema } from "@/lib/validation/search";
import { searchSite } from "@/lib/search/search";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    assertSameOrigin(req);
    const ip = ipFromRequest(req);
    const rl = rateLimit(`search:${ip}`, 30, 60 * 1000);
    if (!rl.allowed) {
      return json(
        { ok: false, error: "Too many searches. Please try again in a minute." },
        429,
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = searchQuerySchema.safeParse(body);
    if (!parsed.success) {
      return json({ ok: false, error: "Please enter a valid search query.", issues: parsed.error.issues }, 422);
    }

    const data = await searchSite(parsed.data.query);
    return json({ ok: true, data });
  } catch (err) {
    return handleRouteError(err);
  }
}
