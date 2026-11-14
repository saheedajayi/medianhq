"use client";

import { cn } from "@/lib/utils";
import { ALL, FilterSelect, SearchField, type FilterOption } from "../shared/list-controls";
import { USER_STATUS } from "./user-utils";

const STATUS_OPTIONS: FilterOption[] = [
  { value: ALL, label: "All" },
  ...Object.entries(USER_STATUS).map(([value, { label }]) => ({ value, label })),
];

const JOINED_OPTIONS: FilterOption[] = [
  { value: ALL, label: "Any date" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "year", label: "This year" },
];

const TRUST_OPTIONS: FilterOption[] = [
  { value: ALL, label: "Any" },
  { value: "85+", label: "85 and above" },
  { value: "70-84", label: "70 to 84" },
  { value: "<70", label: "Below 70" },
];

export interface UserDirectoryFilterValues {
  search: string;
  status: string;
  joined: string;
  country: string;
  trust: string;
}

export const EMPTY_USER_FILTERS: UserDirectoryFilterValues = {
  search: "",
  status: ALL,
  joined: ALL,
  country: ALL,
  trust: ALL,
};

interface UserDirectoryFiltersProps {
  values: UserDirectoryFilterValues;
  onChange: (values: Partial<UserDirectoryFilterValues>) => void;
  countries: string[];
  /** Mentees have no Trust Score, so its filter is hidden on their tab */
  showTrustFilter: boolean;
  /** Explains the dash in the Trust Score column on the mentor and mentee tabs */
  showTrustNote: boolean;
}

export function UserDirectoryFilters({
  values,
  onChange,
  countries,
  showTrustFilter,
  showTrustNote,
}: UserDirectoryFiltersProps) {
  const countryOptions: FilterOption[] = [
    { value: ALL, label: "All" },
    ...countries.map((country) => ({ value: country, label: country })),
  ];

  return (
    <div className="flex flex-col gap-3">
      <SearchField
        value={values.search}
        onChange={(search) => onChange({ search })}
        placeholder="Search name, email or user ID..."
        label="Search users"
      />

      <div className={cn("grid gap-3 sm:grid-cols-2", showTrustFilter ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
        <FilterSelect
          label="Status"
          value={values.status}
          options={STATUS_OPTIONS}
          onChange={(status) => onChange({ status })}
        />
        <FilterSelect
          label="Joined"
          value={values.joined}
          options={JOINED_OPTIONS}
          onChange={(joined) => onChange({ joined })}
        />
        <FilterSelect
          label="Country"
          value={values.country}
          options={countryOptions}
          onChange={(country) => onChange({ country })}
        />
        {showTrustFilter && (
          <FilterSelect
            label="Mentor Trust Score"
            value={values.trust}
            options={TRUST_OPTIONS}
            onChange={(trust) => onChange({ trust })}
          />
        )}
      </div>

      {showTrustNote && (
        <p className="text-xs text-[#667085]">
          Trust Score is only available for mentors; mentee accounts show — (not applicable).
        </p>
      )}
    </div>
  );
}
