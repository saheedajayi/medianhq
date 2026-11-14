"use client";

import { Star1 } from "iconsax-react";
import { usePerformanceAnalytics } from "@/services/admin/analytics/queries/analytics.queries";
import { DonutChart } from "../shared/charts/donut-chart";
import { GroupedBarChart } from "../shared/charts/grouped-bar-chart";
import { LineChart } from "../shared/charts/line-chart";
import { formatCount } from "../shared/format";
import { AnalyticsTabLayout, type AnalyticsTabProps } from "./analytics-tab-layout";
import { AnalyticsCard, AnalyticsTabState, Legend, ProgressBar, formatChange, statCard } from "./analytics-utils";

const SEARCHES = { label: "Searches", color: "#FF7A45" };
const BOOKINGS = { label: "Bookings", color: "#FFD9A8" };
const FUNNEL_COLORS = ["#E84D12", "#FFB199", "#FFD9A8", "#4A0A05"];
const STAR_COLOR = "#EAB308";

const headClass = "pb-3 text-left text-xs font-medium text-[#101828]";
const cellClass = "py-1.5 text-[10px] text-[#101828]";

interface RankedTableProps {
  columns: [string, string, string];
  rows: { name: string; count: number; pct: number }[];
  /** Numbers the rows, as the search queries table does */
  isNumbered?: boolean;
}

function RankedTable({ columns, rows, isNumbered = false }: RankedTableProps) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          {isNumbered && <th className={headClass}>#</th>}
          {columns.map((column) => (
            <th key={column} scope="col" className={headClass}>
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={row.name}>
            {isNumbered && <td className={cellClass}>{index + 1}</td>}
            <td className={cellClass}>{row.name}</td>
            <td className={cellClass}>{formatCount(row.count)}</td>
            <td className={cellClass}>{row.pct}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function PerformanceTab({ tabBar }: AnalyticsTabProps) {
  const query = usePerformanceAnalytics();

  return (
    <AnalyticsTabState query={query}>
      {({ stats, topQueries, filterUsage, funnel, daily, satisfaction }) => (
        <AnalyticsTabLayout
          tabBar={tabBar}
          stats={[
            statCard("Total Searches", stats.totalSearches),
            statCard("Total Filters Users", stats.filterUsers),
            {
              label: "Booking Rate (from search result)",
              value: `${stats.bookingRatePct.value}%`,
              note: formatChange(stats.bookingRatePct.changePct),
            },
            {
              label: "Mentee Satisfaction",
              value: satisfaction.average === null ? "—" : `${satisfaction.average} / 5`,
              note: formatChange(satisfaction.changePct),
            },
          ]}
        >
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <div className="grid gap-6 rounded-2xl border border-[#EAECF0] p-4 sm:grid-cols-2 sm:divide-x sm:divide-[#D0D5DD]">
              <div>
                <h2 className="text-lg font-semibold text-[#475467]">Top Search Queries</h2>
                <p className="mb-6 text-[10px] text-[#475467]">Most search terms by users</p>
                <RankedTable
                  isNumbered
                  columns={["Queries", "Searches", "% of total"]}
                  rows={topQueries.map((row) => ({ name: row.query, count: row.searches, pct: row.pctOfTotal }))}
                />
              </div>
              <div className="sm:pl-6">
                <h2 className="text-lg font-semibold text-[#475467]">Filters Usage</h2>
                <p className="mb-6 text-[10px] text-[#475467]">Most used filter during search</p>
                <RankedTable
                  columns={["Filter", "Usage", "% of total"]}
                  rows={filterUsage.map((row) => ({ name: row.filter, count: row.usage, pct: row.pctOfTotal }))}
                />
              </div>
            </div>

            <AnalyticsCard title="Booking rate from search result">
              <LineChart
                label="Share of searches that became bookings, per day"
                height={190}
                series={[{ label: "Booking rate %", color: "#FFA98A" }]}
                points={daily.map((day) => ({ label: day.label, values: [day.bookingRatePct] }))}
              />
            </AnalyticsCard>
          </div>

          <div className="grid gap-3 xl:grid-cols-3">
            <AnalyticsCard
              title="Searches vs. Bookings"
              subtitle="How many searches turn into bookings"
              aside={<Legend items={[SEARCHES, BOOKINGS]} />}
            >
              <GroupedBarChart
                label="Searches and bookings per day"
                height={190}
                series={[SEARCHES, BOOKINGS]}
                points={daily.map((day) => ({ label: day.label.replace("Oct ", ""), values: [day.searches, day.bookings] }))}
              />
            </AnalyticsCard>

            <AnalyticsCard title="Booking Conversion Funnel" subtitle="From search - profile view - booking.">
              <div className="flex flex-wrap items-center gap-5">
                <DonutChart
                  label="Booking conversion funnel"
                  size={150}
                  slices={funnel.map((step, index) => ({
                    label: step.step,
                    value: step.count,
                    color: FUNNEL_COLORS[index] ?? "#EAECF0",
                  }))}
                />
                <ul className="flex flex-1 flex-col gap-3">
                  {funnel.map((step, index) => (
                    <li key={step.step} className="flex items-start gap-2 text-xs text-[#101828]">
                      <span className="mt-0.5 size-3.5 shrink-0 rounded-full" style={{ backgroundColor: FUNNEL_COLORS[index] }} />
                      <span className="flex-1">
                        {step.step}
                        <span className="block font-semibold">{formatCount(step.count)}</span>
                      </span>
                      {step.pct}%
                    </li>
                  ))}
                </ul>
              </div>
            </AnalyticsCard>

            <AnalyticsCard title="Mentee Satisfaction" subtitle="Average rating from post session feedback">
              {satisfaction.average === null ? (
                <p className="text-sm text-[#667085]">No reviews yet.</p>
              ) : (
                <>
                  <p className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-[#101828]">{satisfaction.average}</span>
                    <span className="text-xl font-semibold text-[#101828]">/ 5</span>
                    <Star1 size="18" variant="Bold" color={STAR_COLOR} />
                    <span className="text-[9px] text-[#667085]">({formatCount(satisfaction.reviews)} reviews)</span>
                  </p>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {satisfaction.distribution.map((row) => (
                      <li key={row.stars} className="flex items-center gap-2 text-xs text-[#101828]">
                        <span className="w-6">{row.stars} ★</span>
                        <ProgressBar pct={row.pct} color="#2E9E6B" className="flex-1" />
                        <span className="w-8 text-right">{row.pct}%</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </AnalyticsCard>
          </div>
        </AnalyticsTabLayout>
      )}
    </AnalyticsTabState>
  );
}
