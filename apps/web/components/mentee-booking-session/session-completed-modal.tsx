"use client";

import { X } from "lucide-react";
import { Booking } from "./types";

interface SessionCompletedModalProps {
  booking: Booking;
  onBackToBookings: () => void;
}

export function SessionCompletedModal({
  booking,
  onBackToBookings,
}: SessionCompletedModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-[24px] bg-white p-8 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onBackToBookings}
          className="absolute right-6 top-6 rounded-full p-1 text-[#667085] transition hover:bg-[#F2F4F7] hover:text-[#101828]"
        >
          <X className="size-5" />
        </button>

        <h3 className="mt-2 text-2xl font-bold tracking-tight text-[#55241B]">
          Session Completed
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[#667085]">
          Your review and action items have been sent to {booking.mentorName}.
        </p>

        <button
          type="button"
          onClick={onBackToBookings}
          className="mt-8 w-full rounded-full bg-[#FF5514] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E04406] active:scale-[0.99]"
        >
          Back to bookings
        </button>
      </div>
    </div>
  );
}
