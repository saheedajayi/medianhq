"use client";

import { SegmentedTabs } from "@/components/ui/custom/segmented-tabs";
import type { AdminOverview, AdminOverviewRange } from "@/services/admin/overview";
import { cn } from "@/lib/utils";
import { formatCount, formatDayRange } from "../shared/format";
import { cardClass, cardTitleClass } from "../shared/shared";
import { ACTIVITY_SERIES } from "./overview-utils";
import { PlatformActivityChart } from "./platform-activity-chart";

const RANGE_TABS = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
] as const;

interface PlatformActivityCardProps {
  activity: AdminOverview["activity"];
  range: AdminOverviewRange;
  onRangeChange: (range: AdminOverviewRange) => void;
}

export function PlatformActivityCard({ activity, range, onRangeChange }: PlatformActivityCardProps) {
  const firstDay = activity.days[0]?.date;
  const lastDay = activity.days.at(-1)?.date;

  return (
    <section className={cn(cardClass, "min-w-0 p-6")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className={cardTitleClass}>Platform activity</h2>
          {firstDay && lastDay && (
            <p className="mt-1.5 text-xs text-[#667085]">
              {formatDayRange(firstDay, lastDay)} · Daily counts
            </p>
          )}
        </div>
        <SegmentedTabs tabs={RANGE_TABS} activeTab={range} onChange={onRangeChange} />
      </div>

      {/* The legend carries the totals, so the chart needs no separate key */}
      <dl className="my-5 flex flex-wrap gap-x-16 gap-y-3">
        {ACTIVITY_SERIES.map((series) => (
          <div key={series.key}>
            <dt className="flex items-center gap-2 text-xs text-[#667085]">
              <span className="size-2 rounded-full" style={{ backgroundColor: series.color }} />
              {series.label}
            </dt>
            <dd className="mt-1.5 text-lg font-bold tracking-tight text-[#101828]">
              {formatCount(activity.totals[series.key])}
            </dd>
          </div>
        ))}
      </dl>

      <PlatformActivityChart days={activity.days} />
    </section>
  );
}
