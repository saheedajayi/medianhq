-- Enforce one waitlist registration per email address, regardless of audience.
DROP INDEX IF EXISTS "WaitlistEntry_email_audience_key";
CREATE UNIQUE INDEX "WaitlistEntry_email_key" ON "WaitlistEntry"("email");
