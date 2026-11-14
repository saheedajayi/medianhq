"use client";

import { SegmentedTabs } from "@/components/ui/custom/segmented-tabs";
import type { FinanceRevenue, RevenuePeriod } from "@/services/admin/finance";
import { cn } from "@/lib/utils";
import { BarChart } from "../shared/charts/bar-chart";
import { financeCardClass, financeHeadingClass, formatAmount, percentOf } from "./finance-utils";

const BAR_COLOR = "#FF8D62";

// Sessions are sold every day; subscriptions would be billed by the month at the shortest
const SESSION_PERIODS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
] as const;
const SUBSCRIPTION_PERIODS = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annually", label: "Annually" },
] as const;

interface RevenueOverviewCardProps {
  revenue: FinanceRevenue;
  period: RevenuePeriod;
  onPeriodChange: (period: RevenuePeriod) => void;
  showSubscriptions: boolean;
  onShowSubscriptionsChange: (show: boolean) => void;
}

export function RevenueOverviewCard({
  revenue,
  period,
  onPeriodChange,
  showSubscriptions,
  onShowSubscriptionsChange,
}: RevenueOverviewCardProps) {
  const key = showSubscriptions ? "subscriptionRevenue" : "sessionRevenue";
  const name = showSubscriptions ? "Subscription Revenue" : "Session Revenue";
  const shown = revenue.series.reduce((sum, bucket) => sum + bucket[key], 0);
  const total = revenue.series.reduce((sum, bucket) => sum + bucket.totalRevenue, 0);

  return (
    <section className={cn(financeCardClass, "p-5")}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className={financeHeadingClass}>Revenue Overview</h2>
          <p className="mt-1.5 text-sm text-[#475467]">
            Daily, weekly and monthly breakdown of revenue from sessions and subscriptions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-8">
          <label className="flex cursor-pointer items-center gap-3 text-lg text-[#475467]">
            <input
              type="checkbox"
              role="switch"
              checked={showSubscriptions}
              onChange={(event) => onShowSubscriptionsChange(event.target.checked)}
              className="peer sr-only"
            />
            <span className="relative h-5 w-9 rounded-full bg-[#EAECF0] transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-[#FF5514] peer-checked:after:translate-x-4" />
            <span className={cn(showSubscriptions && "font-semibold")}>Subscription Revenue</span>
          </label>
          <SegmentedTabs
            tabs={showSubscriptions ? SUBSCRIPTION_PERIODS : SESSION_PERIODS}
            activeTab={period}
            onChange={onPeriodChange}
            size="sm"
          />
        </div>
      </div>

      <div className="mt-4 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
        <BarChart
          label={`${name} by period`}
          series={{ label: name, color: BAR_COLOR }}
          points={revenue.series.map((bucket) => ({ label: bucket.label, values: [bucket[key]] }))}
        />
        <div className="flex gap-3 lg:pt-10">
          <span className="mt-1 size-6 shrink-0 rounded-full" style={{ backgroundColor: BAR_COLOR }} />
          <div>
            <p className="text-xl text-[#667085]">{name}</p>
            <p className="mt-1 text-lg font-semibold text-[#101828]">{formatAmount(shown)}</p>
            <p className="text-lg text-[#344054]">{percentOf(shown, total)}%</p>
          </div>
        </div>
      </div>
    </section>
  );
}
