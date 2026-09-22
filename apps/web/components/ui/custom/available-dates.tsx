"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AvailableTimeSlots,
  AvailableTimeSlotsProps,
} from "./available-time-slots";

export { AvailableTimeSlots };
export type { AvailableTimeSlotsProps };

export interface AvailableDateSlot {
  dateString: string; // "2026-06-07"
  dayOfWeek: string; // "SUN" or "Mo"
  dayNumber: string; // "07"
  month: string; // "Jun"
  slotsCount: number;
  times: string[]; // ["3:00PM", "3:30PM", "4:00PM", "4:30PM"]
}

export interface AvailableDatesProps {
  dates: AvailableDateSlot[];
  selectedDate: AvailableDateSlot;
  selectedTime: string;
  onSelectDate: (date: AvailableDateSlot) => void;
  onSelectTime: (time: string) => void;
  title?: string;
  timeSlotsTitle?: string;
  className?: string;
  accentColor?: string;
}

const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sat", "Su"];

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

export function AvailableDates({
  dates = [],
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  title = "Available dates",
  timeSlotsTitle = "Available time slots",
  className,
}: AvailableDatesProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeDate = selectedDate || dates[0];

  const [month, setMonth] = useState(() => {
    const date = parseDate(
      activeDate?.dateString || dates[0]?.dateString || dateKey(new Date())
    );
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  const slotsByDate = new Map(dates.map((date) => [date.dateString, date]));
  const firstWeekday = (month.getDay() + 6) % 7;
  const calendarStart = new Date(
    month.getFullYear(),
    month.getMonth(),
    1 - firstWeekday
  );
  const calendarDays = Array.from(
    { length: 42 },
    (_, index) =>
      new Date(
        calendarStart.getFullYear(),
        calendarStart.getMonth(),
        calendarStart.getDate() + index
      )
  );

  const choose = (date: AvailableDateSlot) => {
    onSelectDate(date);
    if (date.times.length > 0 && !date.times.includes(selectedTime)) {
      onSelectTime(date.times[0] || "");
    }
    const chosen = parseDate(date.dateString);
    setMonth(new Date(chosen.getFullYear(), chosen.getMonth(), 1));
  };

  const changeMonth = (amount: number) =>
    setMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + amount, 1)
    );

  const times = activeDate?.times || [];

  return (
    <section aria-label={title} className={cn("space-y-6", className)}>
      {/* Date Header + Chips (Figma Bookings design: ~100px width, 103px height, rounded-[12px]) */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-[#101828]">{title}</h3>
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            className="text-xs font-semibold text-[#FF5514] hover:text-[#E04406] transition-colors"
          >
            {isOpen ? "Show less" : "View all"}
          </button>
        </div>

        <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {dates.slice(0, 5).map((date) => {
            const selected = date.dateString === activeDate?.dateString;
            return (
              <button
                key={date.dateString}
                type="button"
                disabled={!date.times.length}
                onClick={() => choose(date)}
                aria-pressed={selected}
                className={cn(
                  "flex min-w-[76px] flex-1 flex-col items-center justify-center rounded-[12px] border p-2.5 sm:py-3.5 text-center transition-all disabled:opacity-40 active:scale-[0.98]",
                  selected
                    ? "border-[#FFCAB6] bg-[#FDF9F6] text-[#FF5514] shadow-xs ring-1 ring-[#FFCAB6]"
                    : "border-[#F2F2F7] bg-white text-[#101828] hover:border-[#FFCAB6] hover:bg-[#FFFBF8]"
                )}
              >
                <span
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-wider",
                    selected ? "text-[#FF5514]" : "text-[#667085]"
                  )}
                >
                  {date.dayOfWeek}
                </span>
                <span
                  className={cn(
                    "mt-1.5 text-sm font-bold",
                    selected ? "text-[#FF5514]" : "text-[#101828]"
                  )}
                >
                  {date.dayNumber} {date.month}
                </span>
                <span
                  className={cn(
                    "mt-1.5 text-[10px] font-medium",
                    selected ? "text-[#FF5514]" : "text-[#667085]"
                  )}
                >
                  {date.slotsCount} slots
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reusable Consolidated Available Time Slots (Bookings design) */}
      <AvailableTimeSlots
        times={times}
        selectedTime={selectedTime}
        onSelectTime={onSelectTime}
        title={timeSlotsTitle}
      />

      {/* Calendar Dropdown */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="calendar"
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between pb-3 pt-4">
              <h4 className="text-sm font-bold text-[#101828]">Calendar view</h4>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close calendar"
                className="flex size-7 items-center justify-center rounded-full bg-[#F7F8FB] text-[#344054] hover:bg-[#EAECF0]"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="rounded-2xl border border-[#EAECF0] bg-white p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between text-sm font-semibold text-[#344054]">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  aria-label="Previous month"
                  className="rounded-lg p-2 hover:bg-[#F7F8FB]"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span aria-live="polite">
                  {month.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  aria-label="Next month"
                  className="rounded-lg p-2 hover:bg-[#F7F8FB]"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>

              <div className="mt-3 flex gap-2">
                <div className="min-w-0 flex-1 rounded-lg border border-[#D0D5DD] px-3 py-2 text-xs text-[#344054]">
                  {parseDate(activeDate.dateString).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                    const slot = slotsByDate.get(dateKey(today));
                    if (slot) choose(slot);
                  }}
                  className="rounded-lg border border-[#D0D5DD] px-3 py-2 text-xs font-semibold text-[#344054] hover:bg-[#F7F8FB]"
                >
                  Today
                </button>
              </div>

              <div className="mt-5 grid grid-cols-7 text-center text-xs font-semibold text-[#344054]">
                {weekdays.map((day) => (
                  <span key={day} className="py-2">
                    {day}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 text-center text-xs text-[#344054]">
                {calendarDays.map((day) => {
                  const key = dateKey(day);
                  const slot = slotsByDate.get(key);
                  const selected = key === activeDate.dateString;
                  const inMonth = day.getMonth() === month.getMonth();
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={!slot?.times.length}
                      onClick={() => slot && choose(slot)}
                      aria-label={`${day.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}${slot ? `, ${slot.slotsCount} slots` : ", unavailable"}`}
                      aria-pressed={selected}
                      className={cn(
                        "relative mx-auto my-1 flex size-9 items-center justify-center rounded-full transition-colors",
                        selected
                          ? "bg-[#FF5514] font-semibold text-white shadow-xs"
                          : slot
                          ? "hover:bg-[#FFF0EB] hover:text-[#FF5514]"
                          : "cursor-default text-[#D0D5DD]",
                        !inMonth && !selected && "opacity-30"
                      )}
                    >
                      {day.getDate()}
                      {slot && !selected && (
                        <span className="absolute bottom-1 size-1 rounded-full bg-[#FF5514]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
