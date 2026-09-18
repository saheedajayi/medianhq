"use client";

import { SearchNormal1, Setting4 } from "iconsax-react";

interface ExploreHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onOpenFilters: () => void;
  activeFilterCount?: number;
}

export function ExploreHeader({
  searchQuery,
  onSearchChange,
  onOpenFilters,
  activeFilterCount = 0,
}: ExploreHeaderProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#101828] sm:text-3xl">
          Discover Mentors
        </h1>
        <p className="mt-1 text-sm text-[#667085] sm:text-base">
          Choose a mentor that makes you comfortable.
        </p>
      </div>

      {/* Search Bar & Filters Trigger */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <SearchNormal1
            size="20"
            variant="Outline"
            color="#667085"
            className="pointer-events-none absolute left-4.5 top-1/2 -translate-y-1/2 shrink-0"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search mentor by name, role or company..."
            className="h-12 w-full rounded-full border border-[#EAECF0] bg-[#F2F4F7] pl-12 pr-4 text-sm text-[#101828] placeholder-[#98A2B3] outline-hidden transition-all focus:border-[#FF5500] focus:bg-white focus:ring-2 focus:ring-[#FF5500]/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-[#667085] hover:text-[#101828]"
            >
              Clear
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenFilters}
          className="flex h-12 shrink-0 items-center gap-2 rounded-full border border-[#EAECF0] bg-white px-5 text-sm font-medium text-[#344054] shadow-2xs transition-all hover:bg-[#F9FAFB] hover:text-[#101828] active:scale-[0.98]"
        >
          <Setting4 size="18" variant="Outline" color="#344054" className="shrink-0" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-[#FF5500] text-[11px] font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
