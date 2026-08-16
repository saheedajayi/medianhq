"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Calendar, HambergerMenu, Notification, User } from "iconsax-react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { authService } from "@/services/auth";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getAuthDestination } from "@/lib/auth-routing";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    // Lock browser back button on dashboard to prevent navigating back to signin/signup
    window.history.pushState(window.history.state, "", window.location.href);

    const handlePopState = () => {
      window.history.pushState(window.history.state, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    authService
      .me()
      .then((response) => {
        if (isCancelled) return;

        const stage = response.data.accountStage;
        const isAllowedOnDashboard = stage === "READY" || stage === "MENTOR_PENDING";

        if (!isAllowedOnDashboard) {
          const destination = getAuthDestination(response.data);
          router.replace(destination);
          return;
        }

        setIsCheckingAuth(false);
      })
      .catch(() => {
        if (isCancelled) return;
        router.replace("/signin");
      });

    return () => {
      isCancelled = true;
    };
  }, [router]);

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#FAFAFA]">
        <p className="text-sm text-[#667085]">Checking access...</p>
      </div>
    );
  }

  const avatarUrl = user?.menteeProfile?.avatarUrl;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFAFA] text-[#101828]">
      {/* Navigation Sidebar (Desktop + Mobile/Tablet Drawer) */}
      <DashboardSidebar
        isMobileOpen={isMobileNavOpen}
        onMobileClose={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col h-screen overflow-hidden lg:pl-64">
        {/* Top Header Bar */}
        <header className="flex h-16 sm:h-18 shrink-0 items-center justify-between border-b border-[#EAECF0] bg-white px-4 sm:px-8">
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

          {/* Right Action on Tablet and Desktop: Book a Session button */}
          <div className="hidden sm:flex items-center gap-4 ml-auto">
            <Link
              href="/mentee/bookings/new"
              className="inline-flex items-center gap-2 rounded-full bg-[#FF5500] px-5 py-2.5 text-sm font-semibold text-white shadow-2xs transition-all hover:bg-[#E04B00] active:scale-[0.98]"
            >
              <Calendar size="18" variant="Bulk" color="#FFFFFF" className="shrink-0" />
              <span className="text-white">Book a session</span>
            </Link>
          </div>
        </header>

        {/* Dynamic Dashboard Page Content */}
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8 lg:px-10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
