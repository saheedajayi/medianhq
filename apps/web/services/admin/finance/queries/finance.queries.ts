"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/services/api-client";
import {
  adminFinanceService,
  type FinanceRevenue,
  type MentorChargesPage,
  type PayoutsFilters,
  type PayoutsPage,
  type RefundsFilters,
  type RefundsPage,
  type RevenuePeriod,
  type ServiceReportFilters,
  type SessionChargesPage,
} from "@/services/admin/finance";
import { adminFinanceQueryKeys } from "./query-keys";

export const useFinanceRevenue = (period: RevenuePeriod) => {
  return useQuery<FinanceRevenue, ApiError>({
    queryKey: adminFinanceQueryKeys.revenue(period),
    queryFn: async () => {
      const response = await adminFinanceService.getRevenue(period);
      return response.data;
    },
    // Keeps the charts in place while another period loads
    placeholderData: keepPreviousData,
  });
};

export const useFinancePayouts = (filters: PayoutsFilters, page: number) => {
  return useQuery<PayoutsPage, ApiError>({
    queryKey: adminFinanceQueryKeys.payouts(filters, page),
    queryFn: async () => {
      const response = await adminFinanceService.getPayouts(filters, page);
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
};

export const useSessionCharges = (filters: ServiceReportFilters, page: number) => {
  return useQuery<SessionChargesPage, ApiError>({
    queryKey: adminFinanceQueryKeys.sessionCharges(filters, page),
    queryFn: async () => {
      const response = await adminFinanceService.getSessionCharges(filters, page);
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
};

export const useMentorCharges = (filters: ServiceReportFilters, page: number) => {
  return useQuery<MentorChargesPage, ApiError>({
    queryKey: adminFinanceQueryKeys.mentorCharges(filters, page),
    queryFn: async () => {
      const response = await adminFinanceService.getMentorCharges(filters, page);
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
};

export const useFinanceRefunds = (filters: RefundsFilters, page: number) => {
  return useQuery<RefundsPage, ApiError>({
    queryKey: adminFinanceQueryKeys.refunds(filters, page),
    queryFn: async () => {
      const response = await adminFinanceService.getRefunds(filters, page);
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
};

/** Any payout or refund action changes its tab's list and figures, so finance reloads */
const useFinanceMutation = <TVariables, TData>(mutationFn: (variables: TVariables) => Promise<TData>) => {
  const queryClient = useQueryClient();
  return useMutation<TData, ApiError, TVariables>({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminFinanceQueryKeys.all }),
  });
};

export const useApprovePayout = () =>
  useFinanceMutation(async (payoutId: string) => (await adminFinanceService.approvePayout(payoutId)).data);

export const useRejectPayout = () =>
  useFinanceMutation(
    async (input: { payoutId: string; reason?: string }) =>
      (await adminFinanceService.rejectPayout(input.payoutId, input.reason)).data,
  );

export const useSyncPayout = () =>
  useFinanceMutation(async (payoutId: string) => (await adminFinanceService.syncPayout(payoutId)).data);

export const useApproveRefund = () =>
  useFinanceMutation(async (paymentId: string) => (await adminFinanceService.approveRefund(paymentId)).data);

export const useRejectRefund = () =>
  useFinanceMutation(
    async (input: { paymentId: string; reason?: string }) =>
      (await adminFinanceService.rejectRefund(input.paymentId, input.reason)).data,
  );

export const useRequestRefundInfo = () =>
  useFinanceMutation(async (paymentId: string) => (await adminFinanceService.requestRefundInfo(paymentId)).data);

export const useSaveRefundNote = () =>
  useFinanceMutation(
    async (input: { paymentId: string; note: string }) =>
      (await adminFinanceService.saveRefundNote(input.paymentId, input.note)).data,
  );
