import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, sessionCookieOptions } from "@/lib/session";
import { json, handleRouteError } from "@/lib/api-auth";
import { assertSameOrigin } from "@/lib/csrf";
import { rateLimit, ipFromRequest } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";
import { logActivity } from "@/lib/audit";
import { evaluateLoginFailures, raiseAlert } from "@/lib/security/alerts";
import { getSecuritySettings } from "@/lib/security/settings";
import { sessionCookieName } from "@/lib/env";

export const runtime = "nodejs";

// Used to keep the failure path timing similar when an account does not exist.
const DUMMY_HASH = "$2a$12$kOhjf/A0hWrvw3QCC6okMubK3CCU16kTB9/MfCOtB8SbPY5T2usBq";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    assertSameOrigin(req);

    const ip = ipFromRequest(req);
    const rl = rateLimit(`login:${ip}`, 10, LOGIN_WINDOW_MS);
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
    const emailKey = email.toLowerCase();

    const emailRl = rateLimit(`login:email:${emailKey}`, 10, LOGIN_WINDOW_MS);
    if (!emailRl.allowed) {
      return json(
        { ok: false, error: "Too many login attempts. Please try again later." },
        429,
      );
    }

    // Distributed lockout: the in-memory limiter is per-instance, so consult
    // recent audit rows as well (by IP and by account).
    const settings = await getSecuritySettings();
    const since = new Date(Date.now() - settings.failedLoginWindowMinutes * 60 * 1000);
    const maxFailures = Math.max(1, settings.maxFailedLogins);
    const [ipFailures, accountFailures] = await Promise.all([
      prisma.activityLog.count({
        where: { action: "auth.login_failed", ip, createdAt: { gte: since } },
      }),
      prisma.activityLog.count({
        where: {
          action: "auth.login_failed",
          createdAt: { gte: since },
          meta: { path: ["email"], equals: emailKey },
        },
      }),
    ]);

    if (ipFailures >= maxFailures || accountFailures >= maxFailures) {
      const recent = await prisma.securityAlert.findFirst({
        where: { type: "login_locked", ip, createdAt: { gte: since } },
      });
      if (!recent) {
        await raiseAlert({
          type: "login_locked",
          title: `Login temporarily locked for ${ip}`,
          detail: `${Math.max(ipFailures, accountFailures)} failed attempts within ${settings.failedLoginWindowMinutes} minutes.`,
          severity: "HIGH",
          ip,
          meta: { ipFailures, accountFailures },
        });
      }
      return json(
        { ok: false, error: "Too many failed attempts. Please try again later." },
        429,
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: emailKey },
      include: { role: true },
    });

    // Always run bcrypt so a missing account cannot be distinguished by timing.
    const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);

    if (!user || !user.active || !valid) {
      const reason = !user ? "no_user" : !user.active ? "inactive" : "bad_password";
      await logActivity({
        action: "auth.login_failed",
        meta: { email: emailKey, reason },
        ip,
      });
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

    await logActivity({ action: "auth.login", userId: user.id, meta: { email: emailKey }, ip });

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
