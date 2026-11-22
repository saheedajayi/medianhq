-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletionScheduledFor" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "MentorProfile" ADD COLUMN     "rejectionSeenAt" TIMESTAMP(3);
