"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Booking } from "./types";
import {
  AvailableDates,
  AvailableDateSlot,
} from "@/components/ui/custom/available-dates";

interface RescheduleSessionModalProps {
  booking: Booking;
  onClose: () => void;
  onConfirmReschedule: (
    bookingId: string,
    newDate: string,
    newTime: string,
    reason: string
  ) => void;
}

const DEFAULT_RESCHEDULE_DATES: AvailableDateSlot[] = [
  {
    dateString: "2026-06-07",
    dayOfWeek: "SUN",
    dayNumber: "07",
    month: "Jun",
    slotsCount: 8,
    times: ["3:00PM", "3:30PM", "4:00PM", "4:30PM", "5:00PM"],
  },
  {
    dateString: "2026-06-08",
    dayOfWeek: "MON",
    dayNumber: "08",
    month: "Jun",
    slotsCount: 8,
    times: ["2:00PM", "2:30PM", "3:00PM", "3:30PM", "4:00PM", "4:30PM"],
  },
  {
    dateString: "2026-06-09",
    dayOfWeek: "TUE",
    dayNumber: "09",
    month: "Jun",
    slotsCount: 6,
    times: ["10:00AM", "11:00AM", "1:00PM", "2:00PM", "3:30PM"],
  },
  {
    dateString: "2026-06-10",
    dayOfWeek: "WED",
    dayNumber: "10",
    month: "Jun",
    slotsCount: 8,
    times: ["1:00PM", "1:30PM", "2:00PM", "3:00PM", "4:30PM"],
  },
  {
    dateString: "2026-06-11",
    dayOfWeek: "THUR",
    dayNumber: "11",
    month: "Jun",
    slotsCount: 8,
    times: ["3:00PM", "3:30PM", "4:00PM", "4:30PM", "5:00PM"],
  },
];

export function RescheduleSessionModal({
  booking,
  onClose,
  onConfirmReschedule,
}: RescheduleSessionModalProps) {
  const [selectedDate, setSelectedDate] = useState<AvailableDateSlot>(
    DEFAULT_RESCHEDULE_DATES[0] as AvailableDateSlot
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    DEFAULT_RESCHEDULE_DATES[0]?.times[0] || "3:00PM"
  );
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedDate = `${selectedDate.dayNumber} ${selectedDate.month}`;
    onConfirmReschedule(booking.id, formattedDate, selectedTime, reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/50 p-4 backdrop-blur-xs">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[24px] bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
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
          Update your session details with your mentor
        </p>

        {/* Current Session Banner */}
        <div className="mt-5 rounded-2xl border border-[#FFCAB6] bg-[#FDF9F6] p-4">
          <p className="text-sm font-semibold text-[#FF5514]">
            {booking.title} with {booking.mentorName}
          </p>
          <p className="mt-1 text-xs text-[#667085]">{booking.fullDateTime}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Reusable Available Dates & Time Slots component */}
          <AvailableDates
            dates={DEFAULT_RESCHEDULE_DATES}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onSelectDate={setSelectedDate}
            onSelectTime={setSelectedTime}
          />

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
              placeholder="Share why you want a reschedule..."
              className="mt-2 w-full resize-none rounded-xl border border-[#EAECF0] p-3 text-xs leading-relaxed text-[#101828] focus:border-[#FF5514] focus:outline-none focus:ring-1 focus:ring-[#FF5514]"
            />
          </div>

          {/* CTA */}
          <button
            type="submit"
            disabled={!selectedTime}
            className="w-full rounded-full bg-[#FF5514] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E04406] disabled:opacity-50 active:scale-[0.99]"
          >
            Confirm reschedule
          </button>
        </form>
      </div>
    </div>
  );
}
