import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, handleRouteError, requireAdminUser } from "@/lib/api-auth";
import { assertSameOrigin } from "@/lib/csrf";
import { logActivity } from "@/lib/audit";
import { openAlertCount } from "@/lib/security/alerts";
import { z } from "zod";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req, "security.manage");
    const url = new URL(req.url);
    const status = url.searchParams.get("status")?.trim() || undefined;
    const severity = url.searchParams.get("severity")?.trim() || undefined;

    const alerts = await prisma.securityAlert.findMany({
      where: {
        ...(status ? { status: status as never } : {}),
        ...(severity ? { severity: severity as never } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        user: { select: { id: true, name: true, email: true } },
        acknowledgedBy: { select: { id: true, name: true } },
      },
    });

    return json({ ok: true, data: { alerts, openCount: await openAlertCount() } });
  } catch (err) {
    return handleRouteError(err);
  }
}

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["OPEN", "ACKNOWLEDGED", "RESOLVED", "DISMISSED"]),
  note: z.string().max(1000).optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAdminUser(req, "security.manage");
    assertSameOrigin(req);
    const body = await req.json().catch(() => null);
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return json({ ok: false, error: "Invalid alert update.", issues: parsed.error.issues }, 422);
    }

    const existing = await prisma.securityAlert.findUnique({ where: { id: parsed.data.id } });
    if (!existing) return json({ ok: false, error: "Alert not found." }, 404);

    const mergedMeta =
      parsed.data.note !== undefined
        ? { ...((existing.meta as Record<string, unknown>) ?? {}), note: parsed.data.note }
        : undefined;

    const alert = await prisma.securityAlert.update({
      where: { id: parsed.data.id },
      data: {
        status: parsed.data.status,
        acknowledgedById: user.id,
        acknowledgedAt: new Date(),
        ...(mergedMeta ? { meta: mergedMeta } : {}),
      },
    });

    await logActivity({
      userId: user.id,
      action: "security.alert_update",
      entity: "security_alert",
      entityId: alert.id,
      meta: { status: parsed.data.status, note: parsed.data.note },
    });

    return json({ ok: true, data: alert });
  } catch (err) {
    return handleRouteError(err);
  }
}
