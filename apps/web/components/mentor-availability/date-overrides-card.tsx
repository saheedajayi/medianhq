"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Edit2, Trash2, Plus } from "lucide-react";
import type { DateOverride } from "./types";
import { TimeSlotDropdown } from "./time-slot-dropdown";

interface DateOverridesCardProps {
  overrides: DateOverride[];
  onAddOverride: (override: Omit<DateOverride, "id">) => void;
  onUpdateOverride: (id: string, updates: Partial<DateOverride>) => void;
  onDeleteOverride: (id: string) => void;
}

export function DateOverridesCard({
  overrides,
  onAddOverride,
  onUpdateOverride,
  onDeleteOverride,
}: DateOverridesCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Add Form State
  const [newDate, setNewDate] = useState("May 16, 2024");
  const [newStart, setNewStart] = useState("5:00 AM");
  const [newEnd, setNewEnd] = useState("10:00 PM");

  // Edit Form State
  const [editDate, setEditDate] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");

  const handleStartEdit = (ov: DateOverride) => {
    setEditingId(ov.id);
    setEditDate(ov.dateStr);
    setEditStart(ov.startTime);
    setEditEnd(ov.endTime);
  };

  const handleSaveEdit = (id: string) => {
    onUpdateOverride(id, {
      dateStr: editDate,
      startTime: editStart,
      endTime: editEnd,
    });
    setEditingId(null);
  };

  const handleConfirmAdd = () => {
    onAddOverride({
      dateStr: newDate,
      startTime: newStart,
      endTime: newEnd,
    });
    setIsAdding(false);
    setNewDate("May 16, 2024");
    setNewStart("5:00 AM");
    setNewEnd("10:00 PM");
  };

  return (
    <div className="rounded-2xl border border-[#EAECF0] bg-white p-5 sm:p-6 shadow-2xs">
      <div className="flex items-center justify-between pb-4 border-b border-[#F2F4F7]">
        <h3 className="text-base sm:text-lg font-bold text-[#101828]">
          Date overrides
        </h3>
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 text-xs font-semibold text-[#FF5514] hover:underline"
          >
            <Plus size={14} />
            <span>Add override</span>
          </button>
        )}
      </div>

      <div className="mt-5 space-y-4">
        {/* Existing Overrides List */}
        {overrides.map((ov) => {
          const isEditing = editingId === ov.id;

          if (isEditing) {
            return (
              /* Edit Override Card (Edit Override.svg) */
              <div
                key={ov.id}
                className="rounded-2xl border border-[#FFCAB6] bg-[#FDF9F6] p-4 sm:p-5 space-y-4 transition-all"
              >
                <div>
                  <label className="block text-xs font-semibold text-[#101828]">
                    Override Date
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type="text"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full rounded-xl border border-[#D0D5DD] bg-white py-2 pl-3.5 pr-9 text-xs text-[#101828] focus:border-[#FF5514] focus:outline-none"
                    />
                    <CalendarIcon
                      size={15}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
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

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="text-xs font-medium text-[#667085] hover:text-[#101828]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(ov.id)}
                    className="rounded-full bg-[#FF5514] px-6 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#E04B12]"
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
              className="flex items-center justify-between rounded-xl border border-[#F2F4F7] bg-white p-3.5 hover:border-[#EAECF0] transition-colors"
            >
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-[#101828]">
                  {ov.dateStr}
                </h4>
                <p className="mt-0.5 text-xs text-[#667085]">
                  {ov.startTime} - {ov.endTime}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleStartEdit(ov)}
                  className="rounded-lg p-1.5 text-[#667085] hover:bg-gray-100 hover:text-[#101828] transition-colors"
                  aria-label="Edit override"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteOverride(ov.id)}
                  className="rounded-lg p-1.5 text-[#EA3829] hover:bg-[#FEF3F2] transition-colors"
                  aria-label="Delete override"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}

        {/* Add Date Override Card (Create Override.svg) */}
        {isAdding && (
          <div className="rounded-2xl border border-[#EAECF0] bg-white p-4 sm:p-5 space-y-4 shadow-sm animate-in fade-in zoom-in-95 duration-150">
            <h4 className="text-xs sm:text-sm font-bold text-[#101828]">
              Add date override
            </h4>

            <div>
              <label className="block text-xs font-semibold text-[#101828]">
                Select Date
              </label>
              <div className="relative mt-1.5">
                <input
                  type="text"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full rounded-xl border border-[#D0D5DD] bg-white py-2 pl-3.5 pr-9 text-xs text-[#101828] focus:border-[#FF5514] focus:outline-none"
                />
                <CalendarIcon
                  size={15}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
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

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-xs font-medium text-[#667085] hover:text-[#101828]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAdd}
                className="rounded-full bg-[#FF5514] px-6 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#E04B12]"
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
      </div>
    </div>
  );
}
