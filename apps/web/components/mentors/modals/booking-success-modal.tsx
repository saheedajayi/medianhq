"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/base/dialog";
import { Calendar } from "lucide-react";
import { SessionPackage } from "../types";

interface BookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentorName: string;
  selectedPackage: SessionPackage;
  dateSlotDisplay: string;
  timeSlotDisplay: string;
  transactionId?: string;
  amountPaidDisplay?: string;
}

export function BookingSuccessModal({
  isOpen,
  onClose,
  mentorName,
  selectedPackage,
  dateSlotDisplay,
  timeSlotDisplay,
  transactionId = "#TXN-2026-0847",
  amountPaidDisplay,
}: BookingSuccessModalProps) {
  const isPaid = selectedPackage.numericPrice > 0;

  // Google Calendar URL generator
  const handleAddToCalendar = () => {
    const title = encodeURIComponent(
      `1:1 Session: ${selectedPackage.title} with ${mentorName}`
    );
    const details = encodeURIComponent(
      `Your mentorship session with ${mentorName} via MedianHQ.\nSession topic: ${selectedPackage.title}`
    );
    const location = encodeURIComponent("MedianHQ Video Call");
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
    window.open(gCalUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="text-xl font-bold text-[#101828]">
            Booking successful
          </DialogTitle>
          <p className="mt-1 text-xs text-[#667085]">
            A confirmation email and calendar invite have been sent to your email.
          </p>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-4 text-left">
          {/* Details Card */}
          <div className="flex flex-col gap-2 rounded-2xl bg-[#F9FAFB] p-4 text-xs">
            {isPaid && (
              <>
                <div className="flex items-center justify-between py-1 text-[#475467]">
                  <span>Transaction ID</span>
                  <span className="font-semibold text-[#101828]">
                    {transactionId}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 text-[#475467]">
                  <span>Amount paid</span>
                  <span className="font-semibold text-[#101828]">
                    {amountPaidDisplay || selectedPackage.price}
                  </span>
                </div>
              </>
            )}

            <div className="flex items-center justify-between py-1 text-[#475467]">
              <span>Session date</span>
              <span className="font-semibold text-[#101828]">
                {dateSlotDisplay}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 text-[#475467]">
              <span>Time</span>
              <span className="font-semibold text-[#101828]">
                {timeSlotDisplay} WAT
              </span>
            </div>

            <div className="flex items-center justify-between py-1 text-[#475467]">
              <span>Mentor</span>
              <span className="font-semibold text-[#101828]">
                {mentorName}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-2 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleAddToCalendar}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-[#EAECF0] bg-white py-3 text-xs font-semibold text-[#344054] shadow-2xs transition-colors hover:bg-[#F9FAFB]"
            >
              <Calendar className="size-4 text-[#475467]" />
              <span>Add to Calendar</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full bg-[#FF5500] py-3 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#E04B00]"
            >
              Back to profile
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
