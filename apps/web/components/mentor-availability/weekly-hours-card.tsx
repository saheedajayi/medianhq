"use client";

import { useState } from "react";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import type { DaySchedule, TimeSlot } from "./types";
import { TimeSlotDropdown } from "./time-slot-dropdown";
import { TimezoneDropdown } from "./timezone-dropdown";
import { ConflictResolutionCard } from "./conflict-resolution-card";

interface WeeklyHoursCardProps {
  days: DaySchedule[];
  onToggleDay: (dayOfWeek: number) => void;
  onUpdateSlot: (dayOfWeek: number, slotId: string, updates: Partial<TimeSlot>) => void;
  onAddSlot: (dayOfWeek: number) => void;
  onRemoveSlot: (dayOfWeek: number, slotId: string) => void;
  onApplyConflictResolution: (dayOfWeek: number, slotId: string, option: "split" | "block") => void;
  timezone: string;
  onTimezoneChange: (tz: string) => void;
}

export function WeeklyHoursCard({
  days,
  onToggleDay,
  onUpdateSlot,
  onAddSlot,
  onRemoveSlot,
  onApplyConflictResolution,
  timezone,
  onTimezoneChange,
}: WeeklyHoursCardProps) {
  // Track which slot has expanded conflict resolution
  const [expandedConflictSlotId, setExpandedConflictSlotId] = useState<string | null>("wed-slot-1");

  return (
    <div className="rounded-2xl border border-[#EAECF0] bg-white p-5 sm:p-7 shadow-2xs">
      {/* Header: Title & Timezone Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#F2F4F7]">
        <h3 className="text-base sm:text-lg font-bold text-[#101828]">
          Weekly hours
        </h3>
        <TimezoneDropdown value={timezone} onChange={onTimezoneChange} />
      </div>

      {/* Activation Requirements Alert Banner */}
      <div className="mt-5 rounded-xl border border-[#FED7AA] bg-[#FFFBF7] px-4 py-3 text-xs sm:text-sm font-medium text-[#B54708]">
        Minimum 2 available slots per week required for activation
      </div>

      {/* Days Schedule List */}
      <div className="mt-6 space-y-6 divide-y divide-[#F2F4F7]">
        {days.map((day) => {
          const isActive = day.isActive;

          return (
            <div
              key={day.dayOfWeek}
              className={`flex flex-col gap-3 pt-5 first:pt-0 transition-opacity ${
                isActive ? "opacity-100" : "opacity-75"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                {/* Toggle & Day Name */}
                <div className="flex items-center gap-3.5 shrink-0 pt-1">
                  <button
                    type="button"
                    onClick={() => onToggleDay(day.dayOfWeek)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isActive ? "bg-[#FF5514]" : "bg-[#D0D5DD]"
                    }`}
                    role="switch"
                    aria-checked={isActive}
                  >
                    <span
                      className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                        isActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>

                  <span className="w-24 sm:w-28 text-sm font-semibold text-[#101828]">
                    {day.name}
                  </span>
                </div>

                {/* Slots Column or Unavailable Text */}
                <div className="flex-1 min-w-0">
                  {isActive && day.slots.length > 0 ? (
                    <div className="space-y-3">
                      {day.slots.map((slot) => {
                        const hasConflict = slot.hasConflict ?? false;
                        const isConflictOpen = expandedConflictSlotId === slot.id;

                        return (
                          <div key={slot.id} className="flex flex-col">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                              {/* Start Time */}
                              <TimeSlotDropdown
                                value={slot.startTime}
                                onChange={(val) =>
                                  onUpdateSlot(day.dayOfWeek, slot.id, { startTime: val })
                                }
                              />

                              <span className="text-xs text-[#98A2B3]">—</span>

                              {/* End Time */}
                              <TimeSlotDropdown
                                value={slot.endTime}
                                onChange={(val) =>
                                  onUpdateSlot(day.dayOfWeek, slot.id, { endTime: val })
                                }
                              />

                              {/* Conflict Badge if applicable */}
                              {hasConflict && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedConflictSlotId(
                                      isConflictOpen ? null : slot.id
                                    )
                                  }
                                  className="flex items-center gap-1.5 rounded-full border border-[#FDA29B] bg-[#FEF3F2] px-3 py-1 text-xs font-semibold text-[#B42318] hover:bg-[#FEE4E2] transition-colors"
                                >
                                  <AlertTriangle size={13} className="text-[#D92D20]" />
                                  <span>1 conflict</span>
                                  <span className="text-[10px] ml-0.5">▾</span>
                                </button>
                              )}

                              {/* Add Slot Button */}
                              <button
                                type="button"
                                onClick={() => onAddSlot(day.dayOfWeek)}
                                className="rounded-lg p-1.5 text-[#344054] hover:bg-gray-100 hover:text-[#101828] transition-colors"
                                aria-label="Add slot"
                              >
                                <Plus size={16} />
                              </button>

                              {/* Delete Slot Button */}
                              <button
                                type="button"
                                onClick={() => onRemoveSlot(day.dayOfWeek, slot.id)}
                                className="rounded-lg p-1.5 text-[#EA3829] hover:bg-[#FEF3F2] transition-colors"
                                aria-label="Remove slot"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            {/* Conflict Resolution expanded box */}
                            {hasConflict && isConflictOpen && (
                              <ConflictResolutionCard
                                onDismiss={() => setExpandedConflictSlotId(null)}
                                onApplyResolution={(opt) => {
                                  onApplyConflictResolution(day.dayOfWeek, slot.id, opt);
                                  setExpandedConflictSlotId(null);
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-xs font-medium text-[#98A2B3]">
                        Unavailable
                      </span>
                      <button
                        type="button"
                        onClick={() => onAddSlot(day.dayOfWeek)}
                        className="rounded-lg p-1.5 text-[#344054] hover:bg-gray-100 transition-colors"
                        aria-label="Add slot"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info Note */}
      <div className="mt-8 pt-5 border-t border-[#F2F4F7]">
        <p className="text-xs text-[#667085] leading-relaxed">
          Invitees will be shown available slots based on your weekly hours, if you want to change availability on specific days, please add a date override.
        </p>
      </div>
    </div>
  );
}
