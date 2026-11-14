"use client";

import { useState } from "react";
import type { VisitorPeriod } from "@/services/admin/analytics";
import { useVisitorsAnalytics } from "@/services/admin/analytics/queries/analytics.queries";
import { cn } from "@/lib/utils";
import { LineChart } from "../shared/charts/line-chart";
import { AnalyticsTabLayout, type AnalyticsTabProps } from "./analytics-tab-layout";
import { AnalyticsCard, AnalyticsTabState, statCard } from "./analytics-utils";

const PERIODS: { value: VisitorPeriod; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export function VisitorsTab({ tabBar }: AnalyticsTabProps) {
  const [period, setPeriod] = useState<VisitorPeriod>("daily");
  const query = useVisitorsAnalytics(period);

  return (
    <AnalyticsTabState query={query}>
      {({ stats, series }) => (
        <AnalyticsTabLayout
          tabBar={tabBar}
          stats={[
            statCard("Daily Visitors", stats.daily),
            statCard("Weekly Visitors", stats.weekly),
            statCard("Monthly Visitors", stats.monthly),
            statCard("Yearly Visitors", stats.yearly),
          ]}
        >
          <AnalyticsCard
            title="Visitors Trend"
            className="p-5"
            aside={
              <div className="flex flex-wrap gap-5">
                {PERIODS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={period === option.value}
                    onClick={() => setPeriod(option.value)}
                    className={cn(
                      "rounded px-2 py-1 text-lg transition-colors",
                      period === option.value ? "bg-[#FF7A45] text-white" : "bg-[#F2F4F7] text-[#475467]",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            }
          >
            <LineChart
              label="Visitors over time"
              height={400}
              showPoints
              series={[{ label: "Visitors", color: "#FFD9A8" }]}
              points={series.map((point) => ({ label: point.label, values: [point.visitors] }))}
            />
          </AnalyticsCard>
        </AnalyticsTabLayout>
      )}
    </AnalyticsTabState>
  );
}
