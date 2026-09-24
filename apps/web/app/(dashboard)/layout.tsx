"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { HambergerMenu, Notification, User } from "iconsax-react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { authService } from "@/services/auth";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getAuthDestination } from "@/lib/auth-routing";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isExploreRoute =
    pathname === "/explore" ||
    pathname === "/mentee/explore" ||
    pathname?.startsWith("/mentors/") ||
    pathname?.startsWith("/mentee/mentors/");
  const isMessagesRoute =
    pathname === "/messages" ||
    pathname === "/mentee/messages" ||
    pathname === "/mentor/messages" ||
    pathname?.startsWith("/messages/");

  const { data: user } = useCurrentUser();
  const [role, setRole] = useState<"MENTEE" | "MENTOR" | "ADMIN" | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const effectiveRole = user?.role ?? role;

  useEffect(() => {
    let isCancelled = false;

    authService
      .me()
      .then((response) => {
        if (isCancelled) return;

        const stage = response.data.accountStage;
        setRole(response.data.role);
        const isAllowedOnDashboard = stage === "READY" || stage === "MENTOR_PENDING";

        if (!isAllowedOnDashboard) {
          const destination = getAuthDestination(response.data);
          router.replace(destination);
          return;
        }

        const mentorRoute = pathname?.startsWith("/mentor/");
        if (mentorRoute && response.data.role !== "MENTOR") {
          router.replace("/dashboard");
          return;
        }
        const menteeRoute = pathname?.startsWith("/mentee/");
        if (menteeRoute && response.data.role === "MENTOR") {
          router.replace("/mentor/sessions");
          return;
        }
      })
      .catch(() => {
        if (isCancelled) return;
        router.replace("/signin");
      });

    return () => {
      isCancelled = true;
    };
  }, [pathname, router]);

  const avatarUrl = user?.menteeProfile?.avatarUrl;
  const isMentor = user?.role === "MENTOR";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F9FAFB] text-[#101828]">
      {/* Navigation Sidebar (Desktop + Mobile/Tablet Drawer) */}
      <DashboardSidebar
        isMobileOpen={isMobileNavOpen}
        onMobileClose={() => setIsMobileNavOpen(false)}
        userRole={effectiveRole}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col h-screen overflow-hidden lg:pl-60">
        {/* Top Header Bar (Mobile & Tablet only, hidden on desktop) */}
        <header className="flex h-16 sm:h-18 shrink-0 items-center justify-between border-b border-[#EAECF0] bg-white px-4 sm:px-8 lg:hidden">
          {/* Mobile Header (< 640px): Logo on Left, Bell + Avatar + Hamburger on Right */}
          <div className="flex w-full items-center justify-between sm:hidden">
            <Link href="/dashboard" className="flex items-center">
              <Image
                src="/median-logo.svg"
                alt="Median Logo"
                width={100}
                height={26}
                className="h-6 w-auto object-contain"
                priority
              />
            </Link>

            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Notifications"
                className="flex size-8 items-center justify-center text-[#344054] transition-colors hover:text-[#101828]"
              >
                <Notification size="20" variant="Outline" color="#344054" />
              </button>

              <div className="relative size-8 overflow-hidden rounded-full border border-[#EAECF0] bg-[#F2F4F7] flex items-center justify-center">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="User avatar"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <User size="18" variant="Outline" color="#667085" />
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                aria-label="Open navigation menu"
                className="flex size-8 items-center justify-center text-[#344054] transition-colors hover:text-[#101828]"
              >
                <HambergerMenu size="22" variant="Linear" color="#344054" />
              </button>
            </div>
          </div>

          {/* Tablet Header (640px to 1024px): Hamburger + Logo on Left, Book a Session on Right */}
          <div className="hidden sm:flex items-center gap-3.5 lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="flex size-9 items-center justify-center rounded-full bg-[#F7F8FB] border border-[#EAECF0] text-[#344054] transition-colors hover:bg-[#EAECF0]"
              aria-label="Open navigation menu"
            >
              <HambergerMenu size="18" variant="Linear" color="#344054" />
            </button>

            <Link href="/dashboard" className="flex items-center">
              <Image
                src="/median-logo.svg"
                alt="Median Logo"
                width={100}
                height={26}
                className="h-6 w-auto object-contain"
                priority
              />
            </Link>
          </div>
        </header>

        {/* Dynamic Dashboard Page Content enclosed in the single curved white canvas */}
        <div className="flex-1 flex flex-col min-h-0 lg:my-2 lg:mr-2 lg:rounded-[20px] lg:border lg:border-[#EAECF0] bg-white overflow-hidden shadow-xs">
          <main
            className={cn(
              "flex-1 flex flex-col min-h-0",
              isMessagesRoute
                ? "p-4 sm:p-6 lg:p-7 overflow-hidden"
                : "overflow-y-auto p-5 sm:p-7 md:p-8"
            )}
          >
            <div
              className={cn(
                "w-full flex-1 flex flex-col min-h-0",
                isMessagesRoute ? "max-w-none" : "mx-auto max-w-7xl min-h-full"
              )}
            >
              {children}
            </div>
          </main>
        </div>

      </div>
    </div>
  );
}
