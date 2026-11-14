"use client";

import type { AsyncThread } from "@/services/admin/analytics";
import { useResponseMetricsAnalytics } from "@/services/admin/analytics/queries/analytics.queries";
import { cn } from "@/lib/utils";
import { BarChart } from "../shared/charts/bar-chart";
import { DonutChart } from "../shared/charts/donut-chart";
import { LineChart } from "../shared/charts/line-chart";
import { formatCount } from "../shared/format";
import {
  AnalyticsTabLayout,
  type AnalyticsTabProps,
} from "./analytics-tab-layout";
import {
  AnalyticsCard,
  AnalyticsTabState,
  formatChange,
  formatDuration,
  statCard,
} from "./analytics-utils";

const THREAD_STATUS: Record<
  AsyncThread["status"],
  { label: string; className: string }
> = {
  ON_TIME: { label: "On Time", className: "bg-[#E7F4EE] text-[#12B76A]" },
  LATE: { label: "Late", className: "bg-[#FEE4E2] text-[#F04438]" },
  WAITING: { label: "Waiting", className: "bg-[#F2F4F7] text-[#475467]" },
};

const headClass = "pb-4 text-left text-xs font-medium text-[#475467]";
const cellClass = "py-2 pr-2 text-[10px] text-[#101828]";

export function ResponseMetricsTab({ tabBar }: AnalyticsTabProps) {
  const query = useResponseMetricsAnalytics();

  return (
    <AnalyticsTabState query={query}>
      {({ stats, sla, daily, breakdown, recent, slaHours }) => {
        const judged = sla.met + sla.missed;
        const isOnTarget =
          (stats.medianResponseMinutes.value ?? 0) <= slaHours * 60;

        return (
          <AnalyticsTabLayout
            tabBar={tabBar}
            stats={[
              {
                label: "Median Response Time",
                value: formatDuration(stats.medianResponseMinutes.value),
                note: formatChange(stats.medianResponseMinutes.changePct),
                tag: isOnTarget ? "On Time" : undefined,
              },
              statCard("Thread Volume", stats.threadVolume),
              {
                label: "Mentor SLA Compliance Rate",
                value: `${stats.slaCompliancePct.value}%`,
                note: formatChange(stats.slaCompliancePct.changePct),
              },
            ]}
          >
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
              <AnalyticsCard
                title="Mentor Response Time Trend"
                subtitle="Time taken for mentor to send their first reply to a question"
              >
                <div className="grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_190px]">
                  <LineChart
                    label="Median minutes to a mentor's first reply, per day"
                    height={200}
                    series={[{ label: "Median minutes", color: "#FFA98A" }]}
                    points={daily.map((day) => ({
                      label: day.label,
                      values: [day.medianResponseMinutes ?? 0],
                    }))}
                  />
                  <div className="rounded-lg border border-[#EAECF0] p-4">
                    <h3 className="text-xs font-medium text-[#101828]">
                      Response time breakdown
                    </h3>
                    <dl className="mt-5 flex flex-col gap-3.5 text-xs text-[#101828]">
                      {breakdown.map((bucket) => (
                        <div
                          key={bucket.label}
                          className="flex justify-between gap-3"
                        >
                          <dt>{bucket.label}</dt>
                          <dd>{bucket.pct}%</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </AnalyticsCard>

              <AnalyticsCard title="Thread Volume">
                <BarChart
                  label="Questions asked per day"
                  height={210}
                  series={{ label: "Threads", color: "#182230" }}
                  points={daily.map((day) => ({
                    label: day.label.replace("Oct ", ""),
                    values: [day.threads],
                  }))}
                />
              </AnalyticsCard>
            </div>

            <div className="grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
              <AnalyticsCard
                title="Mentor SLA Compliance Rate"
                subtitle={`Percentage of mentors who responded within the target time of ${slaHours} hours`}
              >
                <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_170px]">
                  <LineChart
                    label="Share of questions answered within the target, per day"
                    height={200}
                    series={[{ label: "SLA compliance %", color: "#101828" }]}
                    points={daily.map((day) => ({
                      label: day.label,
                      values: [day.slaPct],
                    }))}
                  />
                  <div>
                    <div className="relative mx-auto size-[120px]">
                      <DonutChart
                        label="SLA compliance"
                        size={120}
                        thickness={8}
                        slices={[
                          {
                            label: "Met SLA",
                            value: sla.met,
                            color: "#12A150",
                          },
                          {
                            label: "Missed SLA",
                            value: sla.missed,
                            color: "#D1FADF",
                          },
                        ]}
                      />
                      <p className="absolute inset-0 flex flex-col items-center justify-center text-[#12A150]">
                        <span className="text-xl">
                          {stats.slaCompliancePct.value}
                        </span>
                        <span className="text-[8px] text-[#101828]">
                          SLA Compliance
                        </span>
                      </p>
                    </div>
                    <dl className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] gap-y-3 text-[10px] text-[#475467]">
                      <dt>● Met SLA</dt>
                      <dd className="text-[#101828]">{formatCount(sla.met)}</dd>
                      <dt>● Missed SLA</dt>
                      <dd className="text-[#101828]">
                        {formatCount(sla.missed)}
                      </dd>
                      <dt className="border-t border-[#D0D5DD] pt-3">
                        Total Threads
                      </dt>
                      <dd className="border-t border-[#D0D5DD] pt-3 text-[#101828]">
                        {formatCount(judged)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </AnalyticsCard>

              <AnalyticsCard title="Recent Async Q&A Threads">
                {recent.length === 0 ? (
                  <p className="text-sm text-[#667085]">
                    No questions in the last two weeks.
                  </p>
                ) : (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        {[
                          "User",
                          "Question",
                          "Mentor",
                          "Response Time",
                          "Status",
                        ].map((column) => (
                          <th key={column} scope="col" className={headClass}>
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((thread) => (
                        <tr key={thread.id}>
                          <td className={cellClass}>{thread.asker}</td>
                          <td className={cn(cellClass, "max-w-28 truncate")}>
                            {thread.question}
                          </td>
                          <td className={cellClass}>{thread.mentor}</td>
                          <td className={cellClass}>
                            {formatDuration(thread.responseMinutes)}
                          </td>
                          <td className={cellClass}>
                            <span
                              className={cn(
                                "rounded px-1.5 py-1",
                                THREAD_STATUS[thread.status].className,
                              )}
                            >
                              {THREAD_STATUS[thread.status].label}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </AnalyticsCard>
            </div>
          </AnalyticsTabLayout>
        );
      }}
    </AnalyticsTabState>
  );
}
