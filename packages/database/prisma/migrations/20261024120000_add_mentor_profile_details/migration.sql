-- AlterTable
ALTER TABLE "MentorProfile" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "motivation" TEXT;

-- Until now the onboarding answer to "Why do you want to mentor?" was stored in "bio".
-- Keep a copy as the private application answer; "bio" stays as-is until the mentor
-- writes a public bio in the profile update modal.
UPDATE "MentorProfile" SET "motivation" = "bio" WHERE "bio" IS NOT NULL;
