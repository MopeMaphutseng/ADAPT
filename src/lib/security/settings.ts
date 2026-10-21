import { prisma } from "@/lib/db";

// ---------------------------------------------------------------------------
// Security settings (founder-console only). Stored in their own table so they
// stay separate from public site content.
// ---------------------------------------------------------------------------

export interface SecuritySettings {
  /** Hours a session token stays valid (informational; token TTL is fixed). */
  sessionHours: number;
  /** Lock out an IP after this many failed logins within the window. */
  maxFailedLogins: number;
  /** Failed-login window, in minutes. */
  failedLoginWindowMinutes: number;
  /** Raise an alert when failed logins from one IP exceed this count. */
  alertThreshold: number;
  /** Master switch for creating security alerts automatically. */
  autoAlerts: boolean;
  /** Whether replying to investors is allowed from the console. */
  investorRepliesEnabled: boolean;
  /** Enable the future investor self-service portal links. */
  investorPortalEnabled: boolean;
  /** Require a note whenever an alert is dismissed/resolved. */
  requireAlertAckNote: boolean;
  /** Allowed admin session origins (CSRF host allow-list, informational). */
  allowedHosts: string[];
}

export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  sessionHours: 12,
  maxFailedLogins: 10,
  failedLoginWindowMinutes: 15,
  alertThreshold: 5,
  autoAlerts: true,
  investorRepliesEnabled: true,
  investorPortalEnabled: false,
  requireAlertAckNote: false,
  allowedHosts: ["localhost", "127.0.0.1"],
};

export const SECURITY_SETTING_KEY = "security";

export async function getSecuritySettings(): Promise<SecuritySettings> {
  try {
    const row = await prisma.securitySetting.findUnique({ where: { key: SECURITY_SETTING_KEY } });
    if (!row || typeof row.value !== "object" || Array.isArray(row.value)) {
      return structuredClone(DEFAULT_SECURITY_SETTINGS);
    }
    return { ...DEFAULT_SECURITY_SETTINGS, ...(row.value as Partial<SecuritySettings>) };
  } catch {
    return structuredClone(DEFAULT_SECURITY_SETTINGS);
  }
}

export async function upsertSecuritySettings(
  value: Partial<SecuritySettings>,
  updatedById?: string,
): Promise<SecuritySettings> {
  const merged = { ...(await getSecuritySettings()), ...value };
  await prisma.securitySetting.upsert({
    where: { key: SECURITY_SETTING_KEY },
    create: { key: SECURITY_SETTING_KEY, value: merged as object, updatedById },
    update: { value: merged as object, updatedById },
  });
  return merged;
}
