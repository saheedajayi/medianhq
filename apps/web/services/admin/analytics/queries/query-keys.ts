import type { VisitorPeriod } from "@/services/admin/analytics";

export const adminAnalyticsQueryKeys = {
  all: ["admin", "analytics"] as const,
  funnel: () => [...adminAnalyticsQueryKeys.all, "funnel"] as const,
  demandRatio: () => [...adminAnalyticsQueryKeys.all, "demand-ratio"] as const,
  fillRate: () => [...adminAnalyticsQueryKeys.all, "fill-rate"] as const,
  performance: () => [...adminAnalyticsQueryKeys.all, "performance"] as const,
  responseMetrics: () => [...adminAnalyticsQueryKeys.all, "response-metrics"] as const,
  activity: () => [...adminAnalyticsQueryKeys.all, "activity"] as const,
  visitors: (period: VisitorPeriod) => [...adminAnalyticsQueryKeys.all, "visitors", period] as const,
};
