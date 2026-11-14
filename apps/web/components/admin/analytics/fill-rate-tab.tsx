"use client";

import { ArrowRight } from "iconsax-react";
import { useFillRateAnalytics } from "@/services/admin/analytics/queries/analytics.queries";
import { cn } from "@/lib/utils";
import { DonutChart } from "../shared/charts/donut-chart";
import { formatCount } from "../shared/format";
import { AnalyticsTabLayout, type AnalyticsTabProps } from "./analytics-tab-layout";
import { AnalyticsCard, AnalyticsTabState, ProgressBar, statCard } from "./analytics-utils";

const VERTICAL_COLORS = ["#F2F4F7", "#FFD9A8", "#FF8D62", "#8C5A52"];

export function FillRateTab({ tabBar }: AnalyticsTabProps) {
  const query = useFillRateAnalytics();

  return (
    <AnalyticsTabState query={query}>
      {({ stats, flow, byVertical }) => (
        <AnalyticsTabLayout
          tabBar={tabBar}
          stats={[
            statCard("Total Booking Requests", stats.totalRequests),
            statCard("Successful Bookings", stats.successful),
            statCard("Failed Bookings", stats.failed),
          ]}
        >
          <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <AnalyticsCard title="Booking Flow" className="pb-10">
              <ol className="flex flex-wrap items-center gap-6">
                {[
                  { label: "Booking Requests", value: flow.requests },
                  { label: "Accepted", value: flow.accepted, isHighlighted: true },
                  { label: "Scheduled", value: flow.scheduled },
                ].map((step, index) => (
                  <li key={step.label} className="flex flex-1 items-center gap-6">
                    {index > 0 && <ArrowRight size="20" variant="Outline" color="#475467" className="shrink-0" />}
                    <div
                      className={cn(
                        "flex-1 rounded-lg border px-4 py-8 text-center",
                        step.isHighlighted ? "border-[#12D64A] bg-[#DCF8E4]" : "border-[#D0D5DD] bg-[#EAECF0]",
                      )}
                    >
                      <p className="text-3xl font-semibold text-[#344054]">{formatCount(step.value)}</p>
                      <p className="mt-1 text-lg text-[#667085]">{step.label}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-9 flex items-center gap-4">
                <ProgressBar pct={flow.fillRatePct} color="#12C940" className="h-3.5 flex-1" />
                <span className="text-2xl text-[#344054]">{flow.fillRatePct}%</span>
              </div>
            </AnalyticsCard>

            <AnalyticsCard title="By Vertical">
              {byVertical.length === 0 ? (
                <p className="text-sm text-[#667085]">No booking requests this week.</p>
              ) : (
                <div className="flex flex-wrap items-center gap-6">
                  <DonutChart
                    label="Fill rate by vertical"
                    size={170}
                    slices={byVertical.map((row, index) => ({
                      label: row.vertical,
                      value: row.fillRatePct,
                      color: VERTICAL_COLORS[index] ?? "#EAECF0",
                    }))}
                  />
                  <ul className="flex flex-col gap-5">
                    {byVertical.map((row, index) => (
                      <li key={row.vertical} className="flex items-center gap-2 text-sm text-[#101828]">
                        <span className="size-4 rounded-full" style={{ backgroundColor: VERTICAL_COLORS[index] }} />
                        {row.vertical}
                        <span className="ml-2 text-[10px] text-[#98A2B3]">{row.fillRatePct}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </AnalyticsCard>
          </div>
        </AnalyticsTabLayout>
      )}
    </AnalyticsTabState>
  );
}
