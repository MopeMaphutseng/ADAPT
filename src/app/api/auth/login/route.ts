import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, sessionCookieOptions } from "@/lib/session";
import { json, handleRouteError, ApiError } from "@/lib/api-auth";
import { assertSameOrigin } from "@/lib/csrf";
import { rateLimit, ipFromRequest } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";
import { logActivity } from "@/lib/audit";
import { evaluateLoginFailures, raiseAlert } from "@/lib/security/alerts";
import { sessionCookieName } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    assertSameOrigin(req);

    const ip = ipFromRequest(req);
    const rl = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
    if (!rl.allowed) {
      await raiseAlert({
        type: "login_throttled",
        title: `Login attempts throttled for ${ip}`,
        detail: "The IP exceeded the login rate limit and was temporarily blocked.",
        severity: "MEDIUM",
        ip,
      });
      return json(
        { ok: false, error: "Too many login attempts. Please try again later." },
        429,
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return json({ ok: false, error: "Invalid input.", issues: parsed.error.issues }, 422);
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { role: true },
    });

    if (!user || !user.active) {
      await logActivity({ action: "auth.login_failed", meta: { email, reason: "no_user" }, ip });
      await evaluateLoginFailures(ip);
      return json({ ok: false, error: "Invalid email or password." }, 401);
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      await logActivity({ action: "auth.login_failed", meta: { email, reason: "bad_password" }, ip });
      await evaluateLoginFailures(ip);
      return json({ ok: false, error: "Invalid email or password." }, 401);
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const token = await createSessionToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role.name,
    });

    await logActivity({ action: "auth.login", userId: user.id, meta: { email }, ip });

    const res = json({
      ok: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name, role: user.role.name },
      },
    });
    res.cookies.set(sessionCookieName(), token, sessionCookieOptions());
    return res;
  } catch (err) {
    return handleRouteError(err);
  }
}