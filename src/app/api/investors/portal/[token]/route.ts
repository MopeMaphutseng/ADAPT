import { NextRequest } from "next/server";
import { json, handleRouteError } from "@/lib/api-auth";
import { assertSameOrigin } from "@/lib/csrf";
import { rateLimit, ipFromRequest } from "@/lib/rate-limit";
import { getSecuritySettings } from "@/lib/security/settings";
import { addParticipantMessage } from "@/lib/comms/conversations";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  body: z.string().trim().min(1).max(8000),
});

/**
 * Investor portal reply endpoint. Auth is the opaque `portalToken` in the URL,
 * so a signed-in admin session is NOT required. Disabled unless the founder
 * turns on `investorPortalEnabled` in security settings.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  try {
    assertSameOrigin(req);
    const settings = await getSecuritySettings();
    if (!settings.investorPortalEnabled) {
      return json({ ok: false, error: "The investor portal is not enabled." }, 404);
    }

    const ip = ipFromRequest(req);
    const rl = rateLimit(`portal:${ip}`, 20, 60 * 60 * 1000);
    if (!rl.allowed) {
      return json({ ok: false, error: "Too many messages. Please try again later." }, 429);
    }

    const { token } = await ctx.params;
    const payload = await req.json().catch(() => null);
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      return json({ ok: false, error: "Please write a message.", issues: parsed.error.issues }, 422);
    }

    const message = await addParticipantMessage(token, parsed.data.body);
    if (!message) return json({ ok: false, error: "Conversation not found." }, 404);

    return json({ ok: true, data: { id: message.id, createdAt: message.createdAt } });
  } catch (err) {
    return handleRouteError(err);
  }
}
