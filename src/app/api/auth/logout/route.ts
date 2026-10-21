import { NextRequest } from "next/server";
import { json, handleRouteError } from "@/lib/api-auth";
import { assertSameOrigin } from "@/lib/csrf";
import { sessionCookieOptions } from "@/lib/session";
import { sessionCookieName } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    assertSameOrigin(req);
    const res = json({ ok: true, data: { loggedOut: true } });
    res.cookies.set(sessionCookieName(), "", {
      ...sessionCookieOptions(),
      maxAge: 0,
    });
    return res;
  } catch (err) {
    return handleRouteError(err);
  }
}