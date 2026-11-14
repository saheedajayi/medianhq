import type { PayoutsFilters, RefundsFilters, RevenuePeriod, ServiceReportFilters } from "@/services/admin/finance";

export const adminFinanceQueryKeys = {
  all: ["admin", "finance"] as const,
  revenue: (period: RevenuePeriod) => [...adminFinanceQueryKeys.all, "revenue", period] as const,
  payouts: (filters: PayoutsFilters, page: number) => [...adminFinanceQueryKeys.all, "payouts", filters, page] as const,
  sessionCharges: (filters: ServiceReportFilters, page: number) =>
    [...adminFinanceQueryKeys.all, "session-charges", filters, page] as const,
  mentorCharges: (filters: ServiceReportFilters, page: number) =>
    [...adminFinanceQueryKeys.all, "mentor-charges", filters, page] as const,
  refunds: (filters: RefundsFilters, page: number) => [...adminFinanceQueryKeys.all, "refunds", filters, page] as const,
};
