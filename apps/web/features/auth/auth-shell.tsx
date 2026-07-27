"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { getAuthDestination, getAuthDestinationPath } from "@/lib/auth-routing";
import { authService } from "@/services/auth";
import { AnimatedAuthCopy } from "./animated-auth-copy";

const GUARDED_PATHS = new Set([
  "/role-selection",
  "/mentee-onboarding",
  "/mentor-onboarding",
]);

export function AuthShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isGuardedPath = GUARDED_PATHS.has(pathname);
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

        const destination = getAuthDestination(response.data);

        if (getAuthDestinationPath(response.data) !== pathname) {
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

        <AnimatedAuthCopy />
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
          <div className="flex min-h-full flex-1 px-5 py-10 sm:px-10">
            <div className="m-auto w-full max-w-[552px]">
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
              <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm">
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
