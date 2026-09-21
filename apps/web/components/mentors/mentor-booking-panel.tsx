"use client";

import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import { AvailableDateSlot, GroupSessionEvent, SessionPackage } from "./types";

interface MentorBookingPanelProps {
  packages: SessionPackage[];
  availableDates: AvailableDateSlot[];
  groupSessions: GroupSessionEvent[];
  selectedPackage: SessionPackage;
  onSelectPackage: (pkg: SessionPackage) => void;
  selectedDate: AvailableDateSlot;
  onSelectDate: (dateSlot: AvailableDateSlot) => void;
  selectedTime: string;
  onSelectTime: (time: string) => void;
  onProceedToConfirm: () => void;
}

export function MentorBookingPanel({ packages, availableDates, groupSessions, selectedPackage, onSelectPackage, selectedDate, onSelectDate, selectedTime, onSelectTime, onProceedToConfirm }: MentorBookingPanelProps) {
  const [sessionMode, setSessionMode] = useState<"1on1" | "group">("1on1");
  const [showAllDates, setShowAllDates] = useState(false);
  const [dateOffset, setDateOffset] = useState(0);
  const visibleDates = showAllDates ? availableDates : availableDates.slice(dateOffset, dateOffset + 5);
  const hasSlots = availableDates.some((date) => date.times.length > 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="inline-flex self-start rounded-full border border-[#EAECF0] bg-[#F7F8FB] p-1">
        <button type="button" onClick={() => setSessionMode("1on1")} className={`rounded-full px-4 py-1.5 text-xs font-medium ${sessionMode === "1on1" ? "bg-white text-[#FF5500] shadow-xs" : "text-[#475467]"}`}>1 on 1 Session</button>
        <button type="button" onClick={() => setSessionMode("group")} className={`rounded-full px-4 py-1.5 text-xs font-medium ${sessionMode === "group" ? "bg-white text-[#FF5500] shadow-xs" : "text-[#475467]"}`}>Group Sessions</button>
      </div>

      {sessionMode === "1on1" ? (
        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-4 shadow-xs sm:p-5">
          <div className="space-y-2.5">
            {packages.map((pkg) => (
              <button key={pkg.id} type="button" onClick={() => onSelectPackage(pkg)} className={`block w-full rounded-xl border p-3 text-left transition-colors ${selectedPackage.id === pkg.id ? "border-[#FF9E7F] bg-[#FFFBF8]" : "border-[#EAECF0] hover:border-[#FFC5B1]"}`} aria-pressed={selectedPackage.id === pkg.id}>
                <span className="flex items-center justify-between gap-3 text-sm font-semibold text-[#101828]"><span>{pkg.title}</span><span className="shrink-0 text-[#D94B09]">{pkg.price}</span></span>
                {selectedPackage.id === pkg.id && <><span className="mt-2 flex items-center gap-1 text-xs text-[#667085]"><Clock3 className="size-3.5" />{pkg.durationMinutes} mins</span><span className="mt-2 block text-xs leading-relaxed text-[#475467]">{pkg.description}</span></>}
              </button>
            ))}
          </div>

          {hasSlots ? (
            <>
              <div className="mt-5 flex items-center justify-between"><h2 className="text-sm font-semibold text-[#101828]">Available dates</h2><button type="button" onClick={() => setShowAllDates(!showAllDates)} className="text-xs font-medium text-[#D94B09]">{showAllDates ? "Show less" : "View all"}</button></div>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {visibleDates.map((dateSlot) => <button key={dateSlot.dateString} type="button" onClick={() => { onSelectDate(dateSlot); onSelectTime(dateSlot.times[0] || ""); }} disabled={dateSlot.times.length === 0} className={`flex min-w-[67px] flex-1 flex-col items-center rounded-xl border px-2 py-2.5 text-center disabled:opacity-40 ${selectedDate.dateString === dateSlot.dateString ? "border-[#FF9E7F] bg-[#FFFBF8] text-[#D94B09]" : "border-[#EAECF0] text-[#344054]"}`}><span className="text-[10px]">{dateSlot.dayOfWeek}</span><span className="mt-1 text-sm font-semibold">{dateSlot.dayNumber} {dateSlot.month}</span><span className="mt-1 text-[10px] text-[#667085]">{dateSlot.slotsCount} slots</span></button>)}
              </div>
              {!showAllDates && availableDates.length > 5 && <div className="mt-1 flex justify-end gap-2"><button type="button" onClick={() => setDateOffset(Math.max(0, dateOffset - 1))} disabled={dateOffset === 0} aria-label="Previous dates" className="disabled:opacity-30"><ChevronLeft className="size-4" /></button><button type="button" onClick={() => setDateOffset(Math.min(availableDates.length - 5, dateOffset + 1))} disabled={dateOffset >= availableDates.length - 5} aria-label="Next dates" className="disabled:opacity-30"><ChevronRight className="size-4" /></button></div>}
              <h2 className="mt-4 text-sm font-semibold text-[#101828]">Available time slots</h2>
              <div className="mt-3 grid grid-cols-4 gap-2">{selectedDate.times.map((time) => <button key={time} type="button" onClick={() => onSelectTime(time)} className={`rounded-lg border px-1 py-2 text-xs font-medium ${selectedTime === time ? "border-[#FF9E7F] bg-[#FFFBF8] text-[#D94B09]" : "border-[#EAECF0] text-[#344054]"}`}>{time}</button>)}</div>
              <button type="button" onClick={onProceedToConfirm} disabled={!selectedTime} className="mt-5 w-full rounded-full bg-[#FF5500] py-3 text-sm font-semibold text-white disabled:opacity-50">Book Session</button>
            </>
          ) : (
            <div className="flex flex-col items-center py-7 text-center"><span className="flex size-10 items-center justify-center rounded-full bg-[#FFF0EB] text-[#FF5500]"><CalendarDays className="size-5" /></span><h2 className="mt-3 text-sm font-semibold text-[#101828]">No available slots</h2><p className="mt-1 text-xs text-[#667085]">This mentor is fully booked.</p></div>
          )}
        </div>
      ) : (
        <div className="space-y-3 rounded-2xl border border-[#E9EAF0] bg-white p-4 shadow-xs sm:p-5">
          {groupSessions.map((group) => <article key={group.id} className="overflow-hidden rounded-xl border border-[#EAECF0]"><div className="bg-[#FFFBF8] px-4 py-3"><p className="font-serif text-2xl italic leading-tight text-[#55241B]">Get early access<br />to Median.</p></div><div className="p-4"><div className="flex justify-between gap-2 text-sm font-semibold text-[#101828]"><h3>{group.title}</h3><span className="text-[#D94B09]">Free</span></div><p className="mt-2 text-xs text-[#667085]">{group.date}</p><p className="mt-2 text-xs leading-relaxed text-[#475467]">{group.description}</p></div></article>)}
          <p className="text-center text-xs text-[#D94B09]">View previous sessions</p>
        </div>
      )}
    </div>
  );
}
