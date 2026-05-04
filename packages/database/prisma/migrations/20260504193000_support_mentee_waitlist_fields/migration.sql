ALTER TABLE "WaitlistEntry"
  ALTER COLUMN "expertise" DROP NOT NULL,
  ALTER COLUMN "company" DROP NOT NULL,
  ADD COLUMN "levelOfExperience" TEXT;
