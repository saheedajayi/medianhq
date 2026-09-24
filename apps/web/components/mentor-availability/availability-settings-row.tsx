"use client";

import { Info, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface SettingDropdownProps {
  label: string;
  tooltip: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}

function SettingDropdown({
  label,
  tooltip,
  value,
  options,
  onChange,
}: SettingDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={ref} className="relative flex-1 min-w-[200px]">
      {/* Label with info icon */}
      <div className="flex items-center gap-1.5 mb-2">
        <label className="text-xs sm:text-sm font-semibold text-[#101828]">
          {label}
        </label>
        <div
          className="relative inline-block"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <Info size={14} className="text-[#98A2B3] cursor-pointer hover:text-[#667085]" />
          {showTooltip && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 w-44 rounded-lg bg-[#101828] p-2 text-center text-[11px] text-white shadow-lg pointer-events-none">
              {tooltip}
            </div>
          )}
        </div>
      </div>

      {/* Select Box */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-[#D0D5DD] bg-white px-4 py-2.5 text-xs sm:text-sm font-medium text-[#101828] hover:border-[#98A2B3] focus:border-[#FF5514] focus:outline-none transition-colors"
      >
        <span className="truncate">{value}</span>
        <ChevronDown size={15} className="text-[#667085] shrink-0" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 bottom-full mb-1 z-50 w-full rounded-xl border border-[#EAECF0] bg-white py-1 shadow-xl">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={`flex w-full items-center px-4 py-2 text-left text-xs sm:text-sm transition-colors ${
                opt === value
                  ? "bg-[#FFF4EF] font-semibold text-[#FF5514]"
                  : "text-[#344054] hover:bg-[#F9FAFB]"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface AvailabilitySettingsRowProps {
  bufferBefore: string;
  onBufferBeforeChange: (val: string) => void;
  bufferAfter: string;
  onBufferAfterChange: (val: string) => void;
  sessionStartTimes: string;
  onSessionStartTimesChange: (val: string) => void;
  minimumNotice: string;
  onMinimumNoticeChange: (val: string) => void;
}

export function AvailabilitySettingsRow({
  bufferBefore,
  onBufferBeforeChange,
  bufferAfter,
  onBufferAfterChange,
  sessionStartTimes,
  onSessionStartTimesChange,
  minimumNotice,
  onMinimumNoticeChange,
}: AvailabilitySettingsRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
      <SettingDropdown
        label="Buffer before session"
        tooltip="Prevent bookings directly before a scheduled session to give you preparation time."
        value={bufferBefore}
        options={["No buffer", "5 minutes", "10 minutes", "15 minutes", "30 minutes"]}
        onChange={onBufferBeforeChange}
      />

      <SettingDropdown
        label="Buffer after session"
        tooltip="Extra buffer time following a session to wrap up notes or take a break."
        value={bufferAfter}
        options={["No buffer", "5 minutes", "10 minutes", "15 minutes", "30 minutes"]}
        onChange={onBufferAfterChange}
      />

      <SettingDropdown
        label="Session start times"
        tooltip="How often start time slots are generated across your schedule."
        value={sessionStartTimes}
        options={["5 min intervals", "10 min intervals", "15 min intervals", "30 min intervals"]}
        onChange={onSessionStartTimesChange}
      />

      <SettingDropdown
        label="Minimum notice"
        tooltip="How much lead time is required before a mentee can book a session."
        value={minimumNotice}
        options={["1 hour", "2 hours", "12 hours", "24 hours", "48 hours", "Custom"]}
        onChange={onMinimumNoticeChange}
      />
    </div>
  );
}
