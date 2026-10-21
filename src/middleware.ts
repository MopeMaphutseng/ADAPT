import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { sessionCookieName, sessionSecret } from "@/lib/env";

const enc = () => new TextEncoder().encode(sessionSecret());

async function isAuthenticated(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(sessionCookieName())?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, enc(), { algorithms: ["HS256"] });
    return Boolean(payload.sub);
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = await isAuthenticated(req);

  // Admin API — never allow anonymous access (defence-in-depth; each route also checks).
  if (pathname.startsWith("/api/admin") && !authed) {
    return NextResponse.json(
      { ok: false, error: "Authentication required." },
      { status: 401 },
    );
  }

  // Admin pages (except the login page) — require a session.
  const isAdminPage = /^\/admin(\/|$)/.test(pathname) && pathname !== "/admin/login";
  if (isAdminPage && !authed) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};