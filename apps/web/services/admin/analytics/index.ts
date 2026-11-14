import { apiClient } from "@/services/api-client";
import type {
  ActivityAnalytics,
  DemandRatioAnalytics,
  FillRateAnalytics,
  FunnelAnalytics,
  PerformanceAnalytics,
  ResponseMetricsAnalytics,
  VisitorPeriod,
  VisitorsAnalytics,
} from "./types";

const ANALYTICS_PATH = "/admin/analytics";

export const adminAnalyticsService = {
  getFunnel() {
    return apiClient.get<FunnelAnalytics>(`${ANALYTICS_PATH}/funnel`);
  },
  getDemandRatio() {
    return apiClient.get<DemandRatioAnalytics>(`${ANALYTICS_PATH}/demand-ratio`);
  },
  getFillRate() {
    return apiClient.get<FillRateAnalytics>(`${ANALYTICS_PATH}/fill-rate`);
  },
  getPerformance() {
    return apiClient.get<PerformanceAnalytics>(`${ANALYTICS_PATH}/performance`);
  },
  getResponseMetrics() {
    return apiClient.get<ResponseMetricsAnalytics>(`${ANALYTICS_PATH}/response-metrics`);
  },
  getActivity() {
    return apiClient.get<ActivityAnalytics>(`${ANALYTICS_PATH}/activity`);
  },
  getVisitors(period: VisitorPeriod) {
    return apiClient.get<VisitorsAnalytics>(`${ANALYTICS_PATH}/visitors`, { params: { period } });
  },
};

export type {
  ActivityAnalytics,
  AnalyticsStat,
  AsyncThread,
  DemandRatioAnalytics,
  FillRateAnalytics,
  FunnelAnalytics,
  PerformanceAnalytics,
  ResponseMetricsAnalytics,
  VerticalRatio,
  VisitorPeriod,
  VisitorsAnalytics,
} from "./types";
