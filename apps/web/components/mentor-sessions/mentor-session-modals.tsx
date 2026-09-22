"use client";

import * as React from "react";

interface DeleteSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
  sessionTitle?: string;
  pendingBookingsCount?: number;
}

export function DeleteSessionModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
  pendingBookingsCount = 2,
}: DeleteSessionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in-0 duration-200">
      <div className="relative w-full max-w-[480px] rounded-[28px] bg-white p-8 sm:p-10 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
        <h3 className="text-2xl sm:text-[28px] font-bold text-[#D92D20] tracking-tight">
          Delete this Session?
        </h3>

        <p className="mt-3 text-sm sm:text-base text-[#475467] leading-relaxed">
          This session will be made unavailable for new bookings. You still need to
          complete your {pendingBookingsCount} pending bookings before it is fully deactivated.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full rounded-full bg-[#D92D20] py-3.5 text-sm font-semibold text-white transition hover:bg-[#B42318] disabled:opacity-50 shadow-xs cursor-pointer"
          >
            {isDeleting ? "Deleting..." : "Delete session"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full rounded-full border border-[#D0D5DD] bg-white py-3.5 text-sm font-semibold text-[#344054] transition hover:bg-[#F9FAFB] cursor-pointer"
          >
            Keep session
          </button>
        </div>
      </div>
    </div>
  );
}

interface SessionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "live" | "updated";
  onViewSession: () => void;
  onSecondaryAction: () => void;
}

export function SessionSuccessModal({
  isOpen,
  type,
  onViewSession,
  onSecondaryAction,
}: SessionSuccessModalProps) {
  if (!isOpen) return null;

  const isLive = type === "live";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in-0 duration-200">
      <div className="relative w-full max-w-[480px] rounded-[28px] bg-white p-8 sm:p-10 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
        <h3 className="text-2xl sm:text-[28px] font-bold text-[#3E0A00] tracking-tight">
          {isLive ? "Your session is live" : "Session Updated"}
        </h3>

        <p className="mt-3 text-sm sm:text-base text-[#475467] leading-relaxed">
          {isLive
            ? "Mentees can now discover your sessions and book time with you."
            : "Your changes have been saved successfully. Mentees will now see the updated session details."}
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={onViewSession}
            className="w-full rounded-full bg-[#FF5514] py-3.5 text-sm font-semibold text-white transition hover:bg-[#E0480F] shadow-xs cursor-pointer"
          >
            View session
          </button>
          <button
            type="button"
            onClick={onSecondaryAction}
            className="w-full rounded-full border border-[#D0D5DD] bg-white py-3.5 text-sm font-semibold text-[#344054] transition hover:bg-[#F9FAFB] cursor-pointer"
          >
            {isLive ? "Create another session" : "Back to sessions"}
          </button>
        </div>
      </div>
    </div>
  );
}
