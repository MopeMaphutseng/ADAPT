import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { sessionCookieName, sessionSecret, isProduction } from "@/lib/env";

export const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

export interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
}

const enc = () => new TextEncoder().encode(sessionSecret());
const cookieName = () => sessionCookieName();

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  return new SignJWT({ email: payload.email, name: payload.name, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt(iat)
    .setExpirationTime(iat + SESSION_TTL_SECONDS)
    .sign(enc());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, enc(), { algorithms: ["HS256"] });
    if (!payload.sub) return null;
    return {
      sub: payload.sub,
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
      role: String(payload.role ?? ""),
    };
  } catch {
    return null;
  }
}

export async function getSessionTokenFromCookies(): Promise<string | null> {
  const store = await cookies();
  return store.get(cookieName())?.value ?? null;
}

export async function getSessionUser(): Promise<SessionPayload | null> {
  const token = await getSessionTokenFromCookies();
  if (!token) return null;
  return verifySessionToken(token);
}

/** Removes the session cookie (used by fetch-based requests). */
export class SessionClearError extends Error {}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}