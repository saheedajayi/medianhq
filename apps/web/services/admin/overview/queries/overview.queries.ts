"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/services/api-client";
import { adminOverviewService, type AdminOverview, type AdminOverviewRange } from "@/services/admin/overview";
import { adminOverviewQueryKeys } from "./query-keys";

const OVERVIEW_REFRESH_MS = 60_000;

export const useAdminOverview = (range: AdminOverviewRange) => {
  return useQuery<AdminOverview, ApiError>({
    queryKey: adminOverviewQueryKeys.overview(range),
    queryFn: async () => {
      const response = await adminOverviewService.getOverview(range);
      return response.data;
    },
    // Keeps the page in place while the other range loads
    placeholderData: keepPreviousData,
    refetchInterval: OVERVIEW_REFRESH_MS,
    refetchOnWindowFocus: true,
  });
};
