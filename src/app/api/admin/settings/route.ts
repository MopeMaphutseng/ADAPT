import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, handleRouteError, requireAdminUser } from "@/lib/api-auth";
import { assertSameOrigin } from "@/lib/csrf";
import { getAllSettings, upsertSetting, SETTING_KEYS } from "@/lib/settings";
import { logActivity } from "@/lib/audit";
import { z } from "zod";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req);
    const settings = await getAllSettings();
    return json({ ok: true, data: settings });
  } catch (err) {
    return handleRouteError(err);
  }
}

const sectionSchema = z.object({
  key: z.enum(SETTING_KEYS),
  value: z.record(z.string(), z.unknown()),
});

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAdminUser(req);
    assertSameOrigin(req);
    const body = await req.json().catch(() => null);
    const parsed = sectionSchema.safeParse(body);
    if (!parsed.success) return json({ ok: false, error: "Invalid settings payload.", issues: parsed.error.issues }, 422);

    await upsertSetting(parsed.data.key, parsed.data.value, user.id);
    await logActivity({
      userId: user.id, action: "settings.update", entity: "site_setting",
      entityId: parsed.data.key,
    });

    const settings = await getAllSettings();
    return json({ ok: true, data: settings });
  } catch (err) {
    return handleRouteError(err);
  }
}