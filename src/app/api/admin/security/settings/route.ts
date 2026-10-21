import { NextRequest } from "next/server";
import { json, handleRouteError, requireAdminUser } from "@/lib/api-auth";
import { assertSameOrigin } from "@/lib/csrf";
import { logActivity } from "@/lib/audit";
import { getSecuritySettings, upsertSecuritySettings } from "@/lib/security/settings";
import { z } from "zod";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req, "security.settings");
    return json({ ok: true, data: await getSecuritySettings() });
  } catch (err) {
    return handleRouteError(err);
  }
}

const schema = z.object({
  sessionHours: z.coerce.number().int().min(1).max(72).optional(),
  maxFailedLogins: z.coerce.number().int().min(3).max(100).optional(),
  failedLoginWindowMinutes: z.coerce.number().int().min(1).max(1440).optional(),
  alertThreshold: z.coerce.number().int().min(1).max(100).optional(),
  autoAlerts: z.boolean().optional(),
  investorRepliesEnabled: z.boolean().optional(),
  investorPortalEnabled: z.boolean().optional(),
  requireAlertAckNote: z.boolean().optional(),
  allowedHosts: z.array(z.string().min(1).max(253)).max(50).optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAdminUser(req, "security.settings");
    assertSameOrigin(req);
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return json({ ok: false, error: "Invalid security settings.", issues: parsed.error.issues }, 422);
    }

    const settings = await upsertSecuritySettings(parsed.data, user.id);
    await logActivity({
      userId: user.id,
      action: "security.settings_update",
      entity: "security_setting",
      meta: parsed.data,
    });

    return json({ ok: true, data: settings });
  } catch (err) {
    return handleRouteError(err);
  }
}
