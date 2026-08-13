"use client";

import Link from "next/link";
import { Calendar } from "iconsax-react";

interface DashboardGreetingCardProps {
  userName?: string;
  upcomingCount?: number;
}

export function DashboardGreetingCard({
  userName = "",
  upcomingCount = 0,
}: DashboardGreetingCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between md:p-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl tracking-tight sm:text-4xl">
          <span className="font-[family-name:var(--font-neco)] italic font-normal text-[#2C1810]">
            Hello{userName ? "," : ""}
          </span>
          {userName && (
            <span className="font-[family-name:var(--font-neco)] italic font-semibold text-[#FF5500]">
              {" "}{userName}
            </span>
          )}
        </h1>
        <p className="text-sm font-medium text-[#475467] sm:text-base">
          You have {upcomingCount} upcoming {upcomingCount === 1 ? "session" : "sessions"} this month.
        </p>
      </div>

      <Link
        href="/mentee/bookings/new"
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#FF5500] px-5 py-2.5 text-sm font-medium text-white shadow-xs transition-all hover:bg-[#E04B00] active:scale-[0.98]"
      >
        <Calendar size="18" variant="Bulk" color="#FFFFFF" className="shrink-0" />
        <span className="text-white">Book a session</span>
      </Link>
    </div>
  );
}
