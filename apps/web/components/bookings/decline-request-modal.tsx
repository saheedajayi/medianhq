"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { Booking } from "./types";

interface DeclineRequestModalProps {
  booking: Booking;
  onClose: () => void;
  onConfirmDecline: (bookingId: string, reason: string) => Promise<void>;
}

const REASONS = ["Not available at this time", "Outside my expertise", "Other"];

export function DeclineRequestModal({ booking, onClose, onConfirmDecline }: DeclineRequestModalProps) {
  const [reason, setReason] = useState(REASONS[0]!);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onConfirmDecline(booking.id, note.trim() ? `${reason}: ${note.trim()}` : reason);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/50 p-4 backdrop-blur-xs">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[24px] bg-white p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-6 top-6 rounded-full p-1 text-[#667085] transition hover:bg-[#F2F4F7] hover:text-[#101828]"
        >
          <X className="size-5" />
        </button>

        <h2 className="text-2xl font-bold tracking-tight text-[#101828]">Decline request</h2>
        <p className="mt-1 text-sm text-[#667085]">
          {booking.title} with {booking.participantName} · {booking.fullDateTime}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#667085]">
              REASON
            </span>
            <div className="mt-3 space-y-2.5">
              {REASONS.map((option) => {
                const isSelected = reason === option;
                return (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition ${
                      isSelected
                        ? "border-[#FF5514] bg-[#FDF9F6]/60 ring-1 ring-[#FF5514]"
                        : "border-[#EAECF0] bg-white hover:border-[#D0D5DD]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="declineReason"
                      value={option}
                      checked={isSelected}
                      onChange={() => setReason(option)}
                      className="size-4 accent-[#FF5514]"
                    />
                    <span className="text-xs font-semibold text-[#101828]">{option}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="decline-note"
              className="block text-[11px] font-bold uppercase tracking-wider text-[#667085]"
            >
              NOTE TO {booking.participantName.split(" ")[0]?.toUpperCase()} (OPTIONAL)
            </label>
            <textarea
              id="decline-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Suggest another time or mentor..."
              className="mt-2 w-full resize-none rounded-xl border border-[#EAECF0] p-3 text-xs leading-relaxed text-[#101828] focus:border-[#FF5514] focus:outline-none focus:ring-1 focus:ring-[#FF5514]"
            />
          </div>

          <div className="rounded-2xl border border-[#EAECF0] bg-[#FAFAFA] p-4 text-xs leading-relaxed text-[#667085]">
            {booking.participantName} will be notified and given a full refund.
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#EC221F] py-3.5 text-sm font-semibold text-white transition hover:bg-[#D92D20] active:scale-[0.99] disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Decline request
          </button>
        </form>
      </div>
    </div>
  );
}
