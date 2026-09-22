"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AvailableTimeSlotsProps {
  times: string[];
  selectedTime: string;
  onSelectTime: (time: string) => void;
  title?: string;
  className?: string;
  pageSize?: number;
}

export function AvailableTimeSlots({
  times = [],
  selectedTime,
  onSelectTime,
  title = "Available time slots",
  className,
  pageSize = 4,
}: AvailableTimeSlotsProps) {
  const [offset, setOffset] = useState(0);

  const maxOffset = Math.max(0, times.length - pageSize);
  const canPrev = offset > 0;
  const canNext = offset < maxOffset;

  const handlePrev = () => {
    setOffset((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setOffset((prev) => Math.min(maxOffset, prev + 1));
  };

  const visibleTimes = times.slice(offset, offset + pageSize);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-[#101828]">{title}</h4>
        {times.length > pageSize && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrev}
              disabled={!canPrev}
              aria-label="Previous time slots"
              className={cn(
                "flex size-7 items-center justify-center rounded-lg border border-[#EAECF0] bg-white transition hover:bg-[#F9FAFB]",
                canPrev
                  ? "text-[#344054] hover:text-[#101828] hover:border-[#D0D5DD]"
                  : "cursor-not-allowed text-[#D0D5DD] opacity-40 border-transparent bg-transparent"
              )}
            >
              <ChevronLeft className="size-4 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!canNext}
              aria-label="Next time slots"
              className={cn(
                "flex size-7 items-center justify-center rounded-lg border border-[#EAECF0] bg-white transition hover:bg-[#F9FAFB]",
                canNext
                  ? "text-[#344054] hover:text-[#101828] hover:border-[#D0D5DD]"
                  : "cursor-not-allowed text-[#D0D5DD] opacity-40 border-transparent bg-transparent"
              )}
            >
              <ChevronRight className="size-4 stroke-[2.5]" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {visibleTimes.map((time) => {
          const isSelected = selectedTime === time;
          return (
            <button
              key={time}
              type="button"
              onClick={() => onSelectTime(time)}
              aria-pressed={isSelected}
              className={cn(
                "flex h-[59px] w-full items-center justify-center rounded-[12px] border text-sm font-bold tracking-tight transition-all active:scale-[0.98]",
                isSelected
                  ? "border-[#FFCAB6] bg-[#FDF9F6] text-[#FF5514] shadow-xs ring-1 ring-[#FFCAB6]"
                  : "border-[#F2F2F7] bg-white text-[#101828] hover:border-[#FFCAB6] hover:bg-[#FFFBF8]"
              )}
            >
              {time}
            </button>
          );
        })}
      </div>
    </div>
  );
}
