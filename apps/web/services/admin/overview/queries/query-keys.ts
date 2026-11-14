import type { AdminOverviewRange } from "@/services/admin/overview";

export const adminOverviewQueryKeys = {
  all: ["admin", "overview"] as const,
  overview: (range: AdminOverviewRange) => [...adminOverviewQueryKeys.all, range] as const,
};
