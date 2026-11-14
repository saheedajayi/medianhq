-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'OPERATIONS_ADMIN', 'MODERATION_ADMIN', 'FINANCE_ADMIN', 'SUPPORT_AGENT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "adminRole" "AdminRole";

-- Admins that already exist had full access, so they keep it
UPDATE "User" SET "adminRole" = 'SUPER_ADMIN' WHERE "role" = 'ADMIN';

-- CreateTable
CREATE TABLE "AdminInvite" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "invitedById" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminInvite_tokenHash_key" ON "AdminInvite"("tokenHash");

-- CreateIndex
CREATE INDEX "AdminInvite_email_idx" ON "AdminInvite"("email");

-- AddForeignKey
ALTER TABLE "AdminInvite" ADD CONSTRAINT "AdminInvite_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
