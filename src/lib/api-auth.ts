import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { verifySessionToken, SessionPayload } from "@/lib/session";
import { sessionCookieName } from "@/lib/env";
import { prisma } from "@/lib/db";
import type { Role, User } from "@prisma/client";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function json(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/** Read & verify the session from a request (server-side, never client-only). */
export async function readSession(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(sessionCookieName())?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/** Require a signed-in user, otherwise throw 401. */
export async function requireSession(req: NextRequest): Promise<SessionPayload> {
  const session = await readSession(req);
  if (!session) throw new ApiError(401, "Authentication required.");
  return session;
}

const SUPER = "SUPER_ADMIN";

export const PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ["*"],
  CONTENT_ADMIN: ["dashboard.view", "content.manage", "media.manage"],
  COMMS_ADMIN: ["dashboard.view", "comms.manage"],
};

/** Permissions that exist only for the founder (SUPER_ADMIN). */
export const FOUNDER_ONLY_PERMISSIONS = [
  "security.manage",
  "security.settings",
  "admins.manage",
];

export function userHasPermission(
  role: string,
  permission: string,
  permissions?: string[],
): boolean {
  if (role === SUPER) return true;
  const granted = permissions && permissions.length > 0 ? permissions : PERMISSIONS[role] ?? [];
  return granted.includes(permission) || granted.includes("*");
}

/**
 * Enforce a permission. `role` and `grantedPermissions` MUST come from a
 * fresh server-side DB lookup — never from the client.
 */
export function requirePermission(
  role: string,
  permission: string,
  grantedPermissions?: string[],
): void {
  if (!userHasPermission(role, permission, grantedPermissions)) {
    throw new ApiError(403, "You do not have permission to perform this action.");
  }
}

/** Maps thrown errors to safe HTTP responses. No internals exposed. */
export function handleRouteError(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    return json({ ok: false, error: err.message }, err.status);
  }
  if (err instanceof ZodError) {
    return json(
      { ok: false, error: "Invalid input.", issues: err.issues },
      422,
    );
  }
  console.error("[api-error]", err);
  return json(
    { ok: false, error: "Something went wrong. Please try again or contact ADAPT Technologies." },
    500,
  );
}

type AdminUser = User & { role: Role };

/**
 * Authenticate + authorise an admin API request with a FRESH server-side
 * lookup. Never trusts the JWT claims alone for permissions.
 */
export async function requireAdminUser(
  req: NextRequest,
  permission?: string,
): Promise<AdminUser> {
  const session = await requireSession(req);
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { role: true },
  });
  if (!user || !user.active) {
    throw new ApiError(401, "Authentication required.");
  }
  if (permission) {
    requirePermission(user.role.name, permission, user.role.permissions);
  }
  return user as AdminUser;
}

export type { AdminUser };