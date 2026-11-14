"use client";

import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/base/select";
import { ALL, type FilterOption } from "./list-controls";

interface CaptionSelectProps {
  /** Shown while nothing is picked, and as the option that clears the filter */
  placeholder: string;
  /** A small caption above the dropdown */
  caption?: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

/** A grey dropdown with an optional caption above it, as on the sessions and moderation pages */
export function CaptionSelect({ placeholder, caption, value, options, onChange }: CaptionSelectProps) {
  const selected = options.find((option) => option.value === value);

  return (
    <label className="flex flex-col gap-2 text-[11px] text-[#98A2B3]">
      {caption}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-12 min-w-28 rounded-lg border-0 bg-[#F7F8FB] px-3 text-xs font-medium text-[#101828]">
          <span>{selected?.label ?? placeholder}</span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{placeholder}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
