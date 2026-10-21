import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { getEnv, contactEmail } from "@/lib/env";

interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const host = getEnv("SMTP_HOST");
  if (!host) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port: Number(getEnv("SMTP_PORT", "587")),
      secure: getEnv("SMTP_SECURE", "false") === "true",
      auth: getEnv("SMTP_USER")
        ? { user: getEnv("SMTP_USER"), pass: getEnv("SMTP_PASSWORD") }
        : undefined,
    });
  }
  return transporter;
}

/**
 * Sends an email notification. If SMTP is not configured, the message is
 * logged to the console instead (useful for local development).
 */
export async function sendNotificationMail(opts: MailOptions): Promise<boolean> {
  const t = getTransporter();
  const from =
    getEnv("SMTP_FROM", "ADAPT Technologies <noreply@adapttech.local>") || undefined;
  if (!t) {
    console.log("[mail:disabled] would send to %s — subject: %s", opts.to, opts.subject);
    return false;
  }
  try {
    await t.sendMail({ from, ...opts });
    return true;
  } catch (err) {
    console.error("[mail:error]", err);
    return false;
  }
}

export function notificationAddress(): string {
  return getEnv("CONTACT_EMAIL", contactEmail());
}

export function contactNotification(subject: string, text: string, html: string) {
  return sendNotificationMail({
    to: notificationAddress(),
    subject,
    text,
    html,
  });
}