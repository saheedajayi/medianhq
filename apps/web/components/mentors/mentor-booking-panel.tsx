"use client";

import { useState } from "react";
import Image from "next/image";
import { Clock, Calendar as CalendarIcon, Users } from "lucide-react";
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

export function MentorBookingPanel({
  packages,
  availableDates,
  groupSessions,
  selectedPackage,
  onSelectPackage,
  selectedDate,
  onSelectDate,
  selectedTime,
  onSelectTime,
  onProceedToConfirm,
}: MentorBookingPanelProps) {
  const [sessionMode, setSessionMode] = useState<"1on1" | "group">("1on1");

  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-[#F2F2F7] bg-white p-6 shadow-xs">
      {/* 1 on 1 vs Group Session Toggle */}
      <div className="inline-flex rounded-full border border-[#EAECF0]/70 bg-[#F7F8FB] p-1">
        <button
          type="button"
          onClick={() => setSessionMode("1on1")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
            sessionMode === "1on1"
              ? "bg-white text-[#FF5500] shadow-2xs"
              : "text-[#475467] hover:text-[#101828]"
          }`}
        >
          1 on 1 Session
        </button>
        <button
          type="button"
          onClick={() => setSessionMode("group")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
            sessionMode === "group"
              ? "bg-white text-[#FF5500] shadow-2xs"
              : "text-[#475467] hover:text-[#101828]"
          }`}
        >
          Group Session
        </button>
      </div>

      {sessionMode === "1on1" ? (
        <div className="flex flex-col gap-6">
          {/* 1. Session Topic & Duration Packages */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              Select Session Type
            </span>
            <div className="flex flex-col gap-2.5">
              {packages.map((pkg) => {
                const isSelected = selectedPackage.id === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => onSelectPackage(pkg)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all duration-150 ${
                      isSelected
                        ? "border-[#FF5500] bg-[#FFFBF8] shadow-2xs"
                        : "border-[#EAECF0] bg-white hover:border-[#D0D5DD]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-[#101828]">
                        {pkg.title}
                      </h3>
                      <span className="rounded-full bg-[#FFEEE8] px-2.5 py-0.5 text-xs font-bold text-[#FF5500] shrink-0">
                        {pkg.price}
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#667085]">
                      <Clock className="size-3.5" />
                      <span>{pkg.durationMinutes} mins</span>
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-[#475467]">
                      {pkg.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Horizontal Date Selector */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              Available dates
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {availableDates.map((dateSlot) => {
                const isSelected = selectedDate.dateString === dateSlot.dateString;
                return (
                  <button
                    key={dateSlot.dateString}
                    type="button"
                    onClick={() => {
                      onSelectDate(dateSlot);
                      if (dateSlot.times.length > 0 && dateSlot.times[0]) {
                        onSelectTime(dateSlot.times[0]);
                      }
                    }}
                    className={`flex min-w-[76px] flex-col items-center justify-center rounded-2xl border p-3 transition-all ${
                      isSelected
                        ? "border-[#FF5500] bg-[#FFF0EB] shadow-2xs"
                        : "border-[#EAECF0] bg-white hover:border-[#D0D5DD]"
                    }`}
                  >
                    <span className="text-[11px] font-medium text-[#667085]">
                      {dateSlot.dayOfWeek}
                    </span>
                    <span className="my-0.5 text-sm font-bold text-[#101828]">
                      {dateSlot.dayNumber} {dateSlot.month}
                    </span>
                    <span className="text-[10px] text-[#667085]">
                      {dateSlot.slotsCount} slots
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Available Times Grid */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              Available times
            </span>
            <div className="grid grid-cols-3 gap-2">
              {selectedDate.times.map((time) => {
                const isSelected = selectedTime === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => onSelectTime(time)}
                    className={`rounded-xl border py-2.5 text-center text-xs font-semibold transition-all ${
                      isSelected
                        ? "border-[#FF5500] bg-[#FFF0EB] text-[#FF5500] shadow-2xs"
                        : "border-[#EAECF0] bg-[#F7F8FB] text-[#344054] hover:bg-[#EAECF0]/60"
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Action Button */}
          <button
            type="button"
            onClick={onProceedToConfirm}
            className="w-full rounded-full bg-[#FF5500] py-3.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#E04B00] active:scale-[0.99]"
          >
            Confirm session
          </button>
        </div>
      ) : (
        /* Group Sessions Mode */
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
            Upcoming Group Sessions
          </span>
          {groupSessions.map((group) => (
            <div
              key={group.id}
              className="overflow-hidden rounded-2xl border border-[#EAECF0] bg-white shadow-2xs"
            >
              <div className="relative h-28 w-full bg-[#FFF0EB] flex items-center justify-center p-4">
                <div className="text-center">
                  <span className="font-serif italic text-2xl font-bold text-[#B53C0E]">
                    Get to Know...
                  </span>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-2">
                <h3 className="text-sm font-bold text-[#101828]">
                  {group.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-[#667085]">
                  <CalendarIcon className="size-3.5" />
                  <span>{group.date}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#FF5500] font-medium">
                  <Users className="size-3.5" />
                  <span>{group.spotsLeft} spots remaining</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[#475467]">
                  {group.description}
                </p>
                <button
                  type="button"
                  onClick={onProceedToConfirm}
                  className="mt-2 w-full rounded-full bg-[#FF5500] py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#E04B00]"
                >
                  Register for Masterclass
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
