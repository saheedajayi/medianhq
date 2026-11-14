"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

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
