"use client";

import Link from "next/link";
import { Calendar } from "iconsax-react";
import { Skeleton } from "@/components/ui/base/skeleton";

interface DashboardGreetingCardProps {
  userName?: string;
  upcomingCount?: number;
  /** Bookings are still loading, so the count isn't known yet */
  isLoading?: boolean;
  showBookButton?: boolean;
}

export function DashboardGreetingCard({
  userName = "",
  upcomingCount = 0,
  isLoading = false,
  showBookButton = true,
}: DashboardGreetingCardProps) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 md:p-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl tracking-tight sm:text-4xl">
          <span className="font-[family-name:var(--font-neco)] italic font-normal text-[#2C1810]">
            Hello{userName || isLoading ? "," : ""}
          </span>
          {!userName && isLoading && (
            <Skeleton className="ml-2 inline-block h-8 w-40 align-middle" />
          )}
          {userName && (
            <span className="font-[family-name:var(--font-neco)] italic font-semibold text-[#FF5500]">
              {" "}{userName}
            </span>
          )}
        </h1>
        {isLoading ? (
          <Skeleton className="mt-1 h-5 w-64" />
        ) : (
          <p className="text-sm font-medium text-[#475467] sm:text-base">
            You have {upcomingCount} upcoming {upcomingCount === 1 ? "session" : "sessions"} this month.
          </p>
        )}
      </div>

      {showBookButton && (
        <Link
          href="/mentee/explore"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#FF5500] px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-[#E04B00] active:scale-[0.98] sm:px-5 sm:py-2.5 sm:text-sm"
        >
          <Calendar size="18" variant="Bulk" color="#FFFFFF" className="shrink-0" />
          <span className="text-white">Book a session</span>
        </Link>
      )}
    </div>
  );
}
