"use client";

import { ArrowDown2 } from "iconsax-react";
import { cn } from "@/lib/utils";
import { ExploreMentor, SortOption } from "./types";
import { MentorCard } from "./mentor-card";

interface MentorsGridSectionProps {
  mentors: ExploreMentor[];
  totalCount: number;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onResetFilters?: () => void;
  isFiltersOpen?: boolean;
}

const sortOptions: { label: string; value: SortOption }[] = [
  { label: "Sort by: Relevance", value: "relevance" },
  { label: "Sort by: Highest Rated", value: "rating" },
  { label: "Sort by: Most Sessions", value: "sessions" },
  { label: "Sort by: Name", value: "name" },
];

export function MentorsGridSection({
  mentors,
  totalCount,
  sortBy,
  onSortChange,
  onResetFilters,
  isFiltersOpen = false,
}: MentorsGridSectionProps) {
  return (
    <section className="flex flex-col gap-5">
      {/* Subheader: Results count & Sort dropdown */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <span className="text-sm font-medium text-[#475467]">
          Showing {totalCount} {totalCount === 1 ? "mentor" : "mentors"}
        </span>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            aria-label="Sort mentors"
            className="h-8 appearance-none rounded-full border border-[#F2F2F7] bg-[#F7F8FB] pl-3.5 pr-8 text-xs font-medium text-[#344054] outline-hidden transition-colors hover:bg-[#EAECF0]/60 focus:border-[#FF5500]"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ArrowDown2
            size="12"
            variant="Linear"
            color="#667085"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
          />
        </div>
      </div>

      {/* Grid of Mentors or 'No mentors found' recovery state */}
      {mentors.length > 0 ? (
        <div
          className={cn(
            "grid grid-cols-1 gap-6 md:grid-cols-2",
            isFiltersOpen ? "lg:grid-cols-2" : "lg:grid-cols-3",
          )}
        >
          {mentors.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          {/* Circular Search Badge */}
          <div className="relative flex size-14 items-center justify-center rounded-full bg-[#FFEEE8]">
            <div className="size-5 rounded-full border-2 border-[#FF5500]/70" />
            <div className="absolute right-3.5 bottom-3.5 size-1.5 rounded-full bg-[#FF5500]" />
          </div>

          <h3 className="mt-4 text-lg font-bold text-[#101828]">
            No mentors found
          </h3>
          <p className="mt-1 max-w-sm text-sm text-[#667085]">
            Try adjusting your filters or search terms to find the right mentor for you.
          </p>
          {onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="mt-4 rounded-full bg-[#FF5500] px-5 py-2 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-[#E04B00]"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}
    </section>
  );
}
