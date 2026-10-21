import { NextRequest } from "next/server";
import { json, handleRouteError, requireAdminUser } from "@/lib/api-auth";
import { assertSameOrigin } from "@/lib/csrf";
import { logActivity } from "@/lib/audit";
import { replyToConversation } from "@/lib/comms/conversations";
import { z } from "zod";

export const runtime = "nodejs";

const replySchema = z.object({
  body: z.string().trim().min(1, "Write a reply before sending.").max(8000),
  internal: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdminUser(req, "comms.manage");
    assertSameOrigin(req);
    const { id } = await ctx.params;
    const payload = await req.json().catch(() => null);
    const parsed = replySchema.safeParse(payload);
    if (!parsed.success) {
      return json({ ok: false, error: "Invalid reply.", issues: parsed.error.issues }, 422);
    }

    const result = await replyToConversation({
      conversationId: id,
      authorId: user.id,
      authorName: user.name,
      authorEmail: user.email,
      body: parsed.data.body,
      internal: parsed.data.internal,
    });

    await logActivity({
      userId: user.id,
      action: parsed.data.internal ? "conversation.note" : "conversation.reply",
      entity: "conversation",
      entityId: id,
      meta: { emailSent: result.emailSent },
    });

    return json({ ok: true, data: { message: result.message, emailSent: result.emailSent } });
  } catch (err) {
    return handleRouteError(err);
  }
}
