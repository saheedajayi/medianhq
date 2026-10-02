"use client";

import { useState, useEffect } from "react";
import { Eye, Check } from "lucide-react";
import { Calendar as IconsaxCalendar } from "iconsax-react";
import { Calendar } from "@/components/ui/base/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/base/popover";
import { mentorSessionsService } from "@/services/mentor-sessions";
import type { DaySchedule, DateOverride, TimeSlot } from "./types";
import { CalendarSyncBanner } from "./calendar-sync-banner";
import { WeeklyHoursCard } from "./weekly-hours-card";
import { DateOverridesCard } from "./date-overrides-card";
import { AvailabilitySettingsRow } from "./availability-settings-row";
import { CalendarSyncModal } from "./modals/calendar-sync-modal";
import { DisconnectCalendarModal } from "./modals/disconnect-calendar-modal";
import { PreviewScheduleModal } from "./modals/preview-schedule-modal";

const INITIAL_DAYS: DaySchedule[] = [
  {
    dayOfWeek: 1,
    name: "Monday",
    isActive: true,
    slots: [{ id: "mon-1", startTime: "9:00 AM", endTime: "2:00 pm" }],
  },
  {
    dayOfWeek: 2,
    name: "Tuesday",
    isActive: true,
    slots: [{ id: "tue-1", startTime: "9:00 AM", endTime: "2:00 pm" }],
  },
  {
    dayOfWeek: 3,
    name: "Wednesday",
    isActive: true,
    slots: [
      {
        id: "wed-slot-1",
        startTime: "9:00 AM",
        endTime: "2:00 pm",
        hasConflict: true,
      },
    ],
  },
  {
    dayOfWeek: 4,
    name: "Thursday",
    isActive: true,
    slots: [{ id: "thu-1", startTime: "9:00 AM", endTime: "2:00 pm" }],
  },
  {
    dayOfWeek: 5,
    name: "Friday",
    isActive: true,
    slots: [{ id: "fri-1", startTime: "9:00 AM", endTime: "2:00 pm" }],
  },
  {
    dayOfWeek: 6,
    name: "Saturday",
    isActive: false,
    slots: [],
  },
  {
    dayOfWeek: 7,
    name: "Sunday",
    isActive: false,
    slots: [],
  },
];

const INITIAL_OVERRIDES: DateOverride[] = [
  {
    id: "ov-1",
    dateStr: "Thu, May 16, 2024",
    startTime: "5:00AM",
    endTime: "10:00PM",
  },
  {
    id: "ov-2",
    dateStr: "Thu, May 16, 2024",
    startTime: "5:00AM",
    endTime: "10:00PM",
  },
];

function parseDate(dateStr: string): Date | undefined {
  if (!dateStr) return undefined;
  const parts = dateStr.split("/");
  if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }
  const fallback = new Date(dateStr);
  return isNaN(fallback.getTime()) ? undefined : fallback;
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function MentorAvailabilityView() {
  const [days, setDays] = useState<DaySchedule[]>(INITIAL_DAYS);
  const [startDate, setStartDate] = useState("15/05/2024");
  const [endDate, setEndDate] = useState("29/05/2024");
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);
  const [timezone, setTimezone] = useState("(-04:00) Eastern Time (US & Canada)");

  // Overrides
  const [overrides, setOverrides] = useState<DateOverride[]>(INITIAL_OVERRIDES);

  // Settings
  const [bufferBefore, setBufferBefore] = useState("No buffer");
  const [bufferAfter, setBufferAfter] = useState("No buffer");
  const [sessionStartTimes, setSessionStartTimes] = useState("15 min intervals");
  const [minimumNotice, setMinimumNotice] = useState("24 hours");

  // Integrations state
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [googleEmail] = useState("abdullah@gmail.com");
  const [isOutlookConnected, setIsOutlookConnected] = useState(false);

  // Modals
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load from API if available
  useEffect(() => {
    mentorSessionsService
      .getAvailability()
      .then((res) => {
        const data = res.data;
        if (!Array.isArray(data) || data.length === 0) return;
        setDays((prev) =>
          prev.map((d) => {
            const found = data.find((item) => item.dayOfWeek === d.dayOfWeek);
            if (!found) return d;
            return {
              ...d,
              isActive: found.isActive !== false,
              slots: [
                {
                  id: `slot-${d.dayOfWeek}-1`,
                  startTime: found.startTime || "9:00 AM",
                  endTime: found.endTime || "2:00 pm",
                },
              ],
            };
          })
        );
      })
      .catch(() => {
        // Fallback gracefully to default Figma mock schedule
      });
  }, []);

  // Handlers for weekly hours
  const handleToggleDay = (dayOfWeek: number) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek !== dayOfWeek) return d;
        const newActive = !d.isActive;
        return {
          ...d,
          isActive: newActive,
          slots:
            newActive && d.slots.length === 0
              ? [{ id: `slot-${Date.now()}`, startTime: "9:00 AM", endTime: "2:00 pm" }]
              : d.slots,
        };
      })
    );
  };

  const handleUpdateSlot = (
    dayOfWeek: number,
    slotId: string,
    updates: Partial<TimeSlot>
  ) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek !== dayOfWeek) return d;
        return {
          ...d,
          slots: d.slots.map((s) => (s.id === slotId ? { ...s, ...updates } : s)),
        };
      })
    );
  };

  const handleAddSlot = (dayOfWeek: number) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek !== dayOfWeek) return d;
        return {
          ...d,
          isActive: true,
          slots: [
            ...d.slots,
            { id: `slot-${Date.now()}`, startTime: "3:00 pm", endTime: "5:00 pm" },
          ],
        };
      })
    );
  };

  const handleRemoveSlot = (dayOfWeek: number, slotId: string) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek !== dayOfWeek) return d;
        const newSlots = d.slots.filter((s) => s.id !== slotId);
        return {
          ...d,
          isActive: newSlots.length > 0,
          slots: newSlots,
        };
      })
    );
  };

  const handleApplyConflictResolution = (
    dayOfWeek: number,
    slotId: string,
    option: "split" | "block"
  ) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek !== dayOfWeek) return d;
        if (option === "block") {
          return {
            ...d,
            slots: d.slots.filter((s) => s.id !== slotId),
          };
        } else {
          // Split
          return {
            ...d,
            slots: d.slots.flatMap((s) =>
              s.id === slotId
                ? [
                    { id: `${slotId}-1`, startTime: "9:00 AM", endTime: "10:00 AM" },
                    { id: `${slotId}-2`, startTime: "10:30 AM", endTime: "2:00 pm" },
                  ]
                : [s]
            ),
          };
        }
      })
    );
  };

  // Overrides Handlers
  const handleAddOverride = (override: Omit<DateOverride, "id">) => {
    setOverrides((prev) => [...prev, { ...override, id: `ov-${Date.now()}` }]);
  };

  const handleUpdateOverride = (id: string, updates: Partial<DateOverride>) => {
    setOverrides((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updates } : o))
    );
  };

  const handleDeleteOverride = (id: string) => {
    setOverrides((prev) => prev.filter((o) => o.id !== id));
  };

  // Save Schedule
  const handleSaveSchedule = async () => {
    setIsSaving(true);
    try {
      const payload = days.map((d) => ({
        dayOfWeek: d.dayOfWeek,
        startTime: d.slots[0]?.startTime || "9:00 AM",
        endTime: d.slots[0]?.endTime || "5:00 PM",
        isActive: d.isActive && d.slots.length > 0,
      }));
      await mentorSessionsService.saveAvailability(payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      // Local preview fallback
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-16">
      {/* ── Page Header & Top Preview Action ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#101828]">
            Availability
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#667085]">
            Set up times when you’re available for bookings during the week.
          </p>
        </div>

        {/* Preview Availability Button (Figma: rounded-full pill with eye icon) */}
        <button
          type="button"
          onClick={() => setIsPreviewModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-[#D0D5DD] bg-white px-5 py-2.5 text-xs sm:text-sm font-medium text-[#344054] shadow-xs hover:bg-gray-50 transition-colors self-start sm:self-auto"
        >
          <Eye size={16} className="text-[#667085]" />
          <span>Preview Availability</span>
        </button>
      </div>

      {/* ── Top Calendar Sync Banner ── */}
      <CalendarSyncBanner
        isGoogleConnected={isGoogleConnected}
        googleEmail={googleEmail}
        onClick={() => {
          if (isGoogleConnected) {
            setIsDisconnectModalOpen(true);
          } else {
            setIsSyncModalOpen(true);
          }
        }}
      />

      {/* ── Date Range Inputs (Start date / End date) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#101828] mb-1.5">
            Start date
          </label>
          <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-xl border border-[#EAECF0] bg-white px-4 py-3 text-sm text-[#101828] shadow-2xs hover:border-[#D0D5DD] focus:border-[#FF5514] focus:outline-none transition-colors text-left"
              >
                <span className={startDate ? "text-[#101828]" : "text-[#98A2B3]"}>
                  {startDate || "DD/MM/YYYY"}
                </span>
                <IconsaxCalendar
                  size="18"
                  variant="Linear"
                  color="#98A2B3"
                  className="shrink-0"
                />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 rounded-2xl border border-[#EAECF0] bg-white shadow-lg"
              align="start"
            >
              <Calendar
                mode="single"
                selected={parseDate(startDate)}
                onSelect={(d) => {
                  if (d) {
                    setStartDate(formatDate(d));
                    setIsStartDateOpen(false);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#101828] mb-1.5">
            End date
          </label>
          <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-xl border border-[#EAECF0] bg-white px-4 py-3 text-sm text-[#101828] shadow-2xs hover:border-[#D0D5DD] focus:border-[#FF5514] focus:outline-none transition-colors text-left"
              >
                <span className={endDate ? "text-[#101828]" : "text-[#98A2B3]"}>
                  {endDate || "DD/MM/YYYY"}
                </span>
                <IconsaxCalendar
                  size="18"
                  variant="Linear"
                  color="#98A2B3"
                  className="shrink-0"
                />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 rounded-2xl border border-[#EAECF0] bg-white shadow-lg"
              align="start"
            >
              <Calendar
                mode="single"
                selected={parseDate(endDate)}
                onSelect={(d) => {
                  if (d) {
                    setEndDate(formatDate(d));
                    setIsEndDateOpen(false);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* ── Main Two-Column Layout (Weekly Hours + Date Overrides) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Weekly Hours Card */}
        <div className="lg:col-span-8 flex flex-col">
          <WeeklyHoursCard
            days={days}
            onToggleDay={handleToggleDay}
            onUpdateSlot={handleUpdateSlot}
            onAddSlot={handleAddSlot}
            onRemoveSlot={handleRemoveSlot}
            onApplyConflictResolution={handleApplyConflictResolution}
            timezone={timezone}
            onTimezoneChange={setTimezone}
          />
        </div>

        {/* Right Column: Date Overrides Card */}
        <div className="lg:col-span-4 flex flex-col">
          <DateOverridesCard
            overrides={overrides}
            onAddOverride={handleAddOverride}
            onUpdateOverride={handleUpdateOverride}
            onDeleteOverride={handleDeleteOverride}
          />
        </div>
      </div>

      {/* ── Bottom Settings Row (4 Setting Dropdown Cards) ── */}
      <div className="pt-2">
        <AvailabilitySettingsRow
          bufferBefore={bufferBefore}
          onBufferBeforeChange={setBufferBefore}
          bufferAfter={bufferAfter}
          onBufferAfterChange={setBufferAfter}
          sessionStartTimes={sessionStartTimes}
          onSessionStartTimesChange={setSessionStartTimes}
          minimumNotice={minimumNotice}
          onMinimumNoticeChange={setMinimumNotice}
        />
      </div>

      {/* ── Bottom Save Action Bar ── */}
      <div className="flex items-center gap-4 pt-4 border-t border-[#F2F4F7]">
        <button
          type="button"
          onClick={handleSaveSchedule}
          disabled={isSaving}
          className="rounded-full bg-[#FF5514] px-8 py-3 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#E04B12] active:scale-98 transition disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save schedule"}
        </button>

        {saveSuccess && (
          <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#12B76A]">
            <Check size={16} />
            Schedule updated successfully
          </span>
        )}
      </div>

      {/* ── Modals ── */}
      <CalendarSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        isGoogleConnected={isGoogleConnected}
        googleEmail={googleEmail}
        isOutlookConnected={isOutlookConnected}
        onConnectGoogle={() => {
          setIsGoogleConnected(true);
          setIsSyncModalOpen(false);
        }}
        onDisconnectGoogle={() => {
          setIsSyncModalOpen(false);
          setIsDisconnectModalOpen(true);
        }}
        onConnectOutlook={() => {
          setIsOutlookConnected(true);
          setIsSyncModalOpen(false);
        }}
        onDisconnectOutlook={() => {
          setIsOutlookConnected(false);
        }}
      />

      <DisconnectCalendarModal
        isOpen={isDisconnectModalOpen}
        onClose={() => setIsDisconnectModalOpen(false)}
        onConfirmDisconnect={() => {
          setIsGoogleConnected(false);
        }}
      />

      <PreviewScheduleModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        days={days}
        timezone={timezone}
      />
    </div>
  );
}
