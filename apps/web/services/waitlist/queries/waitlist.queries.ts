"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/services/api-client";
import {
  waitlistService,
  type WaitlistPayload,
  type WaitlistResponse,
  type WaitlistStatsResponse,
} from "@/services/waitlist";
import { waitlistQueryKeys } from "./query-keys";

export const useCreateWaitlistEntry = () => {
  return useMutation<WaitlistResponse, ApiError, WaitlistPayload>({
    mutationKey: waitlistQueryKeys.create(),
    mutationFn: async (payload) => {
      const response = await waitlistService.create(payload);
      return response.data;
    },
  });
};

export const useWaitlistStats = () => {
  return useQuery<WaitlistStatsResponse, ApiError>({
    queryKey: waitlistQueryKeys.stats(),
    queryFn: async () => {
      const response = await waitlistService.getStats();
      return response.data;
    },
  });
};
