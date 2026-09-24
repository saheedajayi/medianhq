"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export const ALL_TIME_OPTIONS: string[] = [
  "12:00 AM", "12:15 AM", "12:30 AM", "12:45 AM",
  "1:00 AM", "1:15 AM", "1:30 AM", "1:45 AM",
  "2:00 AM", "2:15 AM", "2:30 AM", "2:45 AM",
  "3:00 AM", "3:15 AM", "3:30 AM", "3:45 AM",
  "4:00 AM", "4:15 AM", "4:30 AM", "4:45 AM",
  "5:00 AM", "5:15 AM", "5:30 AM", "5:45 AM",
  "6:00 AM", "6:15 AM", "6:30 AM", "6:45 AM",
  "7:00 AM", "7:15 AM", "7:30 AM", "7:45 AM",
  "8:00 AM", "8:15 AM", "8:30 AM", "8:45 AM",
  "9:00 AM", "9:15 AM", "9:30 AM", "9:45 AM",
  "10:00 AM", "10:15 AM", "10:30 AM", "10:45 AM",
  "11:00 AM", "11:15 AM", "11:30 AM", "11:45 AM",
  "12:00 PM", "12:15 PM", "12:30 PM", "12:45 PM",
  "1:00 PM", "1:15 PM", "1:30 PM", "1:45 PM",
  "2:00 PM", "2:15 PM", "2:30 PM", "2:45 PM",
  "3:00 PM", "3:15 PM", "3:30 PM", "3:45 PM",
  "4:00 PM", "4:15 PM", "4:30 PM", "4:45 PM",
  "5:00 PM", "5:15 PM", "5:30 PM", "5:45 PM",
  "6:00 PM", "6:15 PM", "6:30 PM", "6:45 PM",
  "7:00 PM", "7:15 PM", "7:30 PM", "7:45 PM",
  "8:00 PM", "8:15 PM", "8:30 PM", "8:45 PM",
  "9:00 PM", "9:15 PM", "9:30 PM", "9:45 PM",
  "10:00 PM", "10:15 PM", "10:30 PM", "10:45 PM",
  "11:00 PM", "11:15 PM", "11:30 PM", "11:45 PM",
];

interface TimeSlotDropdownProps {
  value: string;
  onChange: (time: string) => void;
  className?: string;
  variant?: "pill" | "input";
}

export function TimeSlotDropdown({
  value,
  onChange,
  className = "",
  variant = "pill",
}: TimeSlotDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Auto-scroll to selected time
      setTimeout(() => {
        selectedItemRef.current?.scrollIntoView({ block: "center" });
      }, 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const normalizedVal = value.trim();

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      {variant === "pill" ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 rounded-xl bg-[#FFF4EF] px-3.5 py-1.5 text-xs font-semibold text-[#FF5514] transition hover:bg-[#FFE9DF] focus:outline-none ${className}`}
        >
          <span>{normalizedVal || "9:00 AM"}</span>
          <ChevronDown size={14} className="text-[#FF5514]" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex w-full items-center justify-between rounded-xl border border-[#D0D5DD] bg-white px-3.5 py-2 text-xs font-medium text-[#101828] focus:border-[#FF5514] focus:outline-none ${className}`}
        >
          <span>{normalizedVal || "Select time"}</span>
          <ChevronDown size={14} className="text-[#667085]" />
        </button>
      )}

      {isOpen && (
        <div className="absolute left-0 z-50 mt-1 max-h-56 w-36 overflow-y-auto rounded-xl border border-[#EAECF0] bg-white py-1 shadow-xl">
          {ALL_TIME_OPTIONS.map((time) => {
            const isSelected =
              time.toLowerCase() === normalizedVal.toLowerCase() ||
              time.replace(" ", "").toLowerCase() === normalizedVal.replace(" ", "").toLowerCase();

            return (
              <button
                key={time}
                ref={isSelected ? selectedItemRef : undefined}
                type="button"
                onClick={() => {
                  onChange(time);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center px-4 py-2 text-left text-xs transition-colors ${
                  isSelected
                    ? "bg-[#FFF4EF] font-semibold text-[#FF5514]"
                    : "text-[#344054] hover:bg-[#F9FAFB]"
                }`}
              >
                {time}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
