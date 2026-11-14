"use client";

import { useState } from "react";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import type { RevenuePeriod } from "@/services/admin/finance";
import { useFinanceRevenue } from "@/services/admin/finance/queries/finance.queries";
import { StatCards } from "../shared/stat-cards";
import { formatAmount, formatChange } from "./finance-utils";
import { RevenueBreakdownCard } from "./revenue-breakdown-card";
import { RevenueOverviewCard } from "./revenue-overview-card";
import { RevenueSummaryCards } from "./revenue-summary-cards";
import { AdminSkeleton, ChartCardSkeleton, StatCardsSkeleton, TableCardSkeleton } from "../shared/skeletons";

export function RevenueTab() {
  const [period, setPeriod] = useState<RevenuePeriod>("daily");
  const [showSubscriptions, setShowSubscriptions] = useState(false);
  const { data: revenue, isError, isFetching, refetch } = useFinanceRevenue(period);

  // The two views offer different periods, and monthly is the one they share
  const handleShowSubscriptionsChange = (show: boolean) => {
    setShowSubscriptions(show);
    setPeriod(show ? "monthly" : "daily");
  };

  if (isError && !revenue) return <DashboardErrorState onRetry={() => refetch()} isRetrying={isFetching} />;

  if (!revenue) {
    return (
      <AdminSkeleton label="Loading revenue" className="gap-4">
        <StatCardsSkeleton />
        <ChartCardSkeleton height={320} />
        <TableCardSkeleton headers={["Source", "Sessions", "Amount", "Share"]} rows={4} />
      </AdminSkeleton>
    );
  }

  const { stats } = revenue;

  return (
    <div className="flex flex-col gap-4">
      <StatCards
        stats={[
          { label: "Total Revenue", ...statOf(stats.totalRevenue) },
          { label: "Sessions Revenue", ...statOf(stats.sessionsRevenue) },
          { label: "Subscription Revenue", ...statOf(stats.subscriptionRevenue) },
          { label: "Average daily revenue", ...statOf(stats.averageDailyRevenue) },
        ]}
      />
      <RevenueOverviewCard
        revenue={revenue}
        period={period}
        onPeriodChange={setPeriod}
        showSubscriptions={showSubscriptions}
        onShowSubscriptionsChange={handleShowSubscriptionsChange}
      />
      <RevenueSummaryCards revenue={revenue} showSubscriptions={showSubscriptions} />
      <RevenueBreakdownCard
        breakdown={revenue.breakdown}
        series={revenue.series}
        showSubscriptions={showSubscriptions}
      />
    </div>
  );
}

const statOf = (stat: { amount: number; changePct: number | null }) => ({
  value: formatAmount(stat.amount),
  note: formatChange(stat.changePct),
});
