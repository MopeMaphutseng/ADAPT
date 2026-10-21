import "dotenv/config";
import { beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { createSessionToken } from "@/lib/session";
import { sessionCookieName } from "@/lib/env";

// Clears the test database and seeds roles + a Super Admin.
// Runs once per test file (tests must not rely on cross-file state).

async function wipe() {
  await prisma.$transaction([
    prisma.conversationMessage.deleteMany(),
    prisma.conversation.deleteMany(),
    prisma.securityAlert.deleteMany(),
    prisma.securitySetting.deleteMany(),
    prisma.activityLog.deleteMany(),
    prisma.pageView.deleteMany(),
    prisma.media.deleteMany(),
    prisma.siteSetting.deleteMany(),
    prisma.contactMessage.deleteMany(),
    prisma.investorInquiry.deleteMany(),
    prisma.announcement.deleteMany(),
    prisma.achievement.deleteMany(),
    prisma.project.deleteMany(),
    prisma.user.deleteMany(),
    prisma.role.deleteMany(),
  ]);
}

const ROLE_SEED: { name: "SUPER_ADMIN" | "CONTENT_ADMIN" | "COMMS_ADMIN"; permissions: string[] }[] = [
  { name: "SUPER_ADMIN", permissions: ["*"] },
  { name: "CONTENT_ADMIN", permissions: ["dashboard.view", "content.manage", "media.manage"] },
  { name: "COMMS_ADMIN", permissions: ["dashboard.view", "comms.manage"] },
];

export async function seedRoles() {
  for (const r of ROLE_SEED) {
    await prisma.role.upsert({
      where: { name: r.name },
      create: r,
      update: r,
    });
  }
}

export async function seedAdmin(email = "admin@adapt.test", password = "test-admin-password-123") {
  const role = await prisma.role.findUniqueOrThrow({ where: { name: "SUPER_ADMIN" } });
  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: "Test Admin",
      passwordHash: await hashPassword(password),
      roleId: role.id,
    },
    update: { roleId: role.id, active: true },
  });
  return { user, role };
}

export async function seedRoleUser(
  roleName: "CONTENT_ADMIN" | "COMMS_ADMIN",
  email: string,
  password = "test-role-password-123",
) {
  const role = await prisma.role.findUniqueOrThrow({ where: { name: roleName } });
  const user = await prisma.user.create({
    data: { email, name: `Test ${roleName}`, passwordHash: await hashPassword(password), roleId: role.id },
  });
  return user;
}

export async function tokenFor(userId: string, role: string, email = "admin@adapt.test") {
  return createSessionToken({ sub: userId, email, name: "Test", role });
}

/** Build a NextRequest with a session cookie + CSRF headers for admin routes. */
export function adminRequest(
  url: string,
  token: string,
  init: { method?: string; body?: unknown } = {},
) {
  const headers: Record<string, string> = {
    "x-adapt-requested-with": "adapt-client",
    origin: "http://localhost:3000",
    host: "localhost:3000",
    cookie: `${sessionCookieName()}=${token}`,
  };
  if (init.body !== undefined) headers["content-type"] = "application/json";
  return new NextRequest(url, {
    method: init.method ?? "POST",
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
}

/** Build a public (no-session) request, optionally with CSRF headers. */
export function publicRequest(
  url: string,
  init: { method?: string; body?: unknown; withOrigin?: boolean; withHeader?: boolean } = {},
) {
  const headers: Record<string, string> = {};
  if (init.withHeader) headers["x-adapt-requested-with"] = "adapt-client";
  if (init.withOrigin) {
    headers.origin = "http://localhost:3000";
    headers.host = "localhost:3000";
  }
  if (init.body !== undefined) headers["content-type"] = "application/json";
  return new NextRequest(url, {
    method: init.method ?? "POST",
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
}

export const BASE = "http://localhost:3000";

beforeAll(async () => {
  await wipe();
  await seedRoles();
});

afterAll(async () => {
  await prisma.$disconnect();
});