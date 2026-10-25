"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { Booking, ViewerRole } from "./types";

interface CancelSessionModalProps {
  booking: Booking;
  viewerRole: ViewerRole;
  onClose: () => void;
  onConfirmCancel: (bookingId: string, reason: string, note: string) => Promise<void>;
}

export function CancelSessionModal({
  booking,
  viewerRole,
  onClose,
  onConfirmCancel,
}: CancelSessionModalProps) {
  const [reason, setReason] = useState("Schedule conflict");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const isMentor = viewerRole === "mentor";

  const isPending =
    booking.tab === "pending" || booking.status === "awaiting_confirmation";

  // The parent keeps this open until "Back to bookings", so the success state stays visible
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirmCancel(booking.id, reason, note);
      setIsCancelled(true);
    } catch {
      // The parent shows the error; the form stays so the user can retry
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/50 p-4 backdrop-blur-xs">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[24px] bg-white p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full p-1 text-[#667085] transition hover:bg-[#F2F4F7] hover:text-[#101828]"
        >
          <X className="size-5" />
        </button>

        {isCancelled ? (
          /* Cancellation Successful dialog matching Mentee - Cancel Successful for Pending Session.svg */
          <div className="py-6 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-[#101828]">
              Session Cancelled
            </h2>
            <p className="mt-2 text-sm text-[#667085]">
              The session has been cancelled, and {booking.participantName} has been
              notified.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-8 w-full rounded-full bg-[#FF5514] py-3.5 text-sm font-semibold text-white transition hover:bg-[#E04406] active:scale-[0.99]"
            >
              Back to bookings
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold tracking-tight text-[#101828]">
              Cancel Session
            </h2>
            <p className="mt-1 text-sm text-[#667085]">
              {isPending
                ? "Review the cancellation details before you confirm."
                : "Review the cancellation policy before you confirm."}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              {/* Reason Selection */}
              <div>
                <span className="block text-[11px] font-bold tracking-wider text-[#667085] uppercase">
                  REASON
                </span>

                <div className="mt-3 space-y-2.5">
                  {["Schedule conflict", "Emergency", "Other"].map((opt) => {
                    const isSelected = reason === opt;
                    return (
                      <label
                        key={opt}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition ${
                          isSelected
                            ? "border-[#FF5514] bg-[#FDF9F6]/60 ring-1 ring-[#FF5514]"
                            : "border-[#EAECF0] bg-white hover:border-[#D0D5DD]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="cancelReason"
                          value={opt}
                          checked={isSelected}
                          onChange={() => setReason(opt)}
                          className="size-4 accent-[#FF5514]"
                        />
                        <span className="text-xs font-semibold text-[#101828]">
                          {opt}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Optional Note */}
              <div>
                <label
                  htmlFor="cancel-note"
                  className="block text-[11px] font-bold tracking-wider text-[#667085] uppercase"
                >
                  OPTIONAL NOTE
                </label>
                <textarea
                  id="cancel-note"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a short explanation..."
                  className="mt-2 w-full resize-none rounded-xl border border-[#EAECF0] p-3 text-xs leading-relaxed text-[#101828] focus:border-[#FF5514] focus:outline-none focus:ring-1 focus:ring-[#FF5514]"
                />
              </div>

              {/* Cancellation Policy Box (Only for upcoming confirmed/paid sessions) */}
              {isMentor ? (
                <div className="rounded-2xl border border-[#EAECF0] bg-[#FAFAFA] p-4 text-xs leading-relaxed text-[#667085]">
                  {booking.participantName} will be notified straight away and given a full
                  refund within 3-5 business days.
                </div>
              ) : isPending ? (
                <div className="rounded-2xl border border-[#EAECF0] bg-[#FAFAFA] p-4 text-xs leading-relaxed text-[#667085]">
                  Your mentor hasn&apos;t accepted yet, so you&apos;ll get a full refund within 3-5
                  business days.
                </div>
              ) : (
                <div className="rounded-2xl border border-[#EAECF0] bg-[#FAFAFA] p-4">
                  <span className="text-xs font-semibold text-[#344054]">
                    Cancellation policy
                  </span>
                  <div className="mt-3 space-y-3 text-xs">
                    <div className="flex items-start gap-3">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#EAECF0] font-bold text-[10px] text-[#344054]">
                        1
                      </span>
                      <div>
                        <strong className="block font-semibold text-[#101828]">
                          Cancel more than 24 hours before the session
                        </strong>
                        <span className="text-[#667085]">
                          You&apos;ll receive a full refund within 3-5 business
                          days.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#EAECF0] font-bold text-[10px] text-[#344054]">
                        2
                      </span>
                      <div>
                        <strong className="block font-semibold text-[#101828]">
                          Cancel under 24 hours before the session
                        </strong>
                        <span className="text-[#667085]">
                          You&apos;ll receive a 50% refund within 3-5 business
                          days.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#EC221F] py-3.5 text-sm font-semibold text-white transition hover:bg-[#D92D20] active:scale-[0.99] disabled:opacity-60"
              >
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                Confirm cancellation
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
