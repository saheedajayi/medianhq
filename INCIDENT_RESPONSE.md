# Account Compromise Incident Response Plan

## Overview
This document outlines standard operating procedures (SOP) when an account compromise or suspicious authentication activity is reported or detected on Median.

---

## 1. Immediate Containment (Triage)

1. **Invalidate All Sessions Immediately:**
   - Any user can trigger session invalidation from their **Settings** page via **"Sign out of all other sessions"**, or by initiating a **Change Password**.
   - Admins can immediately increment the user's `sessionVersion` in the database:
     ```sql
     UPDATE "User" SET "sessionVersion" = "sessionVersion" + 1 WHERE id = '<USER_ID>';
     ```
   - This instantly revokes all active access tokens and refresh tokens across all devices and browsers.

2. **Revoke Active Password-Reset Tokens:**
   - Delete any outstanding verification tokens for the user's email:
     ```sql
     DELETE FROM "VerificationToken" WHERE email = '<USER_EMAIL>' AND type = 'PASSWORD_RESET';
     ```

3. **Check for Malicious Profile / OAuth Modifications:**
   - Verify if any unauthorized OAuth accounts (Google/LinkedIn) were linked to the user account:
     ```sql
     SELECT id, email, "googleId", "linkedinId", "updatedAt" FROM "User" WHERE id = '<USER_ID>';
     ```
   - Unlink suspicious provider IDs if necessary.

---

## 2. Investigation & Forensic Audit

1. **Review Security Audit Logs:**
   - Check the `SecurityAuditLog` table for the user's ID and email:
     ```sql
     SELECT id, action, status, "ipAddress", "userAgent", "createdAt", metadata
     FROM "SecurityAuditLog"
     WHERE "userId" = '<USER_ID>' OR email = '<USER_EMAIL>'
     ORDER BY "createdAt" DESC
     LIMIT 50;
     ```
   - Identify:
     - Unexpected `PASSWORD_CHANGE` or `PASSWORD_RESET` events.
     - Spikes in `FAILED_RECOVERY` or `RECOVERY_REQUEST`.
     - Geographic or IP anomalies in `ipAddress` and `userAgent`.

2. **Check Email Dispatch Logs:**
   - Confirm whether notification emails (e.g. `password-changed`, `reset-password`) were successfully dispatched by checking Resend logs or API logs.

---

## 3. Recovery & Remediation

1. **Issue Account Recovery:**
   - Send an authenticated reset link to the confirmed legitimate email address of the account owner.
   - Instruct the user to choose a strong, unique passphrase (at least 12 characters, checked against HaveIBeenPwned).

2. **Verify Account Integrity:**
   - Have the user verify their mentor/mentee profile information, bio, and linked payout/payment details to ensure no unauthorized changes were made.

---

## 4. Post-Incident Review

1. Document the root cause (e.g., credential stuffing from external breach, phished credentials, session hijacking).
2. Review rate-limiting thresholds in `AuthRateLimiterService` and adjust if distributed attacks were observed.
3. Archive audit logs related to the incident according to compliance standards.
