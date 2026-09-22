"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock3 } from "lucide-react";
import { Calendar2 } from "iconsax-react";
import { SegmentedTabs } from "@/components/ui/custom/segmented-tabs";
import { AvailableDateSlot, GroupSessionEvent, SessionPackage } from "./types";
import { AvailableDates } from "@/components/ui/custom/available-dates";

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
  const [isViewingDates, setIsViewingDates] = useState(false);
  const [joinedWaitlist, setJoinedWaitlist] = useState(false);

  const hasSlots =
    availableDates &&
    availableDates.length > 0 &&
    availableDates.some((date) => date.times && date.times.length > 0);

  return (
    <div className="flex flex-col gap-3">
      {/* Tab switchers: 1 on 1 Session vs Group Sessions */}
      <SegmentedTabs
        tabs={[
          { value: "1on1", label: "1 on 1 Session" },
          { value: "group", label: "Group Sessions" },
        ]}
        activeTab={sessionMode}
        onChange={setSessionMode}
        className="self-start"
      />

      {sessionMode === "1on1" ? (
        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-4 shadow-xs sm:p-5">
          {/* Packages list */}
          <div className="space-y-3">
            {packages.map((pkg) => {
              const isSelected = selectedPackage.id === pkg.id;

              // Before clicking "View available dates": all packages show full details (Image 1)
              // After clicking "View available dates": selected package shows details, unselected packages collapse to title + price (Image 2)
              const showDetails = !isViewingDates || isSelected;

              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => onSelectPackage(pkg)}
                  className={`block w-full rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-[#FFCAB6] bg-[#FFFBF8]"
                      : "border-[#EAECF0] bg-white hover:border-[#FFC5B1]"
                  } ${showDetails ? "p-4" : "p-3.5"}`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-[#101828]">
                      {pkg.title}
                    </span>
                    <span className="shrink-0 text-sm font-bold text-[#FF5500]">
                      {pkg.price}
                    </span>
                  </div>

                  {showDetails && (
                    <>
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-[#667085]">
                        <Clock3 className="size-3.5 shrink-0" />
                        <span>{pkg.durationMinutes} mins</span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-[#475467]">
                        {pkg.description}
                      </p>
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* Button before viewing dates */}
          {!isViewingDates ? (
            <button
              type="button"
              onClick={() => setIsViewingDates(true)}
              className="mt-5 w-full rounded-full bg-[#FF5500] py-3.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#E04B00] active:scale-[0.99]"
            >
              View available dates
            </button>
          ) : (
            /* Available Dates Section (Either with dates OR empty state) */
            <div className="mt-5 border-t border-[#F2F4F7] pt-5">
              {hasSlots ? (
                <>
                  <AvailableDates
                    dates={availableDates}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    onSelectDate={onSelectDate}
                    onSelectTime={onSelectTime}
                  />

                  {/* Book Session Submit */}
                  <button
                    type="button"
                    onClick={onProceedToConfirm}
                    disabled={!selectedTime}
                    className="mt-5 w-full rounded-full bg-[#FF5500] py-3.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#E04B00] disabled:opacity-50 active:scale-[0.99]"
                  >
                    Book Session
                  </button>
                </>
              ) : (
                /* Empty state matching Image 2 */
                <div className="flex flex-col items-center py-7 text-center">
                  <div className="flex size-10 items-center justify-center rounded-full bg-[#FFEEE8]">
                    <Calendar2 size="20" variant="Bulk" color="#FF5500" />
                  </div>
                  <h4 className="mt-3 text-sm font-bold text-[#101828]">
                    No available slots
                  </h4>
                  <p className="mt-1 text-xs text-[#667085]">
                    This mentor is fully booked.
                  </p>
                  <button
                    type="button"
                    onClick={() => setJoinedWaitlist(true)}
                    className="mt-4 rounded-full bg-[#FF5500] px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#E04B00] active:scale-[0.98]"
                  >
                    {joinedWaitlist ? "Joined waitlist ✓" : "Join waitlist"}
                  </button>
                  <Link
                    href="/explore"
                    className="mt-3 text-xs font-medium text-[#475467] transition hover:text-[#101828]"
                  >
                    Browse similar mentors
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Group Sessions */
        <div className="space-y-3 rounded-2xl border border-[#E9EAF0] bg-white p-4 shadow-xs sm:p-5">
          {groupSessions.map((group) => (
            <article
              key={group.id}
              className="overflow-hidden rounded-xl border border-[#EAECF0]"
            >
              <div className="bg-[#FFFBF8] px-4 py-3">
                <p className="font-serif text-2xl italic leading-tight text-[#55241B]">
                  Get early access
                  <br />
                  to Median.
                </p>
              </div>
              <div className="p-4">
                <div className="flex justify-between gap-2 text-sm font-semibold text-[#101828]">
                  <h3>{group.title}</h3>
                  <span className="text-[#FF5500]">Free</span>
                </div>
                <p className="mt-2 text-xs text-[#667085]">{group.date}</p>
                <p className="mt-2 text-xs leading-relaxed text-[#475467]">
                  {group.description}
                </p>
              </div>
            </article>
          ))}
          <p className="text-center text-xs text-[#FF5500]">View previous sessions</p>
        </div>
      )}
    </div>
  );
}
