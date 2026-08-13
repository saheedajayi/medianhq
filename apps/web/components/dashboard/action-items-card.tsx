"use client";

import Link from "next/link";
import { ListChecks } from "lucide-react";
import { Calendar } from "iconsax-react";

export function ActionItemsCard() {
  return (
    <div className="flex flex-col justify-between rounded-3xl border border-[#EAECF0] bg-white p-6 md:p-8 shadow-xs min-h-[300px]">
      <h2 className="text-xs font-bold tracking-wider text-[#667085] uppercase">
        Action Items
      </h2>

      <div className="my-6 flex flex-col items-center justify-center text-center">
        {/* Soft orange circle icon container */}
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-[#FFF4ED] text-[#FF5500]">
          <ListChecks className="size-6 stroke-[2]" />
        </div>

        <h3 className="text-lg font-medium text-[#101828]">
          No Action Items Yet
        </h3>

        <p className="mt-1.5 max-w-xs text-sm text-[#475467] leading-relaxed">
          Action items from your sessions will appear here once you complete your first session.
        </p>

        <Link
          href="/mentee/bookings/new"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#FF5500] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#E04B00] active:scale-[0.98]"
        >
          <Calendar size="18" variant="Bulk" color="#FFFFFF" className="shrink-0" />
          <span className="text-white">Book Session</span>
        </Link>
      </div>
    </div>
  );
}
