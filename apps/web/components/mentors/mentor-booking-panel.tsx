"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock3 } from "lucide-react";
import { Calendar2 } from "iconsax-react";
import { SegmentedTabs } from "@/components/ui/custom/segmented-tabs";
import { useFormatPrice } from "@/hooks/use-currency";
import { AvailableDateSlot, GroupSessionEvent, SessionPackage } from "./types";
import { AvailableDates } from "@/components/ui/custom/available-dates";
import { AvailableDatesSkeleton } from "@/components/ui/custom/available-dates-skeleton";

interface MentorBookingPanelProps {
  packages: SessionPackage[];
  availableDates: AvailableDateSlot[];
  isLoadingDates?: boolean;
  /** Set when the mentee already has the selected session pending or upcoming */
  existingBooking?: { when: string; href: string } | null;
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
  isLoadingDates = false,
  existingBooking = null,
  groupSessions,
  selectedPackage,
  onSelectPackage,
  selectedDate,
  onSelectDate,
  selectedTime,
  onSelectTime,
  onProceedToConfirm,
}: MentorBookingPanelProps) {
  const formatPrice = useFormatPrice();
  const [sessionMode, setSessionMode] = useState<"1on1" | "group">("1on1");
  const [isViewingDates, setIsViewingDates] = useState(false);

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
        <div className="rounded-2xl border border-[#E9EAF0] bg-white p-4 sm:p-5">
          {/* Packages list */}
          <div className="space-y-3">
            {packages.length === 0 && (
              <p className="py-6 text-center text-sm text-[#667085]">
                This mentor hasn&apos;t set up any sessions yet.
              </p>
            )}
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
                      {formatPrice(pkg.numericPrice, pkg.currency)}
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
          {packages.length === 0 ? null : !isViewingDates ? (
            <button
              type="button"
              onClick={() => setIsViewingDates(true)}
              className="mt-5 w-full rounded-full bg-[#FF5500] py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#E04B00] active:scale-[0.99]"
            >
              View available dates
            </button>
          ) : (
            /* Available Dates Section (Either with dates OR empty state) */
            <div className="mt-5 border-t border-[#F2F4F7] pt-5">
              {isLoadingDates ? (
                <AvailableDatesSkeleton />
              ) : hasSlots ? (
                <>
                  <AvailableDates
                    dates={availableDates}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    onSelectDate={onSelectDate}
                    onSelectTime={onSelectTime}
                  />

                  {/* Book Session Submit; one booking of a session at a time */}
                  <button
                    type="button"
                    onClick={onProceedToConfirm}
                    disabled={!selectedTime || !!existingBooking}
                    className="mt-5 w-full rounded-full bg-[#FF5500] py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#E04B00] disabled:opacity-50 active:scale-[0.99]"
                  >
                    Book Session
                  </button>
                  {existingBooking && (
                    <p className="mt-2.5 text-center text-xs leading-relaxed text-[#667085]">
                      You already have this session booked for {existingBooking.when}. You can
                      book it again after it ends.{" "}
                      <Link
                        href={existingBooking.href}
                        className="font-semibold !text-[#FF5500] hover:underline"
                      >
                        View booking
                      </Link>
                    </p>
                  )}
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
                    This mentor has no open times in the next two weeks. Check back soon.
                  </p>
                  <Link
                    href="/explore"
                    className="mt-4 rounded-full bg-[#FF5500] px-6 py-2.5 text-xs font-semibold !text-white transition hover:bg-[#E04B00] active:scale-[0.98]"
                  >
                    Browse similar mentors
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Group Sessions - Coming Soon */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E9EAF0] bg-white py-12 px-4 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-[#FFEEE8]">
            <Calendar2 size="20" variant="Bulk" color="#FF5500" />
          </div>
          <h4 className="mt-3 text-sm font-bold text-[#101828]">
            Coming Soon
          </h4>
        </div>
      )}
    </div>
  );
}
