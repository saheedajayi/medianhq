"use client";

import { useState } from "react";
import { Plus, AlertTriangle, ChevronDown } from "lucide-react";
import { Trash } from "iconsax-react";
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
    <div className="rounded-3xl border border-[#EAECF0] bg-white p-6 sm:p-8 shadow-xs h-full flex flex-col">
      {/* Header: Title & Timezone Dropdown */}
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base sm:text-lg font-medium text-[#101828]">
          Weekly hours
        </h3>
        <TimezoneDropdown value={timezone} onChange={onTimezoneChange} />
      </div>

      {/* Notice Banner */}
      <div className="mt-4 rounded-xl border border-[#FED7AA] bg-[#FFFBF7] px-4 py-3 text-sm text-[#101828]">
        Minimum 2 available slots per week required for activation
      </div>

      {/* Days Schedule List */}
      <div className="mt-8 space-y-6 sm:space-y-7">
        {days.map((day) => {
          const isActive = day.isActive;
          const firstSlot = day.slots[0];

          return (
            <div key={day.dayOfWeek} className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                {/* Left Group: Fixed Day Prefix + Time Pills / Unavailable */}
                <div className="flex items-center gap-3.5 sm:gap-5 min-w-0">
                  {/* Fixed Day Prefix (Toggle + Name) */}
                  <div className="flex items-center gap-3.5 w-[150px] sm:w-[180px] shrink-0">
                    <button
                      type="button"
                      onClick={() => onToggleDay(day.dayOfWeek)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isActive ? "bg-[#FF5514]" : "bg-[#EAECF0]"
                        }`}
                      role="switch"
                      aria-checked={isActive}
                    >
                      <span
                        className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${isActive ? "translate-x-5" : "translate-x-0"
                          }`}
                      />
                    </button>

                    <span
                      className={`text-sm font-medium select-none ${isActive ? "text-[#101828]" : "text-[#667085]"
                        }`}
                    >
                      {day.name}
                    </span>
                  </div>

                  {/* Time slot pills or Unavailable text */}
                  {isActive && firstSlot ? (
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <TimeSlotDropdown
                        value={firstSlot.startTime}
                        onChange={(val) =>
                          onUpdateSlot(day.dayOfWeek, firstSlot.id, { startTime: val })
                        }
                      />

                      <span className="text-sm font-normal text-[#C4320A] select-none">–</span>

                      <TimeSlotDropdown
                        value={firstSlot.endTime}
                        onChange={(val) =>
                          onUpdateSlot(day.dayOfWeek, firstSlot.id, { endTime: val })
                        }
                      />

                      {/* Conflict Badge if applicable */}
                      {firstSlot.hasConflict && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedConflictSlotId(
                              expandedConflictSlotId === firstSlot.id ? null : firstSlot.id
                            )
                          }
                          className="flex items-center gap-1.5 rounded-full border border-[#FDA29B] bg-[#FEF3F2] px-3 py-1 text-xs font-semibold text-[#D92D20] hover:bg-[#FEE4E2] transition-colors"
                        >
                          <AlertTriangle size={13} className="text-[#D92D20]" />
                          <span>1 conflict</span>
                          <ChevronDown size={12} className="text-[#D92D20]" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm font-normal text-[#98A2B3] select-none">
                      Unavailable
                    </span>
                  )}
                </div>

                {/* Right Action Icons (+ and Trash) */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => onAddSlot(day.dayOfWeek)}
                    className="rounded-lg p-1.5 text-[#344054] hover:bg-gray-100 hover:text-[#101828] transition-colors"
                    aria-label="Add slot"
                  >
                    <Plus size={16} />
                  </button>

                  {isActive && firstSlot && (
                    <button
                      type="button"
                      onClick={() => onRemoveSlot(day.dayOfWeek, firstSlot.id)}
                      className="rounded-lg p-1.5 text-[#FF5514] hover:bg-[#FFF4EF] transition-colors"
                      aria-label="Remove slot"
                    >
                      <Trash size="16" variant="Linear" color="#FF5514" />
                    </button>
                  )}
                </div>
              </div>

              {/* Any additional slots if day has multiple slots */}
              {isActive && day.slots.length > 1 && (
                <div className="space-y-3">
                  {day.slots.slice(1).map((extraSlot) => (
                    <div key={extraSlot.id} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 sm:gap-5 min-w-0">
                        {/* Empty Spacer matching the EXACT width of the Day Prefix! */}
                        <div className="w-[150px] sm:w-[180px] shrink-0" aria-hidden="true" />

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <TimeSlotDropdown
                            value={extraSlot.startTime}
                            onChange={(val) =>
                              onUpdateSlot(day.dayOfWeek, extraSlot.id, { startTime: val })
                            }
                          />
                          <span className="text-sm font-normal text-[#C4320A] select-none">–</span>
                          <TimeSlotDropdown
                            value={extraSlot.endTime}
                            onChange={(val) =>
                              onUpdateSlot(day.dayOfWeek, extraSlot.id, { endTime: val })
                            }
                          />
                          {extraSlot.hasConflict && (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedConflictSlotId(
                                  expandedConflictSlotId === extraSlot.id ? null : extraSlot.id
                                )
                              }
                              className="flex items-center gap-1.5 rounded-full border border-[#FDA29B] bg-[#FEF3F2] px-3 py-1 text-xs font-semibold text-[#D92D20] hover:bg-[#FEE4E2] transition-colors"
                            >
                              <AlertTriangle size={13} className="text-[#D92D20]" />
                              <span>1 conflict</span>
                              <ChevronDown size={12} className="text-[#D92D20]" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <button
                          type="button"
                          onClick={() => onAddSlot(day.dayOfWeek)}
                          className="rounded-lg p-1.5 text-[#344054] hover:bg-gray-100 hover:text-[#101828] transition-colors"
                          aria-label="Add slot"
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveSlot(day.dayOfWeek, extraSlot.id)}
                          className="rounded-lg p-1.5 text-[#FF5514] hover:bg-[#FFF4EF] transition-colors"
                          aria-label="Remove slot"
                        >
                          <Trash size="16" variant="Linear" color="#FF5514" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Expanded Conflict Resolution Card */}
              {isActive &&
                day.slots.some((s) => s.id === expandedConflictSlotId && s.hasConflict) && (
                  <div className="mt-2 w-full">
                    <ConflictResolutionCard
                      onDismiss={() => setExpandedConflictSlotId(null)}
                      onApplyResolution={(opt) => {
                        if (expandedConflictSlotId) {
                          onApplyConflictResolution(day.dayOfWeek, expandedConflictSlotId, opt);
                          setExpandedConflictSlotId(null);
                        }
                      }}
                    />
                  </div>
                )}
            </div>
          );
        })}
      </div>

      {/* Footer Info Note */}
      <div className="mt-8">
        <p className="text-xs text-[#667085] leading-relaxed">
          Invitees will be shown availale slots based on your weekly hours, if you want to change  availability on specific days, please add a date override.
        </p>
      </div>
    </div>
  );
}
