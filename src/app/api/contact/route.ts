import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { json, handleRouteError } from "@/lib/api-auth";
import { assertSameOrigin } from "@/lib/csrf";
import { rateLimit, ipFromRequest } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/validation";
import { contactNotification } from "@/lib/mail";
import { ensureContactConversation } from "@/lib/comms/conversations";

export const runtime = "nodejs";

const inquiryTypeSchema = contactSchema.extend({
  inquiryType: z
    .enum([
      "GENERAL",
      "BUSINESS",
      "PARTNERSHIP",
      "INVESTMENT",
      "TECHNOLOGY",
      "MEDIA",
      "CAREERS",
      "OTHER",
    ])
    .optional()
    .or(z.literal("")),
});

export async function POST(req: NextRequest) {
  try {
    assertSameOrigin(req);
    const ip = ipFromRequest(req);
    const rl = rateLimit(`contact:${ip}`, 25, 60 * 60 * 1000);
    if (!rl.allowed) {
      return json(
        { ok: false, error: "Too many messages from your connection. Please try again later." },
        429,
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = inquiryTypeSchema.safeParse(body);
    if (!parsed.success) {
      return json({ ok: false, error: "Please review the form and try again.", issues: parsed.error.issues }, 422);
    }

    const d = parsed.data;
    const message = await prisma.contactMessage.create({
      data: {
        name: d.name,
        email: d.email,
        phone: d.phone || null,
        organization: d.organization || null,
        subject: d.subject,
        message: d.message,
        inquiryType: (d.inquiryType as never) || undefined,
        ip,
        userAgent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
      },
    });

    // Open a two-way conversation thread for this message (best-effort).
    await ensureContactConversation(message.id).catch((err) =>
      console.error("[comms] failed to open contact conversation", err),
    );

    void contactNotification(
      `New Contact Message — ${d.subject}`,
      `From: ${d.name} <${d.email}>\nPhone: ${d.phone || "—"}\nOrganization: ${d.organization || "—"}\nType: ${d.inquiryType || "General"}\n\n${d.message}`,
      `<p><strong>${d.name}</strong> &lt;${d.email}&gt;</p><p>Phone: ${d.phone || "—"} · Organization: ${d.organization || "—"} · Type: ${d.inquiryType || "General"}</p><hr/><p>${d.message.replace(/</g, "&lt;").replace(/\n/g, "<br/>")}</p>`,
    );

    return json({
      ok: true,
      data: { id: message.id, message: "Thank you for contacting ADAPT Technologies. Your message has been received and our team will review it." },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}