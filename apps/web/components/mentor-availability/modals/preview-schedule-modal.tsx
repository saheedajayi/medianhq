"use client";

import { X } from "lucide-react";
import type { DaySchedule } from "../types";

interface PreviewScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  days: DaySchedule[];
  timezone: string;
}

const SHORT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function PreviewScheduleModal({
  isOpen,
  onClose,
  days,
  timezone,
}: PreviewScheduleModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="relative w-full max-w-[720px] rounded-[24px] bg-white p-7 sm:p-9 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 text-[#98A2B3] hover:text-[#101828] transition-colors p-1"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="text-center pt-2">
          <h2 className="text-2xl font-bold text-[#101828]">
            Your Weekly Schedule
          </h2>
          <p className="mt-2 text-sm text-[#475467] max-w-md mx-auto leading-relaxed">
            This is how mentees see your availability when booking a session with you.
          </p>

          {/* 7 Columns */}
          <div className="mt-8 grid grid-cols-7 gap-2 overflow-x-auto pb-2">
            {days.map((day, idx) => {
              const shortName = SHORT_DAYS[idx] ?? day.name.slice(0, 3);
              const hasSlots = day.isActive && day.slots.length > 0;

              return (
                <div key={day.dayOfWeek} className="flex flex-col items-center gap-2.5 min-w-[70px]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#344054]">
                    {shortName}
                  </span>

                  {hasSlots ? (
                    <div className="flex flex-col gap-2 w-full">
                      {day.slots.map((slot) => (
                        <div key={slot.id} className="flex flex-col gap-1.5">
                          <div className="rounded-xl bg-[#FFF4EF] py-2 px-1 text-center text-xs font-semibold text-[#FF5514]">
                            {slot.startTime}
                          </div>
                          <div className="rounded-xl bg-[#FFF4EF] py-2 px-1 text-center text-xs font-semibold text-[#FF5514]">
                            {slot.endTime}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-[#F9FAFB] border border-[#EAECF0] py-2 px-1 text-center text-[11px] text-[#98A2B3] w-full">
                      No slots
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Timezone */}
          <div className="mt-8 text-center text-xs font-medium text-[#667085]">
            TimeZone: {timezone}
          </div>
        </div>
      </div>
    </div>
  );
}
