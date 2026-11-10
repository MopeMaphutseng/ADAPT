import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, handleRouteError } from "@/lib/api-auth";
import { assertSameOrigin } from "@/lib/csrf";
import { rateLimit, ipFromRequest } from "@/lib/rate-limit";
import { investorSchema } from "@/lib/validation";
import { contactNotification, escapeHtml } from "@/lib/mail";
import { ensureInvestorConversation } from "@/lib/comms/conversations";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    assertSameOrigin(req);
    const ip = ipFromRequest(req);
    const rl = rateLimit(`investor:${ip}`, 15, 60 * 60 * 1000);
    if (!rl.allowed) {
      return json(
        { ok: false, error: "Too many submissions from your connection. Please try again later." },
        429,
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = investorSchema.safeParse(body);
    if (!parsed.success) {
      return json({ ok: false, error: "Please review the form and try again.", issues: parsed.error.issues }, 422);
    }

    const d = parsed.data;

    // Durable, per-IP limit (the in-memory limiter is per-instance).
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await prisma.investorInquiry.count({
      where: { ip, createdAt: { gte: hourAgo } },
    });
    if (recentCount >= 15) {
      return json(
        { ok: false, error: "Too many submissions from your connection. Please try again later." },
        429,
      );
    }

    const inquiry = await prisma.investorInquiry.create({
      data: {
        name: d.name,
        organization: d.organization || null,
        email: d.email,
        phone: d.phone || null,
        country: d.country || null,
        investorType: d.investorType,
        interest: d.interest || null,
        message: d.message || null,
        ip,
        userAgent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
      },
    });

    // Open a two-way conversation thread for this inquiry (best-effort).
    await ensureInvestorConversation(inquiry.id).catch((err) =>
      console.error("[comms] failed to open investor conversation", err),
    );

    void contactNotification(
      `New Investor Inquiry — ${d.name}`,
      `From: ${d.name} <${d.email}>\nOrganization: ${d.organization || "—"}\nInvestor Type: ${d.investorType}\nCountry: ${d.country || "—"}\nInterest: ${d.interest || "—"}\n\n${d.message || ""}`,
      `<p><strong>${escapeHtml(d.name)}</strong> &lt;${escapeHtml(d.email)}&gt;</p><p>Organization: ${escapeHtml(d.organization || "—")} · Type: ${escapeHtml(d.investorType)} · Country: ${escapeHtml(d.country || "—")}</p><p>Interest: ${escapeHtml(d.interest || "—")}</p><hr/><p>${escapeHtml(d.message || "").replace(/\n/g, "<br/>")}</p>`,
    );

    return json({
      ok: true,
      data: {
        id: inquiry.id,
        message:
          "Thank you for your interest in ADAPT Technologies. Your inquiry has been received and will be reviewed by the founder.",
      },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}