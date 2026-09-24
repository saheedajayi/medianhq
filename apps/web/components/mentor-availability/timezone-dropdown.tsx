"use client";

import { useEffect, useRef, useState } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { Global } from "iconsax-react";

export const TIMEZONE_OPTIONS = [
  "(-12:00) International Date Line West",
  "(-11:00) Midway Island, Samoa",
  "(-10:00) Hawaii",
  "(-09:00) Alaska",
  "(-08:00) Pacific Time (US & Canada)",
  "(-07:00) Mountain Time (US & Canada)",
  "(-06:00) Central Time (US & Canada)",
  "(-05:00) Eastern Time (US & Canada)",
  "(-04:00) Atlantic Time (Canada)",
  "(+00:00) UTC",
  "(+01:00) West Central Africa / Lagos / London BST",
  "(+02:00) Cairo, Jerusalem",
  "(+03:00) Nairobi, Moscow",
  "(+04:00) Dubai, Baku",
  "(+05:30) Mumbai, New Delhi",
  "(+08:00) Singapore, Beijing, Perth",
  "(+09:00) Tokyo, Seoul",
  "(+10:00) Sydney, Melbourne",
  "(+12:00) Auckland, Fiji",
];

interface TimezoneDropdownProps {
  value: string;
  onChange: (tz: string) => void;
}

export function TimezoneDropdown({ value, onChange }: TimezoneDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  const filtered = TIMEZONE_OPTIONS.filter((tz) =>
    tz.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#475467] hover:text-[#101828] transition-colors focus:outline-none"
      >
        <Global size="18" variant="Outline" color="#475467" />
        <span className="truncate max-w-[200px] sm:max-w-none">{value}</span>
        <ChevronDown size={14} className="text-[#667085]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 sm:w-96 rounded-2xl border border-[#EAECF0] bg-white p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          {/* Search bar inside dropdown */}
          <div className="relative mb-2">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98A2B3]"
            />
            <input
              type="text"
              placeholder="Search timezone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#EAECF0] bg-[#F9FAFB] py-2 pl-9 pr-3 text-xs text-[#101828] placeholder-[#98A2B3] focus:border-[#FF5514] focus:bg-white focus:outline-none"
              autoFocus
            />
          </div>

          {/* Timezone List */}
          <div className="max-h-60 overflow-y-auto space-y-0.5 pr-1 divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#98A2B3]">
                No timezones found
              </div>
            ) : (
              filtered.map((tz) => {
                const isSelected = tz === value;
                return (
                  <button
                    key={tz}
                    type="button"
                    onClick={() => {
                      onChange(tz);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition-colors ${
                      isSelected
                        ? "bg-[#FFF4EF] font-semibold text-[#FF5514]"
                        : "text-[#344054] hover:bg-[#F9FAFB]"
                    }`}
                  >
                    <span>{tz}</span>
                    {isSelected && <Check size={14} className="text-[#FF5514]" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
