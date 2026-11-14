"use client";

import { ALL, FilterSelect, SearchField, type FilterOption } from "../shared/list-controls";

export const UNASSIGNED = "unassigned";

const SUBMITTED_OPTIONS: FilterOption[] = [
  { value: ALL, label: "Any date" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

export interface ApplicationQueueFilterValues {
  search: string;
  expertise: string;
  submitted: string;
  reviewer: string;
}

export const EMPTY_APPLICATION_FILTERS: ApplicationQueueFilterValues = {
  search: "",
  expertise: ALL,
  submitted: ALL,
  reviewer: ALL,
};

interface ApplicationQueueFiltersProps {
  values: ApplicationQueueFilterValues;
  onChange: (values: Partial<ApplicationQueueFilterValues>) => void;
  expertise: string[];
  reviewers: { id: string; name: string }[];
}

export function ApplicationQueueFilters({ values, onChange, expertise, reviewers }: ApplicationQueueFiltersProps) {
  const expertiseOptions: FilterOption[] = [
    { value: ALL, label: "All" },
    ...expertise.map((name) => ({ value: name, label: name })),
  ];
  const reviewerOptions: FilterOption[] = [
    { value: ALL, label: "All" },
    { value: UNASSIGNED, label: "Unassigned" },
    ...reviewers.map((reviewer) => ({ value: reviewer.id, label: reviewer.name })),
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
      <SearchField
        value={values.search}
        onChange={(search) => onChange({ search })}
        placeholder="Search applicant or application ID..."
        label="Search applications"
        className="h-11"
      />
      <FilterSelect
        label="Expertise"
        value={values.expertise}
        options={expertiseOptions}
        onChange={(expertise) => onChange({ expertise })}
      />
      <FilterSelect
        label="Submitted"
        value={values.submitted}
        options={SUBMITTED_OPTIONS}
        onChange={(submitted) => onChange({ submitted })}
      />
      <FilterSelect
        label="Reviewer"
        value={values.reviewer}
        options={reviewerOptions}
        onChange={(reviewer) => onChange({ reviewer })}
      />
    </div>
  );
}
