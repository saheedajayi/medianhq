# Authentication & Onboarding Flow Audit & Checklist

This document tracks all identified bugs, edge cases, and incomplete features across Median's authentication and onboarding flows. Each item includes its severity, affected files, description, and resolution status so we can resolve and verify them sequentially.

---

## 🚨 Priority 1: Critical Bugs (Blocking Core User Flow)

- [x] **1. Stale Session Cookie Causing Infinite Redirect Loop (`/dashboard` <-> `/role-selection`)** [RESOLVED]
  - **Severity:** Critical (Blocks onboarding completion for all new users)
  - **Affected Files:**
    - [`apps/api/src/modules/users/users.controller.ts`](file:///Users/admin/medianhq/apps/api/src/modules/users/users.controller.ts)
    - [`apps/api/src/modules/mentees/mentees.controller.ts`](file:///Users/admin/medianhq/apps/api/src/modules/mentees/mentees.controller.ts)
    - [`apps/api/src/modules/mentors/mentors.controller.ts`](file:///Users/admin/medianhq/apps/api/src/modules/mentors/mentors.controller.ts)
    - [`apps/web/middleware.ts`](file:///Users/admin/medianhq/apps/web/middleware.ts)
  - **Issue:**
    1. During signup and email verification, `median_session` JWT cookie is issued with `accountStage: "ROLE_SELECTION"` and `role: null`.
    2. When the user selects a role (`PATCH /api/v1/users/me/role`) or completes mentee onboarding (`POST /api/v1/mentees/profile`), the database updates, but the `median_session` cookie is **never re-issued or refreshed**.
    3. When the user is directed to `/dashboard`, Next.js `middleware.ts` decodes the cookie at the edge, sees `accountStage === "ROLE_SELECTION"`, and redirects to `/role-selection`.
    4. On `/role-selection`, `AuthShell` calls `/auth/me` (which reads the database where stage is `READY`), and redirects back to `/dashboard`.
    5. This triggers an **infinite redirect loop**.
    6. For Mentors: `role` in the JWT cookie remains `null`, causing `middleware.ts` to block `/mentor/*` routes (`role !== "MENTOR"`).
  - **Fix Strategy:** Re-issue the session cookie upon updating role and profile creation, and/or call `authService.refresh()` immediately on the frontend after role/profile mutations.

---

- [x] **2. Missing Email Parameter Breaks `/email-verification`** [RESOLVED]
  - **Severity:** Critical (Blocks email verification on direct navigation or middleware redirect)
  - **Affected Files:**
    - [`apps/web/app/(auth)/email-verification/page.tsx`](file:///Users/admin/medianhq/apps/web/app/(auth)/email-verification/page.tsx)
    - [`apps/web/features/auth/email-verification-page.tsx`](file:///Users/admin/medianhq/apps/web/features/auth/email-verification-page.tsx)
    - [`apps/web/middleware.ts`](file:///Users/admin/medianhq/apps/web/middleware.ts)
  - **Issue:**
    1. `email-verification/page.tsx` relies exclusively on `searchParams.email`.
    2. If `middleware.ts` redirects an unverified user to `/email-verification`, or if the user visits the page directly, `searchParams.email` is undefined.
    3. The page renders with a blank email, and both "Continue" (submit) and "Resend Code" submit empty email strings (`""`), resulting in `BadRequestException: Enter a valid email address.`
  - **Fix Strategy:** If `email` prop is missing from search params, fetch the current user's email via `authService.me()` or populate it from the session token.

---

## ⚠️ Priority 2: High Severity Bugs

- [x] **3. Mobile Keyboard Incompatibility with Hexadecimal OTP Verification Codes** [RESOLVED]
  - **Severity:** High (Mobile users cannot type letters in the verification code)
  - **Affected Files:**
    - [`apps/api/src/modules/auth/auth.service.ts`](file:///Users/admin/medianhq/apps/api/src/modules/auth/auth.service.ts#L89)
    - [`apps/web/features/auth/email-verification-page.tsx`](file:///Users/admin/medianhq/apps/web/features/auth/email-verification-page.tsx#L128)
  - **Issue:**
    1. Backend generates a 3-byte hexadecimal code: `randomBytes(3).toString('hex').toUpperCase()` (e.g. `A1B2C3`).
    2. `InputOTP` on mobile defaults to `inputMode="numeric"`, which displays a numeric-only keypad (0-9). The user cannot type letters A–F.
    3. If typed in lowercase on desktop (`a1b2c3`), backend compares strictly with uppercase `A1B2C3` and rejects the valid code.
  - **Fix Strategy:**
    - Either switch backend generation to standard 6-digit numeric OTP (e.g. `123456`), or set `inputMode="text"` on `InputOTP`.
    - Always `.toUpperCase().trim()` on both frontend and backend before comparing.

---

- [x] **4. Email Case-Sensitivity Inconsistency Across Auth Endpoints** [RESOLVED]
  - **Severity:** High (Users with capitalized emails fail verification or password reset)
  - **Affected Files:**
    - [`apps/api/src/modules/auth/auth.service.ts`](file:///Users/admin/medianhq/apps/api/src/modules/auth/auth.service.ts)
  - **Issue:**
    1. `normalizeEmail` (`trim().toLowerCase()`) is only called in `register()` and `login()`.
    2. In `verifyEmail()`, `resendVerification()`, and `forgotPassword()`, `dto.email` is queried directly without normalization.
    3. If mobile keyboards auto-capitalize the first letter (e.g., `User@example.com`), database lookups fail to find the user.
  - **Fix Strategy:** Apply `this.normalizeEmail(dto.email)` in `verifyEmail`, `resendVerification`, and `forgotPassword`.

---

- [x] **5. Multi-Step Mentor Onboarding Form Wiped on Page Reload** [RESOLVED]
  - **Severity:** High (Data loss and partial/corrupted profile submission)
  - **Affected Files:**
    - [`apps/web/features/auth/mentor-onboarding-page.tsx`](file:///Users/admin/medianhq/apps/web/features/auth/mentor-onboarding-page.tsx)
  - **Issue:**
    1. Step 1 values (`currentRole`, `company`, `industry`, `experience`, `location`) are stored only in React component `useState`.
    2. Moving to Step 2 navigates to `/mentor-onboarding?step=2`.
    3. If the user refreshes or reloads on Step 2, React state resets to `""`.
    4. Submitting Step 2 persists empty strings for mandatory fields like `industry` and `experience`.
  - **Fix Strategy:** Persist draft onboarding data in `sessionStorage` or `localStorage` across steps, or merge into a unified step state with fallback.

---

## 🟡 Priority 3: Medium Bugs & UX Issues

- [x] **6. Inescapable Loop on "Back" Button from `/role-selection`** [RESOLVED]
  - **Severity:** Medium (Broken navigation button)
  - **Affected Files:**
    - [`apps/web/features/auth/auth-shell.tsx`](file:///Users/admin/medianhq/apps/web/features/auth/auth-shell.tsx#L29)
  - **Issue:**
    1. `STEP_PREVIOUS_ROUTE["/role-selection"]` is set to `"/signin"`.
    2. Clicking "Back" sends an authenticated user to `/signin`.
    3. `LoginPage` detects the active session and immediately redirects back to `/role-selection`.
  - **Fix Strategy:** Hide the "Back" button on `/role-selection` (as it is the first post-auth onboarding step) or provide a logout option.

---

- [x] **7. Redirection Destination Discrepancy for `MENTOR_PENDING`** [RESOLVED]
  - **Severity:** Medium (Inconsistent routing behavior)
  - **Affected Files:**
    - [`apps/api/src/modules/auth/auth.controller.ts`](file:///Users/admin/medianhq/apps/api/src/modules/auth/auth.controller.ts#L216)
    - [`apps/web/lib/auth-routing.ts`](file:///Users/admin/medianhq/apps/web/lib/auth-routing.ts#L27)
  - **Issue:**
    1. Backend `getDestination()` routes `MENTOR_PENDING` to `/mentor-submitted`.
    2. Frontend `getAuthDestination()` routes `MENTOR_PENDING` to `/dashboard`.
    3. OAuth login routes pending mentors to `/mentor-submitted`, while email/password login routes them to `/dashboard`.
  - **Fix Strategy:** Standardize destination logic so pending mentors consistently land on the designated screen (e.g. `/dashboard` with status card or `/mentor-submitted`).

---

## ⚙️ Priority 4: Incomplete Features in the Auth Flow

- [x] **8. Missing `/login` Route Redirect in Next.js** [RESOLVED]
  - **Severity:** Low
  - **Affected Files:**
    - [`apps/web/next.config.js`](file:///Users/admin/medianhq/apps/web/next.config.js)
  - **Issue:** Navigating to `/login` yields 404 because the route is named `/signin`.
  - **Fix Strategy:** Add a permanent redirect or rewrite in `next.config.js` from `/login` to `/signin`.

---

- [x] **9. OAuth (Google & LinkedIn) Real Credentials & Error Handling** [RESOLVED]
  - **Severity:** Medium
  - **Affected Files:**
    - [`apps/api/src/modules/auth/guards/oauth.guard.ts`](file:///Users/admin/medianhq/apps/api/src/modules/auth/guards/oauth.guard.ts)
    - [`apps/api/src/modules/auth/filters/oauth-exception.filter.ts`](file:///Users/admin/medianhq/apps/api/src/modules/auth/filters/oauth-exception.filter.ts)
    - [`apps/api/src/modules/auth/auth.controller.ts`](file:///Users/admin/medianhq/apps/api/src/modules/auth/auth.controller.ts)
    - [`apps/api/src/modules/auth/auth.service.ts`](file:///Users/admin/medianhq/apps/api/src/modules/auth/auth.service.ts)
    - [`apps/web/features/auth/login-page.tsx`](file:///Users/admin/medianhq/apps/web/features/auth/login-page.tsx)
    - [`apps/web/features/auth/signup-page.tsx`](file:///Users/admin/medianhq/apps/web/features/auth/signup-page.tsx)
  - **Issue:**
    1. In development, placeholder client credentials caused OAuth provider error pages instead of a graceful message.
    2. If OAuth failed, was denied/cancelled, or returned an error, NestJS returned a raw JSON 401 error page instead of redirecting the user back to the application.
  - **Resolution:**
    - Implemented `GoogleOAuthGuard` and `LinkedInOAuthGuard` with early configuration validation; if credentials are placeholders or unconfigured, it gracefully redirects to `/signin?error=...` rather than hitting broken provider 400 pages.
    - Implemented `OAuthExceptionFilter` on both initiation and callback endpoints to catch all OAuth exceptions (e.g. `access_denied`, user cancellation, network errors) and redirect to `${baseUrl}/signin?error=...`.
    - Added email normalization in `oauthLogin` so linking existing accounts works case-insensitively.
    - Added `errorParam` search parameter listeners with toast notifications on both `/signin` and `/signup`.

---

- [x] **10. Edge Middleware Protection for Onboarding Routes** [RESOLVED]
  - **Severity:** Low / Optimization
  - **Affected Files:**
    - [`apps/web/middleware.ts`](file:///Users/admin/medianhq/apps/web/middleware.ts#L124)
  - **Issue:** Onboarding routes (`/role-selection`, `/mentee-onboarding`, `/mentor-onboarding`, etc.) are not in the Next.js middleware matcher, relying solely on client-side React hydration to guard against unauthorized access.
  - **Fix Strategy:** Include onboarding routes in the middleware matcher for edge-level authorization.

---

- [x] **11. Confirm Password Field on Set New Password Page** [RESOLVED]
  - **Severity:** Low / UX
  - **Affected Files:**
    - [`apps/web/features/auth/new-password-page.tsx`](file:///Users/admin/medianhq/apps/web/features/auth/new-password-page.tsx)
  - **Issue:** Page only has one password field without a confirmation input.
  - **Fix Strategy:** Add a "Confirm password" field with schema matching validation.

---

- [x] **12. Password Reset Token Pre-Validation** [RESOLVED]
  - **Severity:** Low / UX
  - **Affected Files:**
    - [`apps/api/src/modules/auth/auth.service.ts`](file:///Users/admin/medianhq/apps/api/src/modules/auth/auth.service.ts)
    - [`apps/api/src/modules/auth/auth.controller.ts`](file:///Users/admin/medianhq/apps/api/src/modules/auth/auth.controller.ts)
    - [`apps/web/services/auth/index.ts`](file:///Users/admin/medianhq/apps/web/services/auth/index.ts)
    - [`apps/web/features/auth/new-password-page.tsx`](file:///Users/admin/medianhq/apps/web/features/auth/new-password-page.tsx)
    - [`apps/web/next.config.js`](file:///Users/admin/medianhq/apps/web/next.config.js)
  - **Issue:** If a reset link is expired or invalid, the user previously only found out after typing and submitting new passwords.
  - **Resolution:**
    - Added `GET /api/v1/auth/reset-password/validate?token=...` endpoint and `authService.validateResetToken(token)` method on the backend.
    - Updated `NewPasswordPage` to validate the token on mount: renders a loading state while verifying, and displays an immediate, user-friendly "Reset Link Invalid or Expired" card with a "Request a new link" action button if the token is invalid or expired.
    - Added redirect from `/forgot-password` to `/reset-password` in `next.config.js`.
