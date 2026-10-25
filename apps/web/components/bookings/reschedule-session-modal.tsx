"use client";

import { useEffect, useMemo, useState } from "react";
import { useMentorAvailability } from "@/services/bookings/queries/bookings.queries";
import { AvailableDatesSkeleton } from "@/components/ui/custom/available-dates-skeleton";
import { getSlotIso, toAvailableDateSlots } from "./available-slots";
import { Loader2, X } from "lucide-react";
import { Booking, ViewerRole } from "./types";
import {
  AvailableDates,
  AvailableDateSlot,
} from "@/components/ui/custom/available-dates";

interface RescheduleSessionModalProps {
  booking: Booking;
  viewerRole: ViewerRole;
  onClose: () => void;
  onConfirmReschedule: (
    bookingId: string,
    startsAt: string,
    display: { date: string; time: string },
    reason: string
  ) => Promise<void>;
}

export function RescheduleSessionModal({
  booking,
  viewerRole,
  onClose,
  onConfirmReschedule,
}: RescheduleSessionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // The booking's own slot is excluded from conflicts so nearby times stay open
  const { data: availableDays, isLoading } = useMentorAvailability(
    booking.mentorId,
    booking.durationMinutes,
    booking.id
  );
  const dates = useMemo(
    () => toAvailableDateSlots(availableDays),
    [availableDays]
  );
  const [selectedDate, setSelectedDate] = useState<AvailableDateSlot | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");

  // Default to the first open slot once dates load
  useEffect(() => {
    if (selectedDate || dates.length === 0) return;
    setSelectedDate(dates[0]!);
    setSelectedTime(dates[0]!.times[0] ?? "");
  }, [dates, selectedDate]);
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const startsAt = selectedDate ? getSlotIso(selectedDate, selectedTime) : undefined;
    if (!selectedDate || !startsAt) return;
    setIsSubmitting(true);
    await onConfirmReschedule(
      booking.id,
      startsAt,
      { date: `${selectedDate.dayNumber} ${selectedDate.month}`, time: selectedTime },
      reason
    );
    setIsSubmitting(false);
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

        <h2 className="text-2xl font-bold tracking-tight text-[#101828]">
          Reschedule Session
        </h2>
        <p className="mt-1 text-sm text-[#667085]">
          {viewerRole === "mentor"
            ? "Update your session details"
            : "Update your session details with your mentor"}
        </p>

        {/* Current Session Banner */}
        <div className="mt-5 rounded-2xl border border-[#FFCAB6] bg-[#FDF9F6] p-4">
          <p className="text-sm font-semibold text-[#FF5514]">
            {booking.title} with {booking.participantName}
          </p>
          <p className="mt-1 text-xs text-[#667085]">{booking.fullDateTime}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Reusable Available Dates & Time Slots component */}
          {isLoading ? (
            <AvailableDatesSkeleton />
          ) : selectedDate ? (
            <AvailableDates
              dates={dates}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onSelectDate={(date) => {
                setSelectedDate(date);
                setSelectedTime(date.times[0] ?? "");
              }}
              onSelectTime={setSelectedTime}
            />
          ) : (
            <p className="rounded-xl bg-[#F7F8FB] p-4 text-center text-xs text-[#667085]">
              There are no open times in the next two weeks. Try again later, or cancel instead.
            </p>
          )}

          {/* Reason */}
          <div>
            <label
              htmlFor="reschedule-reason"
              className="block text-xs font-semibold text-[#344054]"
            >
              Reason for reschedule *
            </label>
            <textarea
              id="reschedule-reason"
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                viewerRole === "mentor"
                  ? "Share why you're rescheduling..."
                  : "Share why you want a reschedule..."
              }
              className="mt-2 w-full resize-none rounded-xl border border-[#EAECF0] p-3 text-xs leading-relaxed text-[#101828] focus:border-[#FF5514] focus:outline-none focus:ring-1 focus:ring-[#FF5514]"
            />
          </div>

          {/* CTA */}
          <button
            type="submit"
            disabled={!selectedTime || !selectedDate || isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#FF5514] py-3.5 text-sm font-semibold text-white transition hover:bg-[#E04406] disabled:opacity-50 active:scale-[0.99]"
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Confirm reschedule
          </button>
        </form>
      </div>
    </div>
  );
}
