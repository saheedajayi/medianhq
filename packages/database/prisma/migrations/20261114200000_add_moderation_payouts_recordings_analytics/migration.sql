-- CreateEnum
CREATE TYPE "ContentFlagType" AS ENUM ('FORUM_POST', 'MESSAGE', 'PROFILE_TEXT');

-- CreateEnum
CREATE TYPE "ContentFlagStatus" AS ENUM ('PENDING', 'FLAGGED', 'REVIEWED', 'ESCALATED', 'REMOVED');

-- CreateEnum
CREATE TYPE "ModerationActionType" AS ENUM ('APPROVE', 'REMOVE', 'ESCALATE', 'WARN_USER');

-- CreateEnum
CREATE TYPE "RecordingStatus" AS ENUM ('RECORDING', 'READY', 'FAILED', 'DELETED');

-- CreateEnum
CREATE TYPE "AnalyticsEventType" AS ENUM ('SEARCH', 'PROFILE_VIEW', 'BOOK_CLICK', 'PAGE_VIEW');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "menteeRecordingConsent" BOOLEAN,
ADD COLUMN     "mentorRecordingConsent" BOOLEAN;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "refundInfoRequestedAt" TIMESTAMP(3),
ADD COLUMN     "refundNote" TEXT,
ADD COLUMN     "refundNoteAt" TIMESTAMP(3),
ADD COLUMN     "refundNoteBy" TEXT;

-- AlterTable
ALTER TABLE "PayoutRequest" ADD COLUMN     "failureReason" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "recipientCode" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedById" TEXT,
ADD COLUMN     "transferCode" TEXT,
ADD COLUMN     "transferReference" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "ContentFlag" (
    "id" TEXT NOT NULL,
    "contentType" "ContentFlagType" NOT NULL,
    "contentId" TEXT NOT NULL,
    "contentField" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "recipientId" TEXT,
    "reason" TEXT NOT NULL,
    "matchedTerms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "ContentFlagStatus" NOT NULL DEFAULT 'PENDING',
    "flaggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "ContentFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationAction" (
    "id" TEXT NOT NULL,
    "flagId" TEXT NOT NULL,
    "action" "ModerationActionType" NOT NULL,
    "adminId" TEXT,
    "adminName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockedTerm" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockedTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionRecording" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "egressId" TEXT NOT NULL,
    "status" "RecordingStatus" NOT NULL DEFAULT 'RECORDING',
    "storageKey" TEXT NOT NULL,
    "sizeBytes" BIGINT,
    "durationSeconds" INTEGER,
    "failureReason" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "deleteAfter" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SessionRecording_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "type" "AnalyticsEventType" NOT NULL,
    "userId" TEXT,
    "visitorId" TEXT,
    "mentorId" TEXT,
    "query" TEXT,
    "filters" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "resultCount" INTEGER,
    "path" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthCheck" (
    "id" TEXT NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "livekitOk" BOOLEAN NOT NULL,
    "livekitMs" INTEGER,
    "paystackOk" BOOLEAN NOT NULL,
    "paystackMs" INTEGER,

    CONSTRAINT "HealthCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PayoutRequest_transferReference_key" ON "PayoutRequest"("transferReference");

-- CreateIndex
CREATE INDEX "PayoutRequest_status_idx" ON "PayoutRequest"("status");

-- CreateIndex
CREATE INDEX "ContentFlag_status_flaggedAt_idx" ON "ContentFlag"("status", "flaggedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ContentFlag_contentType_contentId_contentField_key" ON "ContentFlag"("contentType", "contentId", "contentField");

-- CreateIndex
CREATE INDEX "ModerationAction_createdAt_idx" ON "ModerationAction"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BlockedTerm_term_key" ON "BlockedTerm"("term");

-- CreateIndex
CREATE UNIQUE INDEX "SessionRecording_egressId_key" ON "SessionRecording"("egressId");

-- CreateIndex
CREATE INDEX "SessionRecording_bookingId_idx" ON "SessionRecording"("bookingId");

-- CreateIndex
CREATE INDEX "SessionRecording_status_deleteAfter_idx" ON "SessionRecording"("status", "deleteAfter");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_type_createdAt_idx" ON "AnalyticsEvent"("type", "createdAt");

-- CreateIndex
CREATE INDEX "HealthCheck_checkedAt_idx" ON "HealthCheck"("checkedAt");

-- AddForeignKey
ALTER TABLE "ContentFlag" ADD CONSTRAINT "ContentFlag_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentFlag" ADD CONSTRAINT "ContentFlag_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationAction" ADD CONSTRAINT "ModerationAction_flagId_fkey" FOREIGN KEY ("flagId") REFERENCES "ContentFlag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionRecording" ADD CONSTRAINT "SessionRecording_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- A starting blocklist for the kinds of content the moderation designs show; admins can change it
INSERT INTO "BlockedTerm" ("id", "term", "reason") VALUES
  ('blocked-term-whatsapp', 'whatsapp', 'Personal contact request'),
  ('blocked-term-telegram', 'telegram', 'Personal contact request'),
  ('blocked-term-call-me-on', 'call me on', 'Personal contact request'),
  ('blocked-term-quick-cash', 'quick cash', 'Suspicious and potential scam'),
  ('blocked-term-money-maker', 'money maker', 'Suspicious and potential scam'),
  ('blocked-term-double-your-money', 'double your money', 'Suspicious and potential scam'),
  ('blocked-term-check-out-my', 'check out my', 'Spam/Self Promotion'),
  ('blocked-term-waste-of-time', 'waste of time', 'Hate Speech/ Negative Attitude');
