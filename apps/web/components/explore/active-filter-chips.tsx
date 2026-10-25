"use client";

import { X } from "lucide-react";
import type { ExploreFilterState } from "./types";
import {
  availabilityOptions,
  experienceLevelOptions,
  genderOptions,
  sessionTypeOptions,
} from "./filter-options";

interface ActiveFilterChipsProps {
  filters: ExploreFilterState;
  onChange: (patch: Partial<ExploreFilterState>) => void;
  onClearAll: () => void;
}

type Chip = { key: string; label: string; remove: Partial<ExploreFilterState> };

function without<T>(list: T[] | undefined, value: T): T[] | undefined {
  const next = (list ?? []).filter((item) => item !== value);
  return next.length ? next : undefined;
}

function labelFor<T extends string>(options: { value: T; label: string }[], value: T) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function formatNaira(value: number) {
  return `₦${value.toLocaleString()}`;
}

/**
 * Lists the filters applied from the Filters dialog so results are easy to understand and undo.
 * The category tabs and search box already show their own state, so they get no chips.
 */
export function ActiveFilterChips({ filters, onChange, onClearAll }: ActiveFilterChipsProps) {
  const chips: Chip[] = [];

  filters.expertise?.forEach((value) =>
    chips.push({ key: `expertise-${value}`, label: value, remove: { expertise: without(filters.expertise, value) } })
  );
  filters.locations?.forEach((value) =>
    chips.push({ key: `location-${value}`, label: value, remove: { locations: without(filters.locations, value) } })
  );
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const label =
      filters.minPrice !== undefined && filters.maxPrice !== undefined
        ? `${formatNaira(filters.minPrice)} – ${formatNaira(filters.maxPrice)}`
        : filters.minPrice !== undefined
          ? `From ${formatNaira(filters.minPrice)}`
          : `Up to ${formatNaira(filters.maxPrice!)}`;
    chips.push({ key: "price", label, remove: { minPrice: undefined, maxPrice: undefined } });
  }
  filters.availability?.forEach((value) =>
    chips.push({
      key: `availability-${value}`,
      label: labelFor(availabilityOptions, value),
      remove: { availability: without(filters.availability, value) },
    })
  );
  filters.sessionTypes?.forEach((value) =>
    chips.push({
      key: `session-${value}`,
      label: labelFor(sessionTypeOptions, value),
      remove: { sessionTypes: without(filters.sessionTypes, value) },
    })
  );
  if (filters.minRating !== undefined) {
    chips.push({ key: "rating", label: `${filters.minRating}+ stars`, remove: { minRating: undefined } });
  }
  filters.experienceLevels?.forEach((value) =>
    chips.push({
      key: `experience-${value}`,
      label: labelFor(experienceLevelOptions, value),
      remove: { experienceLevels: without(filters.experienceLevels, value) },
    })
  );
  if (filters.gender) {
    chips.push({ key: "gender", label: labelFor(genderOptions, filters.gender), remove: { gender: undefined } });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#FFD6C2] bg-[#FFF4ED] py-1 pl-3 pr-1.5 text-xs font-medium text-[#B93815]"
        >
          {chip.label}
          <button
            type="button"
            onClick={() => onChange(chip.remove)}
            aria-label={`Remove ${chip.label} filter`}
            className="flex size-4 items-center justify-center rounded-full hover:bg-[#FFD6C2]"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs font-semibold text-[#FF5500] hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
