"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Calendar as IconsaxCalendar, Edit2, Trash } from "iconsax-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/base/popover";
import { Calendar as CalendarComponent } from "@/components/ui/base/calendar";
import type { DateOverride } from "./types";
import { TimeSlotDropdown } from "./time-slot-dropdown";

interface DateOverridesCardProps {
  overrides: DateOverride[];
  onAddOverride: (override: Omit<DateOverride, "id">) => void;
  onUpdateOverride: (id: string, updates: Partial<DateOverride>) => void;
  onDeleteOverride: (id: string) => void;
}

function parseOverrideDate(str: string): Date | undefined {
  if (!str) return undefined;
  const cleaned = str.includes(",") && str.split(",").length > 2
    ? str.split(",").slice(1).join(",").trim()
    : str;
  const d = new Date(cleaned);
  return isNaN(d.getTime()) ? undefined : d;
}

export function DateOverridesCard({
  overrides,
  onAddOverride,
  onUpdateOverride,
  onDeleteOverride,
}: DateOverridesCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  // Default to ov-1 so the edit state matches the Figma reference design
  const [editingId, setEditingId] = useState<string | null>("ov-1");

  // Add Form State
  const [newDate, setNewDate] = useState("May 16, 2024");
  const [newStart, setNewStart] = useState("5:00 AM");
  const [newEnd, setNewEnd] = useState("10:00 PM");
  const [isAddCalendarOpen, setIsAddCalendarOpen] = useState(false);

  // Edit Form State
  const [editDate, setEditDate] = useState("May 16, 2024");
  const [editStart, setEditStart] = useState("5:00 AM");
  const [editEnd, setEditEnd] = useState("10:00 pm");
  const [isEditCalendarOpen, setIsEditCalendarOpen] = useState(false);

  const handleStartEdit = (ov: DateOverride) => {
    setEditingId(ov.id);
    const d = parseOverrideDate(ov.dateStr);
    setEditDate(d ? format(d, "MMM d, yyyy") : ov.dateStr);
    setEditStart(ov.startTime);
    setEditEnd(ov.endTime);
  };

  const handleSaveEdit = (id: string) => {
    const d = parseOverrideDate(editDate);
    const formattedDateStr = d ? format(d, "EEE, MMM d, yyyy") : editDate;
    onUpdateOverride(id, {
      dateStr: formattedDateStr,
      startTime: editStart,
      endTime: editEnd,
    });
    setEditingId(null);
  };

  const handleConfirmAdd = () => {
    const d = parseOverrideDate(newDate);
    const formattedDateStr = d ? format(d, "EEE, MMM d, yyyy") : newDate;
    onAddOverride({
      dateStr: formattedDateStr,
      startTime: newStart,
      endTime: newEnd,
    });
    setIsAdding(false);
    setNewDate("May 16, 2024");
    setNewStart("5:00 AM");
    setNewEnd("10:00 PM");
  };

  return (
    <div className="rounded-3xl border border-[#EAECF0] bg-white p-6 sm:p-8 shadow-xs h-full flex flex-col">
      {/* Header: Title only */}
      <div>
        <h3 className="text-xl font-medium text-[#101828]">
          Date overrides
        </h3>
      </div>

      {/* Overrides List & Actions */}
      <div className="mt-2 flex-1 flex flex-col">
        {overrides.map((ov) => {
          const isEditing = editingId === ov.id;

          if (isEditing) {
            return (
              /* Inline Edit Override Box (Matches Figma design with shadcn Calendar) */
              <div
                key={ov.id}
                className="mt-4 mb-3 rounded-2xl border border-[#FFCAB6] bg-[#FFFBF7] p-5 space-y-4 transition-all"
              >
                <div>
                  <label className="block text-xs font-semibold text-[#101828]">
                    Override Date
                  </label>
                  <Popover open={isEditCalendarOpen} onOpenChange={setIsEditCalendarOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="mt-1.5 flex h-11 w-full items-center justify-between rounded-xl border border-[#D0D5DD] bg-white px-3.5 text-sm font-normal text-[#101828] hover:border-[#98A2B3] focus:border-[#FF5514] focus:outline-none transition-colors text-left"
                      >
                        <span className={editDate ? "text-[#101828]" : "text-[#98A2B3]"}>
                          {editDate || "Select date"}
                        </span>
                        <IconsaxCalendar
                          size={18}
                          variant="Linear"
                          color="#344054"
                          className="shrink-0"
                        />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 rounded-2xl border border-[#EAECF0] bg-white shadow-lg z-50"
                      align="start"
                    >
                      <CalendarComponent
                        mode="single"
                        selected={parseOverrideDate(editDate)}
                        onSelect={(d: Date | undefined) => {
                          if (d) {
                            setEditDate(format(d, "MMM d, yyyy"));
                            setIsEditCalendarOpen(false);
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#101828]">
                      Start
                    </label>
                    <div className="mt-1.5">
                      <TimeSlotDropdown
                        value={editStart}
                        onChange={setEditStart}
                        variant="input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#101828]">
                      End
                    </label>
                    <div className="mt-1.5">
                      <TimeSlotDropdown
                        value={editEnd}
                        onChange={setEditEnd}
                        variant="input"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="text-sm font-medium text-[#475467] hover:text-[#101828] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(ov.id)}
                    className="rounded-full bg-[#FF5514] px-7 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#E04B12] transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={ov.id}
              className="flex items-center justify-between py-4 border-b border-[#F2F4F7]"
            >
              <div>
                <h4 className="text-sm font-medium text-[#101828]">
                  {ov.dateStr}
                </h4>
                <p className="mt-0.5 text-xs text-[#98A2B3]">
                  {ov.startTime} - {ov.endTime}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => handleStartEdit(ov)}
                  className="p-1 text-[#FF5514] hover:opacity-80 transition-opacity"
                  aria-label="Edit override"
                >
                  <Edit2 size={18} variant="Linear" color="#FF5514" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteOverride(ov.id)}
                  className="p-1 text-[#FF5514] hover:opacity-80 transition-opacity"
                  aria-label="Delete override"
                >
                  <Trash size={18} variant="Linear" color="#FF5514" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Add Date Override Card Form (with shadcn Calendar) */}
        {isAdding && (
          <div className="mt-4 rounded-2xl border border-[#EAECF0] bg-white p-5 space-y-4 shadow-sm animate-in fade-in zoom-in-95 duration-150">
            <h4 className="text-xs sm:text-sm font-bold text-[#101828]">
              Add date override
            </h4>

            <div>
              <label className="block text-xs font-semibold text-[#101828]">
                Select Date
              </label>
              <Popover open={isAddCalendarOpen} onOpenChange={setIsAddCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="mt-1.5 flex h-11 w-full items-center justify-between rounded-xl border border-[#D0D5DD] bg-white px-3.5 text-sm font-normal text-[#101828] hover:border-[#98A2B3] focus:border-[#FF5514] focus:outline-none transition-colors text-left"
                  >
                    <span className={newDate ? "text-[#101828]" : "text-[#98A2B3]"}>
                      {newDate || "Select date"}
                    </span>
                    <IconsaxCalendar
                      size={18}
                      variant="Linear"
                      color="#344054"
                      className="shrink-0"
                    />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 rounded-2xl border border-[#EAECF0] bg-white shadow-lg z-50"
                  align="start"
                >
                  <CalendarComponent
                    mode="single"
                    selected={parseOverrideDate(newDate)}
                    onSelect={(d: Date | undefined) => {
                      if (d) {
                        setNewDate(format(d, "MMM d, yyyy"));
                        setIsAddCalendarOpen(false);
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-semibold text-[#101828]">
                  Start
                </label>
                <div className="mt-1.5">
                  <TimeSlotDropdown
                    value={newStart}
                    onChange={setNewStart}
                    variant="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#101828]">
                  End
                </label>
                <div className="mt-1.5">
                  <TimeSlotDropdown
                    value={newEnd}
                    onChange={setNewEnd}
                    variant="input"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-sm font-medium text-[#475467] hover:text-[#101828] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAdd}
                className="rounded-full bg-[#FF5514] px-7 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#E04B12] transition-colors"
              >
                Add override
              </button>
            </div>
          </div>
        )}

        {/* Empty state if no overrides */}
        {overrides.length === 0 && !isAdding && (
          <div className="py-6 text-center text-xs text-[#98A2B3]">
            No date overrides set yet
          </div>
        )}

        {/* Add Date Override trigger button at bottom of card matching Figma */}
        {!isAdding && (
          <div className="mt-auto pt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 text-sm font-medium text-[#344054] hover:text-[#101828] transition-colors"
            >
              <Plus size={16} />
              <span>Add date override</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
