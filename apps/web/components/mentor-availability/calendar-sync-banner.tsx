"use client";

import { Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";

interface CalendarSyncBannerProps {
  isGoogleConnected: boolean;
  googleEmail?: string;
  onClick: () => void;
}

export function CalendarSyncBanner({
  isGoogleConnected,
  googleEmail = "abdullah@gmail.com",
  onClick,
}: CalendarSyncBannerProps) {
  if (isGoogleConnected) {
    return (
      <div
        onClick={onClick}
        className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#A6F4C5] bg-[#EDF8F1] px-5 py-4 transition hover:bg-[#E5F5EB] shadow-2xs"
      >
        <div className="flex items-center gap-2.5">
          <CheckCircle2 size={18} className="text-[#12B76A] shrink-0" />
          <span className="text-sm font-semibold text-[#027A48]">
            Google Calendar connected{" "}
            <span className="font-normal text-[#344054]">({googleEmail})</span>
          </span>
        </div>
        <button
          type="button"
          className="text-xs font-semibold text-[#027A48] hover:underline"
        >
          Manage sync
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer items-center gap-4 rounded-2xl border border-[#FFCAB6] bg-[#FDF9F6] p-4 sm:p-5 transition hover:bg-[#FCF4EE] shadow-2xs"
    >
      {/* Peach Circle with Calendar Icon */}
      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#FF5514]/10">
        <CalendarIcon size={22} className="text-[#FF5514]" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm sm:text-base font-bold text-[#101828]">
          Sync your external calendar
        </h3>
        <p className="mt-0.5 text-xs sm:text-sm text-[#667085] leading-relaxed">
          Connect Google Calendar or Outlook to automatically block busy times and avoid double bookings.
        </p>
      </div>
    </div>
  );
}
