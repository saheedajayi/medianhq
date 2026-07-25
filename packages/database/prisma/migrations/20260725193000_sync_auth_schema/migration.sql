-- Allow users created through OAuth or before role selection.
ALTER TABLE "User"
  ALTER COLUMN "passwordHash" DROP NOT NULL,
  ALTER COLUMN "role" DROP NOT NULL;

-- Add OAuth provider identifiers.
ALTER TABLE "User"
  ADD COLUMN "googleId" TEXT,
  ADD COLUMN "linkedinId" TEXT;

CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
CREATE UNIQUE INDEX "User_linkedinId_key" ON "User"("linkedinId");

-- Add tokens used for email verification and password resets.
CREATE TYPE "TokenType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');

CREATE TABLE "VerificationToken" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "type" "TokenType" NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VerificationToken_token_idx" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_email_type_key"
  ON "VerificationToken"("email", "type");
