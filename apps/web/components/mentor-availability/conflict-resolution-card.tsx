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
    <div className="mt-3 w-full rounded-2xl bg-[#F8F9FA] p-5 sm:p-6 transition-all">
      <h4 className="text-sm font-semibold text-[#101828]">
        Overlapping event detected
      </h4>

      <div className="mt-2 flex items-center gap-2 text-sm font-normal text-[#344054]">
        <span className="size-2 rounded-full bg-[#12B76A] shrink-0" />
        <span>Team Standup • 10:00 AM - 10:30 AM • via Google Calendar</span>
      </div>
      <p className="mt-1 text-xs text-[#98A2B3] ml-4">
        Mentees cannot book during this window
      </p>

      <div className="mt-5">
        <span className="block text-sm font-semibold text-[#101828]">
          Resolution options
        </span>

        <div className="mt-3 space-y-3">
          {/* Option 1: Split */}
          <button
            type="button"
            onClick={() => setSelectedOption("split")}
            className="flex w-full items-start gap-3 text-left transition-opacity hover:opacity-90"
          >
            <div
              className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full transition-colors ${
                selectedOption === "split"
                  ? "bg-[#FF5514]"
                  : "border-2 border-[#D0D5DD] bg-[#F2F4F7]"
              }`}
            >
              {selectedOption === "split" && (
                <div className="size-1.5 rounded-full bg-white" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-[#101828]">
                Split availability around conflict
              </p>
              <p className="mt-0.5 text-xs text-[#667085]">
                Slots become 9:00 AM – 10:00 AM and 10:30 AM – 2:00 pm
              </p>
            </div>
          </button>

          {/* Option 2: Block entire slot */}
          <button
            type="button"
            onClick={() => setSelectedOption("block")}
            className="flex w-full items-start gap-3 text-left transition-opacity hover:opacity-90"
          >
            <div
              className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full transition-colors ${
                selectedOption === "block"
                  ? "bg-[#FF5514]"
                  : "border-2 border-[#D0D5DD] bg-[#F2F4F7]"
              }`}
            >
              {selectedOption === "block" && (
                <div className="size-1.5 rounded-full bg-white" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-[#101828]">
                Block entire slot
              </p>
              <p className="mt-0.5 text-xs text-[#667085]">
                Remove 9:00 AM – 2:00 pm from availability
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onDismiss}
          className="text-sm font-semibold text-[#D92D20] hover:underline"
        >
          Dismiss
        </button>
        <button
          type="button"
          onClick={() => onApplyResolution(selectedOption)}
          className="text-sm font-semibold text-[#FF5514] hover:underline"
        >
          Apply resolution
        </button>
      </div>
    </div>
  );
}
