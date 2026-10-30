-- AlterTable
ALTER TABLE "MentorProfile" ADD COLUMN     "certificates" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "tools" TEXT[] DEFAULT ARRAY[]::TEXT[];
