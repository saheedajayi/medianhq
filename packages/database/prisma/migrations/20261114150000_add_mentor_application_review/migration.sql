-- AlterTable
ALTER TABLE "MentorProfile" ADD COLUMN     "decidedAt" TIMESTAMP(3),
ADD COLUMN     "reviewChecklist" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "reviewNote" TEXT,
ADD COLUMN     "reviewNoteAt" TIMESTAMP(3),
ADD COLUMN     "reviewNoteBy" TEXT,
ADD COLUMN     "reviewerId" TEXT,
ADD COLUMN     "submittedAt" TIMESTAMP(3);

-- Existing applications have no recorded submission time; their last update is the closest record
UPDATE "MentorProfile" SET "submittedAt" = "updatedAt" WHERE "status" <> 'DRAFT';

-- CreateIndex
CREATE INDEX "MentorProfile_status_submittedAt_idx" ON "MentorProfile"("status", "submittedAt");

-- AddForeignKey
ALTER TABLE "MentorProfile" ADD CONSTRAINT "MentorProfile_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
