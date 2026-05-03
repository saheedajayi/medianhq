-- CreateEnum
CREATE TYPE "WaitlistAudience" AS ENUM ('MENTEE', 'MENTOR');

-- CreateTable
CREATE TABLE "WaitlistEntry" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "audience" "WaitlistAudience" NOT NULL,
    "location" TEXT,
    "expertise" TEXT NOT NULL,
    "currentRole" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaitlistEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WaitlistEntry_audience_idx" ON "WaitlistEntry"("audience");

-- CreateIndex
CREATE INDEX "WaitlistEntry_createdAt_idx" ON "WaitlistEntry"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistEntry_email_audience_key" ON "WaitlistEntry"("email", "audience");
