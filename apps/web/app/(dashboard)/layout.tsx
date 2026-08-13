"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar } from "iconsax-react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { authService } from "@/services/auth";
import { getAuthDestination } from "@/lib/auth-routing";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    authService
      .me()
      .then((response) => {
        if (isCancelled) return;

        if (response.data.accountStage !== "READY") {
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

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFAFA] text-[#101828]">
      {/* Left Navigation Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col h-screen overflow-hidden md:pl-64">
        {/* Top Header Bar */}
        <header className="flex h-18 shrink-0 items-center justify-end border-b border-[#EAECF0] bg-white px-4 sm:px-8">
          <Link
            href="/mentee/bookings/new"
            className="inline-flex items-center gap-2 rounded-full bg-[#FF5500] px-5 py-2.5 text-sm font-semibold text-white shadow-2xs transition-all hover:bg-[#E04B00] active:scale-[0.98]"
          >
            <Calendar size="18" variant="Bulk" color="#FFFFFF" className="shrink-0" />
            <span className="text-white">Book a session</span>
          </Link>
        </header>

        {/* Dynamic Dashboard Page Content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 lg:px-10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

