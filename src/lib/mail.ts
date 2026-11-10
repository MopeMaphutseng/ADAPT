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
      requireTLS: getEnv("SMTP_REQUIRE_TLS", "true") !== "false",
      disableFileAccess: true,
      disableUrlAccess: true,
      tls: { minVersion: "TLSv1.2" },
      auth: getEnv("SMTP_USER")
        ? { user: getEnv("SMTP_USER"), pass: getEnv("SMTP_PASSWORD") }
        : undefined,
    });
  }
  return transporter;
}

/** Escapes a value for safe interpolation into an HTML email body. */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Strips CR/LF and control characters so email headers cannot be injected. */
export function sanitizeHeader(value: unknown, fallback = ""): string {
  const v = String(value ?? "")
    .replace(/[\r\n\u0000]+/g, " ")
    .trim();
  return (v || fallback).slice(0, 300);
}

/**
 * Sends an email notification. If SMTP is not configured, the message is
 * logged to the console instead (useful for local development).
 */
export async function sendNotificationMail(opts: MailOptions): Promise<boolean> {
  const t = getTransporter();
  const from =
    getEnv("SMTP_FROM", "ADAPT Technologies <noreply@adapttech.local>") || undefined;
  const to = sanitizeHeader(opts.to);
  const subject = sanitizeHeader(opts.subject, "(no subject)");
  if (!t) {
    console.log("[mail:disabled] would send to %s — subject: %s", to, subject);
    return false;
  }
  try {
    await t.sendMail({
      from: sanitizeHeader(from),
      to,
      subject,
      text: opts.text,
      html: opts.html,
    });
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