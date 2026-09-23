import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function decodeJwtPayload(token: string): {
  sub?: string;
  role?: string;
  accountStage?: string;
  exp?: number;
  type?: string;
} | null {
  try {
    const parts = token.split(".");
    // For 2-part tokens (payload.signature), payload is at index 0.
    // For 3-part standard JWTs (header.payload.signature), payload is at index 1.
    const candidates = parts.length === 2 ? [parts[0], parts[1]] : [parts[1], parts[0]];
    for (const part of candidates) {
      if (!part) continue;
      try {
        const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
        const jsonStr = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join(""),
        );
        const parsed = JSON.parse(jsonStr);
        if (parsed && typeof parsed === "object" && ("sub" in parsed || "exp" in parsed)) {
          return parsed;
        }
      } catch {
        // try next candidate
      }
    }
    return null;
  } catch {
    return null;
  }
}

const AUTH_ROUTES = new Set(["/signin", "/signup", "/login"]);
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/mentor",
  "/mentee",
  "/bookings",
  "/settings",
] as const;

const ONBOARDING_REDIRECTS: Record<string, string> = {
  EMAIL_VERIFICATION: "/email-verification",
  ROLE_SELECTION: "/role-selection",
  MENTEE_ONBOARDING: "/mentee-onboarding",
  MENTOR_ONBOARDING: "/mentor-onboarding",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionToken = request.cookies.get("median_session")?.value;
  const refreshToken = request.cookies.get("median_refresh_token")?.value;

  const sessionPayload = sessionToken ? decodeJwtPayload(sessionToken) : null;
  const refreshPayload = refreshToken ? decodeJwtPayload(refreshToken) : null;

  const isAccessValid = Boolean(
    sessionPayload?.exp && sessionPayload.exp * 1000 > Date.now(),
  );
  const isRefreshValid = Boolean(
    refreshPayload?.exp && refreshPayload.exp * 1000 > Date.now(),
  );

  const isAuthenticated = isAccessValid || isRefreshValid;
  const isAuthPage = AUTH_ROUTES.has(pathname);

  // If already authenticated and visiting login/signup, redirect to dashboard
  if (isAuthPage && isAccessValid) {
    const destination =
      sessionPayload?.role === "MENTOR" ? "/mentor/sessions" : "/dashboard";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // Protected dashboard routes
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // If not authenticated, redirect to signin immediately
  if (!isAuthenticated) {
    const signinUrl = new URL("/signin", request.url);
    signinUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signinUrl);
  }

  // If access token is valid, enforce role-based route protection at the edge (<1ms)
  if (isAccessValid && sessionPayload) {
    const { role, accountStage } = sessionPayload;

    // Enforce onboarding steps if not yet ready
    if (accountStage && ONBOARDING_REDIRECTS[accountStage]) {
      return NextResponse.redirect(
        new URL(ONBOARDING_REDIRECTS[accountStage], request.url),
      );
    }

    // Role-specific route boundaries
    if (pathname.startsWith("/mentor/") && role !== "MENTOR") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (pathname.startsWith("/mentee/") && role === "MENTOR") {
      return NextResponse.redirect(new URL("/mentor/sessions", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/mentor/:path*",
    "/mentee/:path*",
    "/bookings/:path*",
    "/settings/:path*",
    "/signin",
    "/signup",
    "/login",
  ],
};
