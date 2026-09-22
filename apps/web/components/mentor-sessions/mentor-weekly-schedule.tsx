"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Check, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/base/select";
import {
  mentorSessionsService,
  type AvailabilityInput,
} from "@/services/mentor-sessions";

const DAYS = [
  { dayOfWeek: 1, name: "Monday" },
  { dayOfWeek: 2, name: "Tuesday" },
  { dayOfWeek: 3, name: "Wednesday" },
  { dayOfWeek: 4, name: "Thursday" },
  { dayOfWeek: 5, name: "Friday" },
  { dayOfWeek: 6, name: "Saturday" },
  { dayOfWeek: 7, name: "Sunday" },
];

const TIME_OPTIONS = [
  "08:00 AM",
  "08:30 AM",
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
];

export function MentorWeeklySchedule() {
  const [schedule, setSchedule] = useState<AvailabilityInput[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mentorSessionsService
      .getAvailability()
      .then((res) => {
        setSchedule(res.data || []);
      })
      .catch(() => {
        setError("Failed to load availability schedule.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const getSlot = (dayOfWeek: number): AvailabilityInput => {
    const found = schedule.find((s) => s.dayOfWeek === dayOfWeek);
    if (found) return found;
    return {
      dayOfWeek,
      startTime: "09:00 AM",
      endTime: "05:00 PM",
      isActive: dayOfWeek <= 5, // Active Mon-Fri by default
    };
  };

  const updateSlot = (dayOfWeek: number, updates: Partial<AvailabilityInput>) => {
    setSchedule((prev) => {
      const existing = prev.find((s) => s.dayOfWeek === dayOfWeek);
      if (existing) {
        return prev.map((s) =>
          s.dayOfWeek === dayOfWeek ? { ...s, ...updates } : s
        );
      }
      return [
        ...prev,
        {
          dayOfWeek,
          startTime: "09:00 AM",
          endTime: "05:00 PM",
          isActive: dayOfWeek <= 5,
          ...updates,
        },
      ];
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const fullSlots = DAYS.map((d) => getSlot(d.dayOfWeek));
      await mentorSessionsService.saveAvailability(fullSlots);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      setError("Failed to save schedule. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[#667085]">
        Loading schedule...
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6 pt-2">
      {error && (
        <div className="rounded-xl border border-[#FDA29B] bg-[#FEF3F2] p-3 text-xs text-[#B42318]">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {DAYS.map((day) => {
          const slot = getSlot(day.dayOfWeek);
          const isActive = slot.isActive !== false;

          return (
            <div
              key={day.dayOfWeek}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 transition ${
                isActive
                  ? "border-[#EAECF0] bg-white"
                  : "border-[#F2F4F7] bg-[#F9FAFB] opacity-70"
              }`}
            >
              {/* Day Name & Status Toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateSlot(day.dayOfWeek, { isActive: !isActive })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    isActive ? "bg-[#FF5514]" : "bg-[#D0D5DD]"
                  }`}
                  role="switch"
                  aria-checked={isActive}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      isActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-sm font-semibold text-[#101828]">
                  {day.name}
                </span>
              </div>

              {/* Time Pickers */}
              {isActive ? (
                <div className="flex items-center gap-2">
                  <Select
                    value={slot.startTime}
                    onValueChange={(val) =>
                      updateSlot(day.dayOfWeek, { startTime: val })
                    }
                  >
                    <SelectTrigger className="h-9 w-28 rounded-xl border border-[#D0D5DD] bg-white px-3 py-1.5 text-xs font-medium text-[#101828] focus-visible:border-[#FF5514] focus-visible:ring-2 focus-visible:ring-[#FF5514]/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 rounded-xl border border-[#EAECF0] bg-white shadow-lg">
                      {TIME_OPTIONS.map((time) => (
                        <SelectItem key={time} value={time} className="text-xs">
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <span className="text-xs text-[#98A2B3]">—</span>

                  <Select
                    value={slot.endTime}
                    onValueChange={(val) =>
                      updateSlot(day.dayOfWeek, { endTime: val })
                    }
                  >
                    <SelectTrigger className="h-9 w-28 rounded-xl border border-[#D0D5DD] bg-white px-3 py-1.5 text-xs font-medium text-[#101828] focus-visible:border-[#FF5514] focus-visible:ring-2 focus-visible:ring-[#FF5514]/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 rounded-xl border border-[#EAECF0] bg-white shadow-lg">
                      {TIME_OPTIONS.map((time) => (
                        <SelectItem key={time} value={time} className="text-xs">
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <span className="text-xs font-medium text-[#98A2B3]">
                  Unavailable
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Save Action */}
      <div className="flex items-center gap-4 pt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-full bg-[#FF5514] px-6 py-3 text-xs font-semibold text-white transition hover:bg-[#E0480F] disabled:opacity-50 shadow-xs"
        >
          {isSaving ? "Saving..." : "Save schedule"}
        </button>

        {savedSuccess && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#12B76A]">
            <Check className="size-4" />
            Schedule updated successfully
          </span>
        )}
      </div>
    </div>
  );
}
