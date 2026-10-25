-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BookingStatus" ADD VALUE 'PENDING_CONFIRMATION';
ALTER TYPE "BookingStatus" ADD VALUE 'DECLINED';
ALTER TYPE "BookingStatus" ADD VALUE 'EXPIRED';
ALTER TYPE "BookingStatus" ADD VALUE 'NO_SHOW';

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "cancelledBy" "UserRole",
ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "menteeJoinedAt" TIMESTAMP(3),
ADD COLUMN     "mentorJoinedAt" TIMESTAMP(3),
ADD COLUMN     "mentorSessionId" TEXT,
ADD COLUMN     "noShowParty" TEXT,
ADD COLUMN     "respondBy" TIMESTAMP(3),
ADD COLUMN     "title" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "refundAmount" INTEGER,
ADD COLUMN     "refundReference" TEXT,
ADD COLUMN     "refundStatus" TEXT,
ADD COLUMN     "refundedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "MentorEarning" ADD COLUMN     "grossAmount" INTEGER,
ADD COLUMN     "platformFee" INTEGER;

-- CreateTable
CREATE TABLE "MenteeFeedback" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "actionItems" JSONB NOT NULL DEFAULT '[]',
    "followUpNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenteeFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MenteeFeedback_bookingId_key" ON "MenteeFeedback"("bookingId");

-- CreateIndex
CREATE INDEX "Booking_mentorId_startsAt_idx" ON "Booking"("mentorId", "startsAt");

-- CreateIndex
CREATE INDEX "Booking_status_respondBy_idx" ON "Booking"("status", "respondBy");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_mentorSessionId_fkey" FOREIGN KEY ("mentorSessionId") REFERENCES "MentorSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenteeFeedback" ADD CONSTRAINT "MenteeFeedback_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenteeFeedback" ADD CONSTRAINT "MenteeFeedback_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

