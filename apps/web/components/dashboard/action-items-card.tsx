"use client";

import Link from "next/link";
import { ListChecks, CheckCircle2, Circle } from "lucide-react";
import { Calendar } from "iconsax-react";
import type { ActionItem } from "@/components/mentee-booking-session/types";

interface ActionItemsCardProps {
  actionItems?: (ActionItem & { mentorName?: string })[];
}

export function ActionItemsCard({ actionItems }: ActionItemsCardProps) {
  const items = actionItems || [];

  if (items.length > 0) {
    return (
      <div className="flex flex-col justify-between rounded-3xl border border-[#EAECF0] bg-white p-6 md:p-8 shadow-xs min-h-[300px]">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold tracking-wider text-[#667085] uppercase">
            Action Items
          </h2>
          <Link
            href="/mentee/booking-session"
            className="text-xs font-semibold text-[#FF5500] hover:underline"
          >
            View in Bookings
          </Link>
        </div>

        <div className="my-4 flex flex-col gap-2.5">
          {items.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-xl border border-[#F2F4F7] bg-[#F9FAFB] p-3.5 transition-colors hover:bg-white"
            >
              <div className="mt-0.5 shrink-0">
                {item.completed ? (
                  <CheckCircle2 className="size-4 text-[#12B76A]" />
                ) : (
                  <Circle className="size-4 text-[#D0D5DD]" />
                )}
              </div>
              <div className="flex flex-col">
                <span className={`text-xs font-medium ${item.completed ? "text-[#98A2B3] line-through" : "text-[#101828]"}`}>
                  {item.text}
                </span>
                {item.mentorName && (
                  <span className="text-[11px] text-[#667085]">
                    From session with {item.mentorName}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-[#F2F4F7] pt-3 flex items-center justify-between">
          <span className="text-xs text-[#667085]">
            {items.filter((i) => !i.completed).length} pending tasks
          </span>
          <Link
            href="/mentee/booking-session"
            className="text-xs font-semibold text-[#FF5500] hover:underline"
          >
            Review all tasks →
          </Link>
        </div>
      </div>
    );
  }

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
          href="/mentee/explore"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#FF5500] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#E04B00] active:scale-[0.98]"
        >
          <Calendar size="18" variant="Bulk" color="#FFFFFF" className="shrink-0" />
          <span className="text-white">Book Session</span>
        </Link>
      </div>
    </div>
  );
}
