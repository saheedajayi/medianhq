"use client";

import { Skeleton } from "@/components/ui/base/skeleton";
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
  /** The chosen range is still loading, so the figures shown are the previous range's */
  isLoadingRange?: boolean;
}

export function PlatformActivityCard({ activity, range, onRangeChange, isLoadingRange = false }: PlatformActivityCardProps) {
  const firstDay = activity.days[0]?.date;
  const lastDay = activity.days.at(-1)?.date;

  return (
    <section className={cn(cardClass, "min-w-0 p-6")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className={cardTitleClass}>Platform activity</h2>
          {isLoadingRange ? (
            <Skeleton className="mt-2 h-3.5 w-44" />
          ) : (
            firstDay &&
            lastDay && (
              <p className="mt-1.5 text-xs text-[#667085]">
                {formatDayRange(firstDay, lastDay)} · Daily counts
              </p>
            )
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
              {isLoadingRange ? (
                <Skeleton className="my-1 h-5 w-12" />
              ) : (
                formatCount(activity.totals[series.key])
              )}
            </dd>
          </div>
        ))}
      </dl>

      {/* The previous chart stays, dimmed, so the card doesn't jump while the new range loads */}
      <div className="relative" aria-busy={isLoadingRange}>
        <div className={cn("transition-opacity", isLoadingRange && "opacity-30")}>
          <PlatformActivityChart days={activity.days} />
        </div>
        {isLoadingRange && (
          <div role="status" className="absolute inset-0 flex items-center justify-center">
            <span className="flex items-center gap-2 rounded-full border border-[#EAECF0] bg-white px-4 py-2 text-sm font-medium text-[#344054] shadow-sm">
              <span className="size-4 animate-spin rounded-full border-2 border-[#FF5514] border-t-transparent" />
              Loading {range === "30d" ? "30" : "7"} days…
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
