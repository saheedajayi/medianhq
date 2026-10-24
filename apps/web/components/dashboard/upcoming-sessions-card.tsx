"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar } from "iconsax-react";
import { Clock } from "lucide-react";
import type { Booking } from "@/components/mentee-booking-session/types";

interface UpcomingSessionsCardProps {
  sessions?: Booking[];
}

export function UpcomingSessionsCard({ sessions }: UpcomingSessionsCardProps) {
  const upcomingList = sessions || [];

  if (upcomingList.length > 0) {
    return (
      <div className="flex flex-col justify-between rounded-3xl border border-[#EAECF0] bg-white p-6 md:p-8 shadow-xs min-h-[300px]">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold tracking-wider text-[#667085] uppercase">
            Upcoming Sessions
          </h2>
          <Link
            href="/mentee/booking-session"
            className="text-xs font-semibold text-[#FF5500] hover:underline"
          >
            View all ({upcomingList.length})
          </Link>
        </div>

        <div className="my-4 flex flex-col gap-3">
          {upcomingList.slice(0, 2).map((session) => (
            <div
              key={session.id}
              className="flex flex-col gap-3 rounded-2xl border border-[#EAECF0] bg-[#F9FAFB] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="relative size-11 shrink-0 overflow-hidden rounded-full border border-white shadow-2xs">
                  <Image
                    src={session.mentorAvatar || "/default-avatar.svg"}
                    alt={session.mentorName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#101828]">
                    {session.mentorName}
                  </h4>
                  <p className="text-xs text-[#667085]">
                    {session.title || session.mentorRole}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-[#475467]">
                    <Clock className="size-3 text-[#FF5500]" />
                    <span>{session.relativeDate || session.timeFormatted} · {session.duration || "30 mins"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/mentee/booking-session"
                  className="rounded-full bg-[#FF5500] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#E04B00]"
                >
                  {session.isReadyToJoin ? "Join Session" : "View Details"}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-[#F2F4F7] pt-3 flex items-center justify-between">
          <span className="text-xs text-[#667085]">Need another session?</span>
          <Link
            href="/mentee/explore"
            className="text-xs font-semibold text-[#FF5500] hover:underline"
          >
            Book with a mentor →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between rounded-3xl border border-[#EAECF0] bg-white p-6 md:p-8 shadow-xs min-h-[300px]">
      <h2 className="text-xs font-bold tracking-wider text-[#667085] uppercase">
        Upcoming Sessions
      </h2>

      <div className="my-6 flex flex-col items-center justify-center text-center">
        {/* Soft orange circle icon container */}
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-[#FFF4ED]">
          <Calendar size="28" variant="Bulk" color="#FF5500" />
        </div>

        <h3 className="text-lg font-medium text-[#101828]">
          No Upcoming Sessions
        </h3>

        <p className="mt-1.5 max-w-xs text-sm text-[#475467] leading-relaxed">
          Complete your profile and book a session with a mentor to get started.
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
