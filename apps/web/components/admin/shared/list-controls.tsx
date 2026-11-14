"use client";

import { SearchNormal1 } from "iconsax-react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/base/select";
import { cn } from "@/lib/utils";
import { outlineButtonClass } from "./shared";

export type FilterOption = { value: string; label: string };

/** The value a filter holds when nothing is picked */
export const ALL = "ALL";

/** A filter's value for the API: nothing when it is still on "All" */
export const pickedFilter = <T extends string>(value: string) => (value === ALL ? undefined : (value as T));

interface FilterSelectProps {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

/** A dropdown that reads "Status: All" when closed */
export function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-11 rounded-xl border-[#EAECF0] bg-white px-3.5 text-sm font-medium text-[#101828]">
        <span>
          {label}: {options.find((option) => option.value === value)?.label}
        </span>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** Read to screen readers; the field has no visible label */
  label: string;
  className?: string;
}

export function SearchField({ value, onChange, placeholder, label, className }: SearchFieldProps) {
  return (
    <label
      className={cn("flex h-12 items-center gap-3 rounded-full border border-[#EAECF0] bg-[#F9FAFB] px-4", className)}
    >
      <SearchNormal1 size="18" variant="Outline" color="#667085" className="shrink-0" />
      <span className="sr-only">{label}</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-[#101828] outline-none placeholder:text-[#98A2B3]"
      />
    </label>
  );
}

/** Page numbers around the current one, with gaps marked as null */
function pageNumbers(current: number, last: number) {
  const pages = [...new Set([1, 2, 3, current - 1, current, current + 1, last])]
    .filter((page) => page >= 1 && page <= last)
    .sort((a, b) => a - b);
  return pages.flatMap((page, index) => {
    const previous = pages[index - 1];
    return previous && page - previous > 1 ? [null, page] : [page];
  });
}

interface PaginationProps {
  page: number;
  lastPage: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, lastPage, onChange }: PaginationProps) {
  return (
    <nav aria-label="Pagination" className="flex items-center gap-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className={cn(outlineButtonClass, "px-3.5 py-2")}
      >
        Previous
      </button>
      {pageNumbers(page, lastPage).map((number, index) =>
        number === null ? (
          <span key={`gap-${index}`} className="px-1 text-xs text-[#667085]">
            …
          </span>
        ) : (
          <button
            key={number}
            type="button"
            onClick={() => onChange(number)}
            aria-current={number === page ? "page" : undefined}
            className={cn(
              "flex size-7 items-center justify-center rounded-full text-xs",
              number === page ? "bg-[#FFEEE8] font-semibold text-[#FF5514]" : "text-[#475467] hover:bg-[#F2F4F7]",
            )}
          >
            {number.toLocaleString("en-NG")}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={page >= lastPage}
        onClick={() => onChange(page + 1)}
        className={cn(outlineButtonClass, "px-3.5 py-2")}
      >
        Next
      </button>
    </nav>
  );
}
