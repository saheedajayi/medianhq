"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExploreFilterState } from "./types";
import {
  availabilityOptions,
  experienceLevelOptions,
  expertiseOptions,
  genderOptions,
  locationOptions,
  ratingOptions,
  sessionTypeOptions,
} from "./filter-options";

type PanelFilters = Omit<ExploreFilterState, "search" | "category" | "sortBy">;

interface FiltersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ExploreFilterState;
  onApplyFilters: (filters: PanelFilters) => void;
  onResetFilters: () => void;
}

const emptyPanelFilters: PanelFilters = {
  expertise: undefined,
  locations: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  availability: undefined,
  sessionTypes: undefined,
  minRating: undefined,
  experienceLevels: undefined,
  gender: undefined,
};

function pickPanelFilters(filters: ExploreFilterState): PanelFilters {
  return {
    expertise: filters.expertise,
    locations: filters.locations,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    availability: filters.availability,
    sessionTypes: filters.sessionTypes,
    minRating: filters.minRating,
    experienceLevels: filters.experienceLevels,
    gender: filters.gender,
  };
}

// Adds or removes a value; an empty list becomes undefined so it counts as "no filter"
function toggleValue<T>(list: T[] | undefined, value: T): T[] | undefined {
  const next = list?.includes(value) ? list.filter((item) => item !== value) : [...(list ?? []), value];
  return next.length ? next : undefined;
}

function parsePrice(value: string): number | undefined {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : undefined;
}

function formatPrice(value: number | undefined): string {
  return value === undefined ? "" : `₦${value.toLocaleString()}`;
}

function OptionCheckbox({
  checked,
  onChange,
  children,
  type = "checkbox",
  name,
}: {
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
  type?: "checkbox" | "radio";
  name?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-xs text-[#475467]">
      <input
        type={type}
        name={name}
        checked={checked}
        onChange={onChange}
        className="size-3.5 shrink-0 cursor-pointer rounded-[4px] accent-[#FF5500]"
      />
      {children}
    </label>
  );
}

function RatingStars({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "size-3",
            star <= count ? "fill-[#FDB022] text-[#FDB022]" : "text-[#D0D5DD]"
          )}
        />
      ))}
    </span>
  );
}

export function FiltersDialog({ isOpen, onClose, filters, onApplyFilters, onResetFilters }: FiltersDialogProps) {
  const [draft, setDraft] = useState<PanelFilters>(() => pickPanelFilters(filters));
  const [openSections, setOpenSections] = useState<string[]>(["Expertise"]);

  useEffect(() => {
    if (isOpen) setDraft(pickPanelFilters(filters));
  }, [isOpen, filters]);

  if (!isOpen) return null;

  const update = (patch: Partial<PanelFilters>) => setDraft((prev) => ({ ...prev, ...patch }));

  const toggleSection = (name: string) =>
    setOpenSections((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );

  const section = (name: string, content: React.ReactNode) => {
    const isSectionOpen = openSections.includes(name);
    return (
      <div className="border-b border-[#F2F4F7]">
        <button
          type="button"
          onClick={() => toggleSection(name)}
          className="flex w-full items-center justify-between py-3.5 text-left text-xs font-medium text-[#344054]"
          aria-expanded={isSectionOpen}
        >
          {name}
          <ChevronDown
            className={cn("size-4 text-[#667085] transition-transform", isSectionOpen && "rotate-180")}
          />
        </button>
        {isSectionOpen && (
          <div className="mb-3.5 space-y-3 rounded-xl border border-[#F2F4F7] p-3">{content}</div>
        )}
      </div>
    );
  };

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/25 lg:hidden"
        aria-label="Close filters"
        onClick={onClose}
      />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-[min(360px,100vw)] flex-col border-l border-[#E9EAF0] bg-white shadow-xl lg:sticky lg:top-6 lg:z-auto lg:mb-8 lg:h-auto lg:max-h-[calc(100vh-6rem)] lg:w-[300px] lg:shrink-0 lg:rounded-2xl lg:border lg:border-[#EAECF0] lg:shadow-xs"
        aria-label="Filters"
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-base font-semibold text-[#101828]">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="flex size-7 items-center justify-center rounded-full bg-[#F7F8FB] text-[#344054] transition-colors hover:bg-[#EAECF0]"
          >
            <X className="size-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {section(
            "Expertise",
            expertiseOptions.map(({ label }) => (
              <OptionCheckbox
                key={label}
                checked={!!draft.expertise?.includes(label)}
                onChange={() => update({ expertise: toggleValue(draft.expertise, label) })}
              >
                {label}
              </OptionCheckbox>
            ))
          )}

          {section(
            "Location",
            locationOptions.map((location) => (
              <OptionCheckbox
                key={location}
                checked={!!draft.locations?.includes(location)}
                onChange={() => update({ locations: toggleValue(draft.locations, location) })}
              >
                {location}
              </OptionCheckbox>
            ))
          )}

          {section(
            "Price range",
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  ["Min", "minPrice", "₦0"],
                  ["Max", "maxPrice", "₦50,000"],
                ] as const
              ).map(([label, key, placeholder]) => (
                <label key={key} className="flex flex-col gap-1.5 text-[11px] text-[#98A2B3]">
                  {label}
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder={placeholder}
                    value={formatPrice(draft[key])}
                    onChange={(event) => update({ [key]: parsePrice(event.target.value) })}
                    className="h-8 w-full rounded-lg bg-[#F7F8FB] px-2.5 text-xs text-[#344054] placeholder:text-[#98A2B3] focus:outline-none focus:ring-1 focus:ring-[#FF5500]"
                  />
                </label>
              ))}
            </div>
          )}

          {section(
            "Availability",
            availabilityOptions.map(({ value, label }) => (
              <OptionCheckbox
                key={value}
                checked={!!draft.availability?.includes(value)}
                onChange={() => update({ availability: toggleValue(draft.availability, value) })}
              >
                {label}
              </OptionCheckbox>
            ))
          )}

          {section(
            "Session type",
            sessionTypeOptions.map(({ value, label }) => (
              <OptionCheckbox
                key={value}
                checked={!!draft.sessionTypes?.includes(value)}
                onChange={() => update({ sessionTypes: toggleValue(draft.sessionTypes, value) })}
              >
                {label}
              </OptionCheckbox>
            ))
          )}

          {section(
            "Rating",
            ratingOptions.map((stars) => (
              <OptionCheckbox
                key={stars}
                checked={draft.minRating === stars}
                onChange={() => update({ minRating: draft.minRating === stars ? undefined : stars })}
              >
                {stars} {stars === 1 ? "star" : "stars"} &amp; up
                <RatingStars count={stars} />
              </OptionCheckbox>
            ))
          )}

          {section(
            "Experience level",
            experienceLevelOptions.map(({ value, label }) => (
              <OptionCheckbox
                key={value}
                checked={!!draft.experienceLevels?.includes(value)}
                onChange={() =>
                  update({ experienceLevels: toggleValue(draft.experienceLevels, value) })
                }
              >
                {label}
              </OptionCheckbox>
            ))
          )}

          {section(
            "Gender",
            genderOptions.map(({ value, label }) => (
              <OptionCheckbox
                key={value}
                type="radio"
                name="mentor-gender"
                checked={draft.gender === value}
                onChange={() => update({ gender: value })}
              >
                {label}
              </OptionCheckbox>
            ))
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between px-5 py-4">
          <button
            type="button"
            onClick={() => {
              setDraft(emptyPanelFilters);
              onResetFilters();
            }}
            className="rounded-full border border-[#EAECF0] px-3.5 py-1.5 text-xs font-medium text-[#475467] transition-colors hover:bg-[#F9FAFB]"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={() => {
              onApplyFilters(draft);
              onClose();
            }}
            className="rounded-full bg-[#FF5500] px-4 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-[#E04B00]"
          >
            Show results
          </button>
        </div>
      </aside>
    </>
  );
}
