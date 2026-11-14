"use client";

import type { VerticalRatio } from "@/services/admin/analytics";
import { useDemandRatioAnalytics } from "@/services/admin/analytics/queries/analytics.queries";
import { cn } from "@/lib/utils";
import { GroupedBarChart } from "../shared/charts/grouped-bar-chart";
import { Sparkline } from "../shared/charts/sparkline";
import { formatCount } from "../shared/format";
import { AnalyticsTabLayout, type AnalyticsTabProps } from "./analytics-tab-layout";
import { AnalyticsCard, AnalyticsTabState, Legend, ProgressBar } from "./analytics-utils";

const SUPPLY = { label: "Supply (Mentors)", color: "#FF8D62" };
const DEMAND = { label: "Demand (Mentees)", color: "#FFD9A8" };

const STATUS: Record<VerticalRatio["status"], { badge: string; label: string; className: string; color: string }> = {
  BALANCED: { badge: "Balanced", label: "Balanced", className: "bg-[#D1FADF] text-[#039855]", color: "#039855" },
  NEEDS_SUPPLY: {
    badge: "Need more supply",
    label: "Needs Attention",
    className: "bg-[#FFEAD5] text-[#C4320A]",
    color: "#C4320A",
  },
};

// A vertical with no mentees has nothing to divide by
const formatRatio = (ratio: number | null) => (ratio === null ? "—" : String(ratio));

const headClass = "px-4 py-2.5 text-left text-lg font-semibold text-[#475467]";
const cellClass = "px-4 py-3 text-base text-[#344054]";

export function DemandRatioTab({ tabBar }: AnalyticsTabProps) {
  const query = useDemandRatioAnalytics();

  return (
    <AnalyticsTabState query={query}>
      {({ top, verticals }) => (
        <AnalyticsTabLayout
          tabBar={tabBar}
          stats={top.map((row) => ({
            label: row.vertical,
            value: formatRatio(row.ratio),
            note: `${formatCount(row.mentors)} mentors · ${formatCount(row.mentees)} mentees`,
          }))}
        >
          <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <AnalyticsCard title="Supply and Demand Ratio" aside={<Legend items={[SUPPLY, DEMAND]} />}>
              <GroupedBarChart
                label="Mentors and mentees in each vertical"
                showValues
                series={[SUPPLY, DEMAND]}
                points={top.map((row) => ({ label: row.vertical, values: [row.mentors, row.mentees] }))}
              />
            </AnalyticsCard>

            <AnalyticsCard title="Vertical Ratio">
              <ul className="flex flex-col gap-7 pt-4">
                {top.map((row) => (
                  <li key={row.vertical} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-center gap-3">
                    <span className="truncate text-xl text-[#101828]">{row.vertical}</span>
                    <div>
                      <p className="flex items-center gap-3 text-sm text-[#101828]">
                        {formatRatio(row.ratio)}
                        <span className={cn("rounded-full px-2.5 py-0.5 text-[10px]", STATUS[row.status].className)}>
                          {STATUS[row.status].badge}
                        </span>
                      </p>
                      {/* A ratio of 1 fills half the bar, so shortfalls and surpluses both show */}
                      <ProgressBar pct={(row.ratio ?? 0) * 50} color="#FF8D62" className="mt-2" />
                    </div>
                  </li>
                ))}
              </ul>
            </AnalyticsCard>
          </div>

          <AnalyticsCard title="Vertical Breakdown" className="px-0 pb-4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse">
                <thead className="bg-[#F2F4F7]">
                  <tr>
                    {["Vertical", "Mentors", "Mentees", "Ratio", "Status", "Trend"].map((column) => (
                      <th key={column} scope="col" className={headClass}>
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {verticals.map((row) => (
                    <tr key={row.vertical}>
                      <td className={cellClass}>{row.vertical}</td>
                      <td className={cellClass}>{formatCount(row.mentors)}</td>
                      <td className={cellClass}>{formatCount(row.mentees)}</td>
                      <td className={cellClass}>{formatRatio(row.ratio)}</td>
                      <td className={cellClass} style={{ color: STATUS[row.status].color }}>
                        <span className="mr-2">●</span>
                        {STATUS[row.status].label}
                      </td>
                      <td className={cellClass}>
                        <Sparkline
                          label={`New ${row.vertical} profiles over 7 weeks`}
                          values={row.trend}
                          color={STATUS[row.status].color}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnalyticsCard>
        </AnalyticsTabLayout>
      )}
    </AnalyticsTabState>
  );
}
