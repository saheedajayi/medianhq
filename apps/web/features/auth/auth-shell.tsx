"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { getAuthDestination, getAuthDestinationPath } from "@/lib/auth-routing";
import { authService } from "@/services/auth";
import { AnimatedAuthCopy } from "./animated-auth-copy";
import { OnboardingProvider, useOnboarding } from "./onboarding-context";
import { OnboardingSidebar } from "./onboarding-sidebar";

const PUBLIC_AUTH_PATHS = new Set([
  "/signin",
  "/login",
  "/signup",
  "/register",
  "/forgot-password",
  "/reset-password",
]);

const GUARDED_PATHS = new Set([
  "/signin",
  "/login",
  "/signup",
  "/register",
  "/email-verification",
  "/forgot-password",
  "/reset-password",
  "/role-selection",
  "/mentee-onboarding",
  "/mentor-onboarding",
  "/mentor-matches",
  "/mentor-submitted",
]);

const ONBOARDING_PATHS = new Set([
  "/role-selection",
  "/mentee-onboarding",
  "/mentor-onboarding",
  "/mentor-matches",
  "/mentor-submitted",
]);

const STEP_PREVIOUS_ROUTE: Record<string, string> = {
  "/mentee-onboarding": "/role-selection",
  "/mentor-onboarding": "/role-selection",
  "/mentor-matches": "/mentee-onboarding",
  "/mentor-submitted": "/mentor-onboarding",
};

const ONBOARDING_STAGES = new Set([
  "ROLE_SELECTION",
  "MENTEE_ONBOARDING",
  "MENTOR_ONBOARDING",
  "MENTOR_PENDING",
]);

function AuthShellInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step");
  const router = useRouter();
  const { setRole } = useOnboarding();
  const isGuardedPath = GUARDED_PATHS.has(pathname);
  const isOnboardingPath = ONBOARDING_PATHS.has(pathname);
  
  let previousRoute = STEP_PREVIOUS_ROUTE[pathname];
  if (pathname === "/mentor-onboarding" && stepParam === "2") {
    previousRoute = "/mentor-onboarding";
  } else if (pathname === "/mentor-submitted") {
    previousRoute = "/mentor-onboarding?step=2";
  }

  const [checkedPath, setCheckedPath] = useState<string | null>(null);
  const isCheckingAccess = isGuardedPath && checkedPath !== pathname;

  useEffect(() => {
    if (!isGuardedPath) {
      return;
    }

    let isCancelled = false;

    authService
      .me()
      .then((response) => {
        if (isCancelled) {
          return;
        }

        if (response.data.role === "MENTEE" || response.data.role === "MENTOR") {
          setRole(response.data.role);
        }

        const destination = getAuthDestination(response.data);
        const destinationPath = getAuthDestinationPath(response.data);

        const isAllowedOnboardingNavigation =
          ONBOARDING_PATHS.has(pathname) &&
          ONBOARDING_STAGES.has(response.data.accountStage);

        if (destinationPath !== pathname && !isAllowedOnboardingNavigation) {
          router.replace(destination);
          return;
        }

        setCheckedPath(pathname);
      })
      .catch(() => {
        if (!isCancelled) {
          if (PUBLIC_AUTH_PATHS.has(pathname)) {
            setCheckedPath(pathname);
          } else {
            router.replace("/signin");
          }
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isGuardedPath, pathname, router, setRole]);

  return (
    <main className="grid h-svh min-h-0 overflow-hidden bg-[#FFFAF5] text-[#141c2e] lg:grid-cols-[40%_60%]">
      {/* Left panel */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-[#350b09] p-10 text-white lg:flex">
        <Link href="/" className="relative z-10 flex items-center gap-2">
          <Image
            src="/auth/auth-logo-white.svg"
            alt="Median Logo"
            width={120}
            height={32}
            priority
            className="h-8 w-auto"
          />
        </Link>
        <AnimatedAuthCopy />
        <footer className="relative z-10 text-xs font-normal text-[#e4e7ec]">
          © {new Date().getFullYear()} Median, Inc. All rights reserved.
        </footer>
      </section>

      {/* Right panel */}
      <section className="relative flex h-full flex-col overflow-y-auto bg-[#FFFAF5]">
        <header className="flex h-20 items-center justify-between px-6 sm:px-12">
          {isOnboardingPath && previousRoute ? (
            <Link
              href={previousRoute}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#475467] hover:text-[#101828]"
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
          ) : (
            <div />
          )}

          {!isOnboardingPath && (
            <p className="text-sm font-normal text-[#344054]">
              {pathname === "/signin" || pathname === "/login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="font-medium text-primary hover:underline"
                  >
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link
                    href="/signin"
                    className="font-medium text-primary hover:underline"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </p>
          )}
        </header>

        <div className="flex flex-1 items-center justify-center px-4 pb-12 pt-4 sm:px-10">
          <div className="w-full max-w-[520px]">
            {isOnboardingPath && (
              <div className="mb-8">
                <OnboardingSidebar />
              </div>
            )}
            <div className="rounded-3xl bg-white p-6 sm:p-10 shadow-sm border border-[#f3e8df]">
              {isCheckingAccess ? (
                <div className="flex justify-center py-12">
                  <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : (
                children
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <OnboardingProvider>
      <AuthShellInner>{children}</AuthShellInner>
    </OnboardingProvider>
  );
}
