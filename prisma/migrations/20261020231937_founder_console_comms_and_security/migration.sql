-- CreateEnum
CREATE TYPE "ConversationKind" AS ENUM ('INVESTOR', 'CONTACT');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('OPEN', 'PENDING', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SenderRole" AS ENUM ('INVESTOR', 'ADMIN', 'SYSTEM');

-- CreateEnum
CREATE TYPE "SecurityAlertSeverity" AS ENUM ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "SecurityAlertStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "kind" "ConversationKind" NOT NULL DEFAULT 'INVESTOR',
    "status" "ConversationStatus" NOT NULL DEFAULT 'OPEN',
    "subject" TEXT NOT NULL,
    "participantName" TEXT NOT NULL,
    "participantEmail" TEXT NOT NULL,
    "participantPhone" TEXT,
    "participantOrg" TEXT,
    "participantCountry" TEXT,
    "investorType" TEXT,
    "inquiryId" TEXT,
    "investorInquiryId" TEXT,
    "portalToken" TEXT NOT NULL,
    "assignedToId" TEXT,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unreadForAdmin" BOOLEAN NOT NULL DEFAULT true,
    "unreadForParticipant" BOOLEAN NOT NULL DEFAULT false,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderRole" "SenderRole" NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderEmail" TEXT,
    "body" TEXT NOT NULL,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "internal" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityAlert" (
    "id" TEXT NOT NULL,
    "severity" "SecurityAlertSeverity" NOT NULL DEFAULT 'LOW',
    "status" "SecurityAlertStatus" NOT NULL DEFAULT 'OPEN',
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT,
    "ip" TEXT,
    "userId" TEXT,
    "meta" JSONB,
    "acknowledgedById" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecuritySetting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecuritySetting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_inquiryId_key" ON "Conversation"("inquiryId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_investorInquiryId_key" ON "Conversation"("investorInquiryId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_portalToken_key" ON "Conversation"("portalToken");

-- CreateIndex
CREATE INDEX "Conversation_status_lastMessageAt_idx" ON "Conversation"("status", "lastMessageAt");

-- CreateIndex
CREATE INDEX "Conversation_kind_lastMessageAt_idx" ON "Conversation"("kind", "lastMessageAt");

-- CreateIndex
CREATE INDEX "Conversation_participantEmail_idx" ON "Conversation"("participantEmail");

-- CreateIndex
CREATE INDEX "ConversationMessage_conversationId_createdAt_idx" ON "ConversationMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "SecurityAlert_status_createdAt_idx" ON "SecurityAlert"("status", "createdAt");

-- CreateIndex
CREATE INDEX "SecurityAlert_severity_createdAt_idx" ON "SecurityAlert"("severity", "createdAt");

-- CreateIndex
CREATE INDEX "SecurityAlert_type_createdAt_idx" ON "SecurityAlert"("type", "createdAt");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMessage" ADD CONSTRAINT "ConversationMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMessage" ADD CONSTRAINT "ConversationMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityAlert" ADD CONSTRAINT "SecurityAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityAlert" ADD CONSTRAINT "SecurityAlert_acknowledgedById_fkey" FOREIGN KEY ("acknowledgedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecuritySetting" ADD CONSTRAINT "SecuritySetting_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
