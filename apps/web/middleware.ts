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
    const [payloadPart] = token.split(".");
    if (!payloadPart) return null;
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

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

  const isAuthPage =
    pathname === "/signin" ||
    pathname === "/signup" ||
    pathname === "/login";

  // If already authenticated and visiting login/signup, redirect to dashboard
  if (isAuthPage && isAccessValid) {
    const destination =
      sessionPayload?.role === "MENTOR" ? "/mentor/sessions" : "/dashboard";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // Protected dashboard routes
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/mentor") ||
    pathname.startsWith("/mentee") ||
    pathname.startsWith("/bookings") ||
    pathname.startsWith("/settings");

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
    const role = sessionPayload.role;
    const stage = sessionPayload.accountStage;

    // Enforce onboarding steps if not yet ready
    if (stage && stage !== "READY" && stage !== "MENTOR_PENDING") {
      if (stage === "EMAIL_VERIFICATION") {
        return NextResponse.redirect(new URL("/email-verification", request.url));
      }
      if (stage === "ROLE_SELECTION") {
        return NextResponse.redirect(new URL("/role-selection", request.url));
      }
      if (stage === "MENTEE_ONBOARDING") {
        return NextResponse.redirect(new URL("/mentee-onboarding", request.url));
      }
      if (stage === "MENTOR_ONBOARDING") {
        return NextResponse.redirect(new URL("/mentor-onboarding", request.url));
      }
    }

    // Role-specific route boundaries
    if (pathname.startsWith("/mentor/") && role !== "MENTOR") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (
      (pathname.startsWith("/mentee/") || pathname === "/explore") &&
      role === "MENTOR"
    ) {
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
