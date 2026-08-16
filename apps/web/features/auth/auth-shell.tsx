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

const GUARDED_PATHS = new Set([
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
    if (!isOnboardingPath && !isGuardedPath) {
      return;
    }

    // Trap browser back button so user cannot navigate backward out of onboarding
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isOnboardingPath, isGuardedPath]);

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
          router.replace("/signin");
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isGuardedPath, pathname, router]);

  return (
    <main className="grid h-svh min-h-0 overflow-hidden bg-white text-[#141c2e] lg:grid-cols-[40%_60%]">
      <aside className="relative hidden h-svh min-h-0 overflow-hidden bg-primary px-10 py-14 text-white lg:flex lg:flex-col xl:px-20 xl:pt-[120px] xl:pb-20">
        <Link href="/" aria-label="Median home" className="relative z-10 w-fit">
          <Image
            src="/auth/auth-logo-white.svg"
            alt="Median"
            width={224}
            height={45}
            priority
            className="h-auto w-[190px] xl:w-[224px]"
          />
        </Link>

        <Image
          src="/auth/auth-bg-sidebar.svg"
          alt=""
          width={564}
          height={386}
          className="pointer-events-none absolute bottom-0 left-[6.6%] z-0 h-auto w-[93.4%] max-w-none select-none opacity-[0.15]"
        />

        {isOnboardingPath ? <OnboardingSidebar /> : <AnimatedAuthCopy />}
      </aside>

      <section className="relative flex h-svh min-h-0 flex-col overflow-hidden bg-[#FFFAF5]">
        <Image
          src="/auth/auth-bg-left-mobile.svg"
          alt=""
          width={325}
          height={318}
          unoptimized
          className="pointer-events-none absolute bottom-0 left-0 z-0 h-auto w-[280px] select-none opacity-[0.04] lg:hidden"
        />
        <Image
          src="/auth/auth-bg-right.svg"
          alt=""
          width={324}
          height={318}
          className="pointer-events-none absolute right-0 bottom-0 z-0 hidden h-auto w-[280px] select-none sm:block xl:w-[324px]"
        />

        <div className="relative z-10 flex h-full flex-col overflow-y-auto overscroll-contain">
          <div className="flex min-h-full flex-1 px-4 py-8 sm:px-10">
            <div className="m-auto w-full max-w-[552px] min-w-0 overflow-hidden">
              <div className="mb-8 flex w-full justify-center lg:hidden">
                <Link href="/" aria-label="Median home">
                  <Image
                    src="/auth/auth-logo-orange.svg"
                    alt="Median"
                    width={168}
                    height={30}
                    priority
                    className="h-auto w-[160px]"
                  />
                </Link>
              </div>
              {previousRoute && (
                <button
                  type="button"
                  onClick={() => router.replace(previousRoute)}
                  className="mb-4 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[#344054] transition-colors hover:text-[#111827]"
                >
                  <ArrowLeft className="size-4" />
                  Back
                </button>
              )}
              <div className="rounded-3xl bg-white p-4 sm:p-8 shadow-sm w-full max-w-full min-w-0 overflow-hidden">
                {isCheckingAccess ? (
                  <p className="py-10 text-center text-sm text-[#667085]">
                    Checking your account…
                  </p>
                ) : (
                  children
                )}
              </div>
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
