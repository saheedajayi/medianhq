"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/services/api-client";
import {
  adminModerationService,
  type ModerationFlagsFilters,
  type ModerationFlagsPage,
  type ModerationHistoryPage,
  type ReviewerAction,
} from "@/services/admin/moderation";
import { adminModerationQueryKeys } from "./query-keys";

export const useModerationFlags = (filters: ModerationFlagsFilters, page: number) => {
  return useQuery<ModerationFlagsPage, ApiError>({
    queryKey: adminModerationQueryKeys.flags(filters, page),
    queryFn: async () => {
      const response = await adminModerationService.getFlags(filters, page);
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
};

export const useModerationHistory = (page: number) => {
  return useQuery<ModerationHistoryPage, ApiError>({
    queryKey: adminModerationQueryKeys.history(page),
    queryFn: async () => {
      const response = await adminModerationService.getHistory(page);
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
};

/** A reviewer action changes the queue and adds to the history, so both reload */
export const useTakeFlagAction = (flagId: string) => {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, ReviewerAction>({
    mutationFn: (action) => adminModerationService.takeAction(flagId, action),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminModerationQueryKeys.all }),
  });
};
