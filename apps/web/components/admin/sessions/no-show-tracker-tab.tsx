"use client";

import { useState } from "react";
import Link from "next/link";
import { Danger, InfoCircle, Profile2User, ShieldTick, UserRemove } from "iconsax-react";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { NoShowStatus, NoShowTrackerFilters } from "@/services/admin/sessions";
import { useNoShowTracker } from "@/services/admin/sessions/queries/sessions.queries";
import { cn } from "@/lib/utils";
import { formatLongDate } from "../shared/format";
import { CaptionSelect } from "../shared/caption-select";
import { ALL, SearchField, pickedFilter } from "../shared/list-controls";
import { SessionPersonCell } from "./session-cells";
import { SessionStatTile } from "./session-stat-tile";
import { sessionsCellClass, squareChipClass, viewButtonClass } from "./session-utils";
import { SessionsCard } from "./sessions-card";

const RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
];
const RANGE_LABEL = { "7d": "7 days", "30d": "30 days", "90d": "90 days" } as const;

const CONSECUTIVE_OPTIONS = [
  { value: "1", label: "1 miss" },
  { value: "2+", label: "2 or more" },
];

const STATUS_OPTIONS = [
  { value: "ALERT", label: "Alert" },
  { value: "WARNING", label: "Warning" },
  { value: "CLEAR", label: "No misses" },
];

// A mentor with no run of misses shows a plain zero instead of a badge
const STATUS_BADGE: Record<Exclude<NoShowStatus, "CLEAR">, { label: string; className: string; color: string }> = {
  ALERT: { label: "Alert", className: "bg-[#FEE4E2] text-[#F04438]", color: "#F04438" },
  WARNING: { label: "Warning", className: "bg-[#FFEAD5] text-[#E04F16]", color: "#E04F16" },
};

const EMPTY_FILTERS = { search: "", consecutive: ALL, mentorType: ALL, status: ALL };

const percentOf = (part: number, total: number) => `${total ? Math.round((part / total) * 100) : 0}% of total`;

export function NoShowTrackerTab() {
  const [values, setValues] = useState(EMPTY_FILTERS);
  const [range, setRange] = useState<NoShowTrackerFilters["range"]>("7d");
  const [page, setPage] = useState(1);
  const search = useDebouncedValue(values.search.trim());

  const filters: NoShowTrackerFilters = {
    search: search || undefined,
    consecutive: pickedFilter(values.consecutive),
    mentorType: pickedFilter(values.mentorType),
    status: pickedFilter(values.status),
    range,
  };
  const { data, isError, isFetching, refetch } = useNoShowTracker(filters, page);

  // Any filter change starts again from the first page
  const handleFilterChange = (change: Partial<typeof EMPTY_FILTERS>) => {
    setValues((current) => ({ ...current, ...change }));
    setPage(1);
  };

  if (isError && !data) return <DashboardErrorState onRetry={() => refetch()} isRetrying={isFetching} />;

  const stats = data?.stats;
  const columns = [
    "Mentor",
    "Mentor ID",
    `Total no shows (${RANGE_LABEL[range]})`,
    "Consecutive Missed",
    "Current Status",
    "Last Miss Date",
    "Actions",
  ];

  const toolbar = (
    <div className="flex flex-wrap items-end gap-3">
      <SearchField
        value={values.search}
        onChange={(value) => handleFilterChange({ search: value })}
        placeholder="Search by mentor, mentee, or topic..."
        label="Search mentors"
        className="min-w-56 flex-1 border-0 bg-[#F7F8FB]"
      />
      <CaptionSelect
        caption="Consecutive Misses"
        placeholder="All"
        value={values.consecutive}
        options={CONSECUTIVE_OPTIONS}
        onChange={(consecutive) => handleFilterChange({ consecutive })}
      />
      <CaptionSelect
        caption="Mentor Type"
        placeholder="All"
        value={values.mentorType}
        options={(data?.mentorTypes ?? []).map((type) => ({ value: type, label: type }))}
        onChange={(mentorType) => handleFilterChange({ mentorType })}
      />
      <CaptionSelect
        caption="Status"
        placeholder="All"
        value={values.status}
        options={STATUS_OPTIONS}
        onChange={(status) => handleFilterChange({ status })}
      />
      <CaptionSelect
        caption="Date Range"
        placeholder="Last 7 Days"
        value={range}
        options={RANGE_OPTIONS}
        // The range always has a value, so clearing it goes back to the default
        onChange={(value) => {
          setRange(value === ALL ? "7d" : (value as NoShowTrackerFilters["range"]));
          setPage(1);
        }}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-7">
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SessionStatTile
            label="Total Mentors"
            value={stats.totalMentors}
            icon={<Profile2User size="18" variant="Outline" color="#067647" />}
            note={
              <>
                <span className="font-medium text-[#067647]">↑ {stats.totalMentorsChangePct}%</span> vs. last 7 days
              </>
            }
          />
          <SessionStatTile
            label="Mentor with 1 miss"
            value={stats.withOneMiss}
            icon={<ShieldTick size="18" variant="Outline" color="#344054" />}
            note={percentOf(stats.withOneMiss, stats.totalMentors)}
          />
          <SessionStatTile
            isAlert
            label="mentor with 2+ consecutive Misses"
            value={stats.withConsecutiveMisses}
            icon={<Danger size="18" variant="Bold" color="#F04438" />}
            note={percentOf(stats.withConsecutiveMisses, stats.totalMentors)}
          />
          <SessionStatTile
            label={`Total No shows (${RANGE_LABEL[range]})`}
            value={stats.totalNoShows}
            icon={<UserRemove size="18" variant="Outline" color="#344054" />}
            note={`${stats.noShowPctOfScheduled}% of all scheduled sessions`}
          />
        </div>
      )}

      <div className="flex items-start gap-3 rounded-2xl border border-[#FDA29B] bg-[#FFF6F2] px-4 py-5">
        <InfoCircle size="28" variant="Outline" color="#F04438" className="shrink-0" />
        <div>
          <p className="text-sm font-semibold text-[#F04438]">Automatic Alert</p>
          <p className="mt-1.5 text-sm text-[#344054]">
            Mentors are flagged when they reach 2 consecutive no shows. Take action to re-engage and prevent further
            mises.
          </p>
        </div>
      </div>

      <SessionsCard
        toolbar={toolbar}
        columns={columns}
        rowCount={data?.items.length}
        emptyMessage="No mentors match these filters."
        isRefreshing={isFetching && !!data}
        page={page}
        lastPage={data ? Math.max(Math.ceil(data.total / data.pageSize), 1) : 1}
        onPageChange={setPage}
      >
        {data?.items.map((mentor) => {
          const badge = mentor.status === "CLEAR" ? null : STATUS_BADGE[mentor.status];

          return (
            <tr key={mentor.id}>
              <td className={cn(sessionsCellClass, "pl-8")}>
                <SessionPersonCell person={mentor} />
              </td>
              <td className={cn(sessionsCellClass, "text-xs")}>{mentor.id}</td>
              <td className={cn(sessionsCellClass, "text-xs")}>{mentor.noShows}</td>
              <td className={sessionsCellClass}>
                {badge ? (
                  <span className="flex items-center gap-2 text-[#F04438]">
                    <span className="flex size-8 items-center justify-center rounded-full bg-[#FEE4E2]">
                      {mentor.consecutiveMisses}
                    </span>
                    Consecutive
                  </span>
                ) : (
                  <span className="pl-3">0</span>
                )}
              </td>
              <td className={sessionsCellClass}>
                {badge ? (
                  <span className={cn(squareChipClass, "inline-flex items-center gap-1.5", badge.className)}>
                    <Danger size="16" variant="Outline" color={badge.color} />
                    {badge.label}
                  </span>
                ) : (
                  <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#F2F4F7]">0</span>
                )}
              </td>
              <td className={cn(sessionsCellClass, "whitespace-nowrap text-xs")}>
                {mentor.lastMissAt ? formatLongDate(mentor.lastMissAt) : "-"}
              </td>
              <td className={sessionsCellClass}>
                <Link href={`/admin/users/${mentor.id}`} className={viewButtonClass}>
                  View
                </Link>
              </td>
            </tr>
          );
        })}
      </SessionsCard>
    </div>
  );
}
