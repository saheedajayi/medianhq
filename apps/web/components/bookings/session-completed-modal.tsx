"use client";

import { X } from "lucide-react";
import { Booking, ViewerRole } from "./types";

interface SessionCompletedModalProps {
  booking: Booking;
  viewerRole: ViewerRole;
  onBackToBookings: () => void;
}

export function SessionCompletedModal({
  booking,
  viewerRole,
  onBackToBookings,
}: SessionCompletedModalProps) {
  const isMentor = viewerRole === "mentor";
  const showEarnings = isMentor && booking.earnings && booking.price !== "Free";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-[24px] bg-white p-8 text-center animate-in fade-in zoom-in-95 duration-200">
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
          {isMentor
            ? `Your review and action items have been sent to ${booking.participantName}.`
            : `Thanks for reviewing your session with ${booking.participantName}.`}
        </p>

        {showEarnings && (
          <div className="mt-6 rounded-2xl bg-[#F7F8FB] p-4">
            <p className="text-xs font-medium text-[#344054]">Your earnings from this session</p>
            <p className="mt-1 text-2xl font-bold text-[#FF5514]">{booking.earnings!.net}</p>
            <p className="mt-1 text-[11px] text-[#667085]">
              After Median&apos;s 4% + ₦100 fee ({booking.earnings!.platformFee})
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onBackToBookings}
          className="mt-8 w-full rounded-full bg-[#FF5514] py-3.5 text-sm font-semibold text-white transition hover:bg-[#E04406] active:scale-[0.99]"
        >
          Back to bookings
        </button>
      </div>
    </div>
  );
}
