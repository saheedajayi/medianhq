"use client";

import { useFunnelAnalytics } from "@/services/admin/analytics/queries/analytics.queries";
import { LineChart } from "../shared/charts/line-chart";
import { formatCount } from "../shared/format";
import { AnalyticsTabLayout, type AnalyticsTabProps } from "./analytics-tab-layout";
import { AnalyticsCard, AnalyticsTabState, Legend, ProgressBar, statCard } from "./analytics-utils";

// One line per step of the funnel, in the order mentees pass through them
const STEPS = [
  { key: "signUps", label: "Sign ups", color: "#FF5514" },
  { key: "goalSetups", label: "Goal set up", color: "#101828" },
  { key: "firstSearches", label: "First search", color: "#8C5A52" },
  { key: "firstBookings", label: "First booking", color: "#12D64A" },
  { key: "firstSessions", label: "First session", color: "#FFD9A8" },
] as const;

// Each conversion bar takes the colour of the step it starts from
const RATE_COLORS = ["#FF5514", "#101828", "#8C5A52", "#FFD9A8"];

export function FunnelTab({ tabBar }: AnalyticsTabProps) {
  const query = useFunnelAnalytics();

  return (
    <AnalyticsTabState query={query}>
      {(funnel) => (
        <AnalyticsTabLayout
          tabBar={tabBar}
          stats={[
            statCard("Total Sign Ups", funnel.stats.signUps),
            statCard("Goal set up completed", funnel.stats.goalSetups),
            statCard("First Search", funnel.stats.firstSearches),
            statCard("First Booking", funnel.stats.firstBookings),
            statCard("First Session", funnel.stats.firstSessions),
          ]}
        >
          <AnalyticsCard
            title="Funnel Analytics Over Time"
            subtitle="Conversation rate at each step from sign up to first session."
            aside={<Legend items={[...STEPS]} />}
            className="p-6"
          >
            <LineChart
              label="Mentees reaching each funnel step per day"
              height={360}
              showPoints
              series={[...STEPS]}
              points={funnel.series.map((day) => ({
                label: day.label,
                values: STEPS.map((step) => day[step.key]),
              }))}
            />
          </AnalyticsCard>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <AnalyticsCard title="Conversation Rates" className="p-6">
              <ul className="flex flex-col gap-6">
                {funnel.conversionRates.map((rate, index) => (
                  <li key={rate.label}>
                    <p className="text-base text-[#101828]">{rate.label}</p>
                    <div className="mt-1.5 flex items-center gap-10">
                      <ProgressBar pct={rate.pct} color={RATE_COLORS[index] ?? "#FF5514"} className="flex-1" />
                      <span className="w-12 text-base font-semibold text-[#101828]">{rate.pct}%</span>
                    </div>
                  </li>
                ))}
              </ul>
            </AnalyticsCard>

            <AnalyticsCard title="Key Metrics" className="p-6">
              <dl className="flex flex-col gap-6">
                {[
                  ["Total Active Users", formatCount(funnel.keyMetrics.activeUsers), "Seen in the last 7 days"],
                  ["Total Monthly Users", formatCount(funnel.keyMetrics.monthlyUsers), "Seen in the last 30 days"],
                  ["Drop-off Rate", `${funnel.keyMetrics.dropOffRatePct}%`, "Sign-ups without a first session"],
                ].map(([label, value, note]) => (
                  <div key={label}>
                    <dt className="text-lg text-[#101828]">{label}</dt>
                    <dd className="text-3xl text-[#101828]">{value}</dd>
                    <dd className="text-xs text-[#475467]">{note}</dd>
                  </div>
                ))}
              </dl>
            </AnalyticsCard>
          </div>
        </AnalyticsTabLayout>
      )}
    </AnalyticsTabState>
  );
}
