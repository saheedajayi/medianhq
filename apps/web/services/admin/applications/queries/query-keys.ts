import type { AdminApplicationsFilters } from "@/services/admin/applications";

export const adminApplicationsQueryKeys = {
  all: ["admin", "applications"] as const,
  list: (filters: AdminApplicationsFilters, page: number) =>
    [...adminApplicationsQueryKeys.all, "list", filters, page] as const,
  detail: (applicationId: string) => [...adminApplicationsQueryKeys.all, "detail", applicationId] as const,
};
