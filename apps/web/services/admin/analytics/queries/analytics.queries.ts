"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/services/api-client";
import {
  adminAnalyticsService,
  type ActivityAnalytics,
  type DemandRatioAnalytics,
  type FillRateAnalytics,
  type FunnelAnalytics,
  type PerformanceAnalytics,
  type ResponseMetricsAnalytics,
  type VisitorPeriod,
  type VisitorsAnalytics,
} from "@/services/admin/analytics";
import { adminAnalyticsQueryKeys } from "./query-keys";

export const useFunnelAnalytics = () => {
  return useQuery<FunnelAnalytics, ApiError>({
    queryKey: adminAnalyticsQueryKeys.funnel(),
    queryFn: async () => (await adminAnalyticsService.getFunnel()).data,
  });
};

export const useDemandRatioAnalytics = () => {
  return useQuery<DemandRatioAnalytics, ApiError>({
    queryKey: adminAnalyticsQueryKeys.demandRatio(),
    queryFn: async () => (await adminAnalyticsService.getDemandRatio()).data,
  });
};

export const useFillRateAnalytics = () => {
  return useQuery<FillRateAnalytics, ApiError>({
    queryKey: adminAnalyticsQueryKeys.fillRate(),
    queryFn: async () => (await adminAnalyticsService.getFillRate()).data,
  });
};

export const usePerformanceAnalytics = () => {
  return useQuery<PerformanceAnalytics, ApiError>({
    queryKey: adminAnalyticsQueryKeys.performance(),
    queryFn: async () => (await adminAnalyticsService.getPerformance()).data,
  });
};

export const useResponseMetricsAnalytics = () => {
  return useQuery<ResponseMetricsAnalytics, ApiError>({
    queryKey: adminAnalyticsQueryKeys.responseMetrics(),
    queryFn: async () => (await adminAnalyticsService.getResponseMetrics()).data,
  });
};

export const useActivityAnalytics = () => {
  return useQuery<ActivityAnalytics, ApiError>({
    queryKey: adminAnalyticsQueryKeys.activity(),
    queryFn: async () => (await adminAnalyticsService.getActivity()).data,
  });
};

export const useVisitorsAnalytics = (period: VisitorPeriod) => {
  return useQuery<VisitorsAnalytics, ApiError>({
    queryKey: adminAnalyticsQueryKeys.visitors(period),
    queryFn: async () => (await adminAnalyticsService.getVisitors(period)).data,
    // Keeps the chart in place while another period loads
    placeholderData: keepPreviousData,
  });
};
