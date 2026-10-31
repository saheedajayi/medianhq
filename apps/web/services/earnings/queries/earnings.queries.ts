"use client";

import { useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/services/api-client";
import { earningsService, type MentorEarningsSummary } from "@/services/earnings";
import { earningsQueryKeys } from "./query-keys";

export const useMentorEarningsSummary = (options?: { enabled?: boolean; refetchOnWindowFocus?: boolean }) => {
  return useQuery<MentorEarningsSummary, ApiError>({
    queryKey: earningsQueryKeys.mentorSummary(),
    queryFn: async () => {
      const response = await earningsService.getMentorSummary();
      return response.data;
    },
    enabled: options?.enabled,
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
  });
};
