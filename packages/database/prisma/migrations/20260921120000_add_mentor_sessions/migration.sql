CREATE TABLE "MentorSession" (
  "id" TEXT NOT NULL,
  "mentorId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "durationMinutes" INTEGER NOT NULL,
  "price" INTEGER NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'NGN',
  "type" TEXT NOT NULL DEFAULT 'ONE_ON_ONE',
  "isLive" BOOLEAN NOT NULL DEFAULT false,
  "maxCapacity" INTEGER,
  "flyerUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MentorSession_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "WeeklyAvailability" (
  "id" TEXT NOT NULL,
  "mentorId" TEXT NOT NULL,
  "dayOfWeek" INTEGER NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "WeeklyAvailability_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "WeeklyAvailability_mentorId_dayOfWeek_key" ON "WeeklyAvailability"("mentorId", "dayOfWeek");
CREATE INDEX "MentorSession_mentorId_idx" ON "MentorSession"("mentorId");
ALTER TABLE "MentorSession" ADD CONSTRAINT "MentorSession_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WeeklyAvailability" ADD CONSTRAINT "WeeklyAvailability_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
