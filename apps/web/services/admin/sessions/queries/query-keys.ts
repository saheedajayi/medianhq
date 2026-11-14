import type { CompletedSessionsFilters, NoShowTrackerFilters, RecordingsFilters } from "@/services/admin/sessions";

export const adminSessionsQueryKeys = {
  all: ["admin", "sessions"] as const,
  live: (page: number) => [...adminSessionsQueryKeys.all, "live", page] as const,
  completed: (filters: CompletedSessionsFilters, page: number) =>
    [...adminSessionsQueryKeys.all, "completed", filters, page] as const,
  recordings: (filters: RecordingsFilters, page: number) =>
    [...adminSessionsQueryKeys.all, "recordings", filters, page] as const,
  noShows: (filters: NoShowTrackerFilters, page: number) =>
    [...adminSessionsQueryKeys.all, "no-shows", filters, page] as const,
  calendar: (month: string) => [...adminSessionsQueryKeys.all, "calendar", month] as const,
};
