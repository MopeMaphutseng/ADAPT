import { prisma } from "@/lib/db";
import { sendNotificationMail, notificationAddress } from "@/lib/mail";
import { getEnv, siteUrl } from "@/lib/env";
import { getSecuritySettings } from "@/lib/security/settings";
import type { Conversation, ConversationMessage } from "@prisma/client";

export type ConversationWithMessages = Conversation & { messages: ConversationMessage[] };

/**
 * Ensures an investor inquiry has a corresponding conversation thread.
 * Idempotent: repeated calls return the same thread.
 */
export async function ensureInvestorConversation(inquiryId: string): Promise<Conversation | null> {
  const inquiry = await prisma.investorInquiry.findUnique({ where: { id: inquiryId } });
  if (!inquiry) return null;

  const existing = await prisma.conversation.findFirst({ where: { investorInquiryId: inquiryId } });
  if (existing) return existing;

  const subject = inquiry.interest?.trim()
    ? `Investment conversation — ${inquiry.interest.trim()}`
    : `Investment conversation — ${inquiry.organization || inquiry.name}`;

  const conversation = await prisma.conversation.create({
    data: {
      kind: "INVESTOR",
      status: "OPEN",
      subject,
      participantName: inquiry.name,
      participantEmail: inquiry.email,
      participantPhone: inquiry.phone,
      participantOrg: inquiry.organization,
      participantCountry: inquiry.country,
      investorType: inquiry.investorType,
      investorInquiryId: inquiryId,
      messages: {
        create: {
          senderRole: "INVESTOR",
          senderName: inquiry.name,
          senderEmail: inquiry.email,
          body: inquiry.message?.trim() || "(No message provided — submitted the investor inquiry form.)",
          emailSent: false,
        },
      },
    },
  });
  return conversation;
}

/** Ensures a contact message has a corresponding conversation thread. */
export async function ensureContactConversation(messageId: string): Promise<Conversation | null> {
  const message = await prisma.contactMessage.findUnique({ where: { id: messageId } });
  if (!message) return null;

  const existing = await prisma.conversation.findFirst({ where: { inquiryId: messageId } });
  if (existing) return existing;

  const conversation = await prisma.conversation.create({
    data: {
      kind: "CONTACT",
      status: "OPEN",
      subject: message.subject,
      participantName: message.name,
      participantEmail: message.email,
      participantPhone: message.phone,
      participantOrg: message.organization,
      inquiryId: messageId,
      messages: {
        create: {
          senderRole: "INVESTOR",
          senderName: message.name,
          senderEmail: message.email,
          body: message.message,
          emailSent: false,
        },
      },
    },
  });
  return conversation;
}

export interface ReplyInput {
  conversationId: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  body: string;
  internal?: boolean;
}

export interface ReplyResult {
  message: ConversationMessage;
  emailSent: boolean;
}

/**
 * Records an admin reply on a conversation and, for non-internal messages,
 * dispatches it to the participant by email. The thread always logs the reply
 * even when SMTP is not configured.
 */
export async function replyToConversation(input: ReplyInput): Promise<ReplyResult> {
  const conversation = await prisma.conversation.findUnique({ where: { id: input.conversationId } });
  if (!conversation) throw new Error("Conversation not found.");

  const internal = Boolean(input.internal);
  const settings = await getSecuritySettings();

  let emailSent = false;
  if (!internal && settings.investorRepliesEnabled) {
    const replyTo = `${getEnv("CONTACT_EMAIL", notificationAddress())}`;
    const portalLine = settings.investorPortalEnabled
      ? `\n\nYou can also continue this conversation here: ${siteUrl()}/investors/portal/${conversation.portalToken}`
      : "";
    emailSent = await sendNotificationMail({
      to: conversation.participantEmail,
      subject: `Re: ${conversation.subject}`,
      text: `${input.body}\n\n—\n${input.authorName}\nADAPT Technologies${portalLine}`,
      html: `<p>${input.body.replace(/</g, "&lt;").replace(/\n/g, "<br/>")}</p><hr/><p><strong>${input.authorName}</strong><br/>ADAPT Technologies</p>${
        settings.investorPortalEnabled
          ? `<p><a href="${siteUrl()}/investors/portal/${conversation.portalToken}">Continue this conversation</a></p>`
          : ""
      }`,
    });
    // Reply-To helps route the investor's reply back into the same context.
    void replyTo;
  }

  const message = await prisma.conversationMessage.create({
    data: {
      conversationId: conversation.id,
      senderRole: internal ? "SYSTEM" : "ADMIN",
      senderName: input.authorName,
      senderEmail: input.authorEmail,
      body: input.body,
      internal,
      emailSent,
      authorId: input.authorId,
    },
  });

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      lastMessageAt: new Date(),
      status: internal ? conversation.status : conversation.status === "CLOSED" ? "OPEN" : conversation.status,
      unreadForAdmin: false,
      unreadForParticipant: internal ? conversation.unreadForParticipant : true,
    },
  });

  return { message, emailSent };
}

/** Conversation by its opaque portal token (for the future investor portal). */
export async function getConversationByToken(token: string): Promise<ConversationWithMessages | null> {
  return prisma.conversation.findUnique({
    where: { portalToken: token },
    include: { messages: { where: { internal: false }, orderBy: { createdAt: "asc" } } },
  });
}

/** Appends a participant (investor) message received via the portal. */
export async function addParticipantMessage(
  token: string,
  body: string,
): Promise<ConversationMessage | null> {
  const conversation = await prisma.conversation.findUnique({ where: { portalToken: token } });
  if (!conversation) return null;

  const message = await prisma.conversationMessage.create({
    data: {
      conversationId: conversation.id,
      senderRole: "INVESTOR",
      senderName: conversation.participantName,
      senderEmail: conversation.participantEmail,
      body,
      emailSent: false,
    },
  });

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      lastMessageAt: new Date(),
      status: conversation.status === "CLOSED" || conversation.status === "ARCHIVED" ? "OPEN" : conversation.status,
      unreadForAdmin: true,
      unreadForParticipant: false,
    },
  });

  // Notify the team that the participant replied.
  void sendNotificationMail({
    to: notificationAddress(),
    subject: `New reply from ${conversation.participantName} — ${conversation.subject}`,
    text: `${conversation.participantName} replied:\n\n${body}`,
    html: `<p><strong>${conversation.participantName}</strong> replied:</p><p>${body
      .replace(/</g, "&lt;")
      .replace(/\n/g, "<br/>")}</p>`,
  });

  return message;
}
