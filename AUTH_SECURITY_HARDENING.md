# Authentication Security Hardening Checklist

Use this checklist to improve the password-reset and session-security flow in a deliberate order. Do not mark an item complete until its acceptance criteria and tests are complete.

## 1. Deploy the current password-reset protections

- [x] Reject resetting a password to the account's current password.
- [x] Show the rejection beside the **New Password** field.
- [x] Increment a user's session version whenever their password is reset.
- [x] Reject access and refresh tokens whose session version is no longer current.
- [x] Add automated tests for reuse rejection and stale access/refresh tokens.
- [x] Review and apply the `20261003000000_add_user_session_version` database migration in each environment.
- [ ] Deploy the API and web changes together.
- [ ] Confirm in staging that resetting a password signs the user out in another browser/device.
- [ ] Announce the one-time sign-out of existing users caused by the new token format, if needed.

**Acceptance criteria:** A user cannot reset to their current password; a successful reset makes all previously issued Median access and refresh tokens unusable.

## 2. Make password validation server-owned

- [x] Decide the password policy (recommended: at least 12 characters; allow password-manager generated passphrases).
- [x] Apply the current UI policy in the API for registration and reset endpoints.
- [x] Keep the web form aligned with the API's current policy.
- [x] Avoid relying solely on composition rules such as mandatory symbols; length and compromised-password checks are stronger usability/security trade-offs.
- [x] Add tests that call the API directly with passwords that bypass browser-only validation.

**Acceptance criteria:** A password accepted through the web app is accepted by the API, and an API client cannot bypass the policy.

## 3. Block compromised passwords

- [x] Use Have I Been Pwned's k-anonymity range API; plaintext passwords never leave the API.
- [x] Check passwords during registration and password reset. Apply the same check to the future password-change endpoint.
- [x] Return a clear, non-sensitive message asking the user to choose another password.
- [x] Fail closed with a retry message if the breach-check provider is unavailable.
- [x] Add unit tests for compromised, safe, unavailable-provider, and timeout cases.

**Acceptance criteria:** Known compromised passwords are rejected without being logged or transmitted in plaintext.

## 4. Decide password-history scope

- [x] Use the initial product policy of blocking the current password only; revisit password history if a compliance or product requirement calls for it.
- [ ] If history is required, add a dedicated password-history table that stores password hashes only.
- [ ] Check a proposed password against each stored history hash using constant-time verification.
- [ ] Retain only the configured number of historical hashes; never retain plaintext passwords.
- [ ] Add migration, data-retention, and test coverage.

**Acceptance criteria:** The configured number of recently used passwords cannot be reused, and no plaintext password is stored or logged.

## 5. Add an authenticated change-password flow

- [x] Create a Settings page with a signed-in change-password form.
- [x] Require the current password before accepting a new password.
- [x] Apply the current policy and compromised-password checks. Password history is not enabled under the current policy.
- [x] Increment the session version after a successful change.
- [x] Require a fresh sign-in everywhere after a successful change.
- [x] Add end-to-end tests for success, wrong current password, reuse, and session invalidation.

**Acceptance criteria:** Users can change their password securely without using account recovery.

## 6. Strengthen password-reset operations

- [x] Verify reset tokens are cryptographically random, single-use, and have a documented short expiry.
- [x] Rate-limit reset requests and reset submissions by account and IP address.
- [x] Keep the reset-request response generic so it does not reveal whether an email address has an account.
- [x] Ensure tokens are never included in logs, analytics, error reporting, or referrer headers.
- [x] Add a resend/reset-request cooldown and user-friendly retry guidance.
- [x] Test expired, reused, malformed, and rate-limited tokens.

**Acceptance criteria:** The recovery flow resists account enumeration, token replay, accidental token exposure, and high-volume abuse.

## 7. Notifications, audit trail, and user control

- [x] Send a password-changed email with time, approximate location/device information where available, and recovery instructions.
- [x] Record password resets, password changes, failed recovery attempts, and session invalidations in an audit trail.
- [x] Add a Security page that lets users review and revoke active sessions.
- [x] Define retention and access controls for security-event data.
- [x] Test notification failure handling without preventing a successful security action.

**Acceptance criteria:** Users can detect unexpected password activity and remove access from unwanted sessions.

## 8. Security verification before release

- [x] Run unit, integration, and end-to-end auth tests in CI.
- [x] Add a regression test for every resolved authentication issue.
- [x] Run dependency and secret scanning.
- [x] Perform a focused review of cookies, CORS, CSRF protection, rate limits, and production-only environment variables.
- [ ] Test the full recovery flow in staging using two separate browser profiles.
- [x] Document incident-response steps for a suspected account compromise.

**Acceptance criteria:** The release has passing automated checks, a reviewed threat model, and a reproducible staging verification record.

## Recommended execution order

1. Complete and verify deployment of the current session-invalidation work.
2. Make the API password policy authoritative.
3. Add compromised-password checks.
4. Build the authenticated change-password flow.
5. Decide and implement password history only if the product requires it.
6. Complete reset abuse controls, notifications, session management, and release verification.
