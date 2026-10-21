import { prisma } from "@/lib/db";
import { getSecuritySettings } from "@/lib/security/settings";
import type { Prisma, SecurityAlertSeverity } from "@prisma/client";

interface RaiseAlertInput {
  type: string;
  title: string;
  detail?: string;
  severity?: SecurityAlertSeverity;
  ip?: string;
  userId?: string;
  meta?: Record<string, unknown>;
}

/**
 * Creates a security alert, honouring the `autoAlerts` switch. Never throws —
 * alerting must not break the request that triggered it.
 */
export async function raiseAlert(input: RaiseAlertInput): Promise<void> {
  try {
    const settings = await getSecuritySettings();
    if (!settings.autoAlerts) return;
    await prisma.securityAlert.create({
      data: {
        type: input.type,
        title: input.title,
        detail: input.detail,
        severity: input.severity ?? "LOW",
        ip: input.ip,
        userId: input.userId,
        meta: (input.meta as Prisma.InputJsonValue) ?? undefined,
      },
    });
  } catch (err) {
    console.error("[security] failed to raise alert", err);
  }
}

/**
 * Counts recent failed logins for an IP and raises a HIGH alert when the
 * threshold from security settings is crossed.
 */
export async function evaluateLoginFailures(ip: string): Promise<void> {
  try {
    const settings = await getSecuritySettings();
    const since = new Date(Date.now() - settings.failedLoginWindowMinutes * 60 * 1000);
    const count = await prisma.activityLog.count({
      where: { action: "auth.login_failed", ip, createdAt: { gte: since } },
    });
    if (count < settings.alertThreshold) return;

    const recent = await prisma.securityAlert.findFirst({
      where: { type: "failed_logins", ip, createdAt: { gte: since } },
    });
    if (recent) return;

    await raiseAlert({
      type: "failed_logins",
      title: `Repeated failed logins from ${ip}`,
      detail: `${count} failed login attempts within ${settings.failedLoginWindowMinutes} minutes.`,
      severity: "HIGH",
      ip,
      meta: { count, windowMinutes: settings.failedLoginWindowMinutes },
    });
  } catch (err) {
    console.error("[security] failed to evaluate login failures", err);
  }
}

export async function openAlertCount(): Promise<number> {
  try {
    return await prisma.securityAlert.count({ where: { status: "OPEN" } });
  } catch {
    return 0;
  }
}
