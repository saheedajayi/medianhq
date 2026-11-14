-- AlterTable
ALTER TABLE "User" ADD COLUMN     "flaggedAt" TIMESTAMP(3),
ADD COLUMN     "suspendedAt" TIMESTAMP(3),
ADD COLUMN     "suspensionReason" TEXT;
