"use client";

import { useState } from "react";

interface ConflictResolutionCardProps {
  onDismiss: () => void;
  onApplyResolution: (option: "split" | "block") => void;
}

export function ConflictResolutionCard({
  onDismiss,
  onApplyResolution,
}: ConflictResolutionCardProps) {
  const [selectedOption, setSelectedOption] = useState<"split" | "block">("split");

  return (
    <div className="mt-3 rounded-2xl border border-[#EAECF0] bg-[#F8F9FA] p-4 sm:p-5 transition-all">
      <h4 className="text-sm font-semibold text-[#101828]">
        Overlapping event detected
      </h4>

      <div className="mt-2 flex items-center gap-2 text-xs font-medium text-[#344054]">
        <span className="size-2 rounded-full bg-[#12B76A] shrink-0" />
        <span>Team Standup • 10:00 AM - 10:30 AM • via Google Calendar</span>
      </div>
      <p className="mt-1 text-xs text-[#667085]">
        Mentees cannot book during this window
      </p>

      <div className="mt-4">
        <span className="block text-xs font-semibold text-[#101828]">
          Resolution options
        </span>

        <div className="mt-2.5 space-y-2.5">
          {/* Option 1: Split */}
          <button
            type="button"
            onClick={() => setSelectedOption("split")}
            className="flex w-full items-start gap-3 rounded-xl border border-transparent p-2 text-left hover:bg-white/60 transition-colors"
          >
            <div
              className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                selectedOption === "split" ? "border-[#FF5514]" : "border-[#D0D5DD]"
              }`}
            >
              {selectedOption === "split" && (
                <div className="size-2 rounded-full bg-[#FF5514]" />
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-[#101828]">
                Split availability around conflict
              </p>
              <p className="mt-0.5 text-xs text-[#667085]">
                Slots become 9:00 AM - 10:00 AM and 10:30 AM - 2:00 pm
              </p>
            </div>
          </button>

          {/* Option 2: Block entire slot */}
          <button
            type="button"
            onClick={() => setSelectedOption("block")}
            className="flex w-full items-start gap-3 rounded-xl border border-transparent p-2 text-left hover:bg-white/60 transition-colors"
          >
            <div
              className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                selectedOption === "block" ? "border-[#FF5514]" : "border-[#D0D5DD]"
              }`}
            >
              {selectedOption === "block" && (
                <div className="size-2 rounded-full bg-[#FF5514]" />
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-[#101828]">
                Block entire slot
              </p>
              <p className="mt-0.5 text-xs text-[#667085]">
                Remove 9:00 AM - 2:00 pm from availability
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#EAECF0]">
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs font-semibold text-[#FF5514] hover:underline"
        >
          Dismiss
        </button>
        <button
          type="button"
          onClick={() => onApplyResolution(selectedOption)}
          className="text-xs font-semibold text-[#FF5514] hover:underline"
        >
          Apply resolution
        </button>
      </div>
    </div>
  );
}
