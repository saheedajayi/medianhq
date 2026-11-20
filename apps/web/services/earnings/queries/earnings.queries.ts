"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/services/api-client";
import {
  earningsService,
  type Bank,
  type EarningsView,
  type MentorEarningsSummary,
  type Page,
  type Payout,
  type PayoutAccount,
  type PayoutAccountInput,
  type PayoutStatement,
  type SessionEarning,
  type SessionEarningDetails,
} from "@/services/earnings";
import { earningsQueryKeys } from "./query-keys";

const DAY_MS = 24 * 60 * 60 * 1000;

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

export const useSessionEarnings = (page: number, view?: EarningsView) => {
  return useQuery<Page<SessionEarning>, ApiError>({
    queryKey: earningsQueryKeys.sessions(page, view),
    queryFn: async () => {
      const response = await earningsService.getEarnings(page, view);
      return response.data;
    },
    // Keeps the rows in place while another page loads
    placeholderData: keepPreviousData,
  });
};

export const useSessionEarning = (earningId: string | null) => {
  return useQuery<SessionEarningDetails, ApiError>({
    queryKey: earningsQueryKeys.session(earningId ?? ""),
    queryFn: async () => {
      const response = await earningsService.getEarning(earningId as string);
      return response.data;
    },
    enabled: !!earningId,
  });
};

export const useBanks = (options?: { enabled?: boolean }) => {
  return useQuery<Bank[], ApiError>({
    queryKey: earningsQueryKeys.banks(),
    queryFn: async () => {
      const response = await earningsService.getBanks();
      return response.data;
    },
    enabled: options?.enabled,
    // The list of banks rarely changes
    staleTime: DAY_MS,
  });
};

export const usePayoutAccount = () => {
  return useQuery<PayoutAccount | null, ApiError>({
    queryKey: earningsQueryKeys.payoutAccount(),
    queryFn: async () => {
      const response = await earningsService.getPayoutAccount();
      return response.data ?? null;
    },
  });
};

export const usePayouts = (page: number) => {
  return useQuery<Page<Payout>, ApiError>({
    queryKey: earningsQueryKeys.payouts(page),
    queryFn: async () => {
      const response = await earningsService.getPayouts(page);
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
};

export const usePayoutStatement = (payoutId: string | null) => {
  return useQuery<PayoutStatement, ApiError>({
    queryKey: earningsQueryKeys.payoutStatement(payoutId ?? ""),
    queryFn: async () => {
      const response = await earningsService.getPayoutStatement(payoutId as string);
      return response.data;
    },
    enabled: !!payoutId,
  });
};

/**
 * A saved account or a new payout changes the balance, the history and the rows, so earnings reload.
 * The reload isn't awaited: the dialog that made the change moves on as soon as it is saved.
 */
const useEarningsMutation = <TVariables, TData>(mutationFn: (variables: TVariables) => Promise<TData>) => {
  const queryClient = useQueryClient();
  return useMutation<TData, ApiError, TVariables>({
    mutationFn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: earningsQueryKeys.all });
    },
  });
};

export const useResolvePayoutAccount = () =>
  useMutation({
    mutationFn: async (input: PayoutAccountInput) => (await earningsService.resolvePayoutAccount(input)).data,
  });

export const useSavePayoutAccount = () =>
  useEarningsMutation(async (input: PayoutAccountInput) => (await earningsService.savePayoutAccount(input)).data);

export const useRequestPayout = () =>
  useEarningsMutation(async (password: string) => (await earningsService.requestPayout(password)).data);
