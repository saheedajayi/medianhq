"use client";

import Link from "next/link";
import { Calendar } from "iconsax-react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#101828]">
      {/* Left Navigation Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="pl-64 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 flex h-18 items-center justify-end border-b border-[#EAECF0] bg-white/80 px-8 backdrop-blur-md">
          <Link
            href="/mentee/bookings/new"
            className="inline-flex items-center gap-2 rounded-full bg-[#FF5500] px-5 py-2.5 text-sm font-semibold text-white shadow-2xs transition-all hover:bg-[#E04B00] active:scale-[0.98]"
          >
            <Calendar size="18" variant="Bulk" color="#FFFFFF" className="shrink-0" />
            <span className="text-white">Book a session</span>
          </Link>
        </header>

        {/* Dynamic Dashboard Page Content */}
        <main className="flex-1 px-6 py-6 md:px-8 md:py-8 lg:px-10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
