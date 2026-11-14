"use client";

import { useState } from "react";
import Link from "next/link";
import { ExportSquare, Star1 } from "iconsax-react";
import { toast } from "sonner";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { adminSessionsService, type CompletedSessionsFilters } from "@/services/admin/sessions";
import { useCompletedSessions } from "@/services/admin/sessions/queries/sessions.queries";
import { cn } from "@/lib/utils";
import { formatClock, formatLongDate } from "../shared/format";
import { CaptionSelect } from "../shared/caption-select";
import { ALL, SearchField, pickedFilter } from "../shared/list-controls";
import { SessionPersonCell, SessionTypeChip } from "./session-cells";
import { exportSessions, sessionsCellClass, squareChipClass, viewButtonClass } from "./session-utils";
import { SessionsCard } from "./sessions-card";

const COLUMNS = ["Date & Time", "Mentor", "Mentee", "Session Type", "Rating", "Duration", "Status", "Actions"];

const RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

const RATING_OPTIONS = [
  { value: "5", label: "5 stars" },
  { value: "4", label: "4 stars and up" },
  { value: "3", label: "3 stars and up" },
  { value: "unrated", label: "Not rated" },
];

const EMPTY_FILTERS = { search: "", range: ALL, mentorId: ALL, menteeId: ALL, rating: ALL, type: ALL };

const toOptions = (people: { id: string; name: string }[]) =>
  people.map((person) => ({ value: person.id, label: person.name }));

export function CompletedSessionsTab() {
  const [values, setValues] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const search = useDebouncedValue(values.search.trim());

  const filters: CompletedSessionsFilters = {
    search: search || undefined,
    range: pickedFilter(values.range),
    mentorId: pickedFilter(values.mentorId),
    menteeId: pickedFilter(values.menteeId),
    rating: pickedFilter(values.rating),
    type: pickedFilter(values.type),
  };
  const { data, isError, isFetching, refetch } = useCompletedSessions(filters, page);

  // Any filter change starts again from the first page
  const handleFilterChange = (change: Partial<typeof EMPTY_FILTERS>) => {
    setValues((current) => ({ ...current, ...change }));
    setPage(1);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await adminSessionsService.exportCompleted(filters);
      exportSessions("median-completed-sessions.csv", response.data);
    } catch {
      toast.error("We couldn't export the sessions. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isError && !data) return <DashboardErrorState onRetry={() => refetch()} isRetrying={isFetching} />;

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2.5">
      <SearchField
        value={values.search}
        onChange={(value) => handleFilterChange({ search: value })}
        placeholder="Search by mentor, mentee, or topic..."
        label="Search completed sessions"
        className="min-w-56 flex-1 border-0 bg-[#F7F8FB]"
      />
      <CaptionSelect
        placeholder="Select date range"
        value={values.range}
        options={RANGE_OPTIONS}
        onChange={(range) => handleFilterChange({ range })}
      />
      <CaptionSelect
        placeholder="Mentor"
        value={values.mentorId}
        options={toOptions(data?.mentors ?? [])}
        onChange={(mentorId) => handleFilterChange({ mentorId })}
      />
      <CaptionSelect
        placeholder="Mentee"
        value={values.menteeId}
        options={toOptions(data?.mentees ?? [])}
        onChange={(menteeId) => handleFilterChange({ menteeId })}
      />
      <CaptionSelect
        placeholder="Rating"
        value={values.rating}
        options={RATING_OPTIONS}
        onChange={(rating) => handleFilterChange({ rating })}
      />
      <CaptionSelect
        placeholder="Sessions Type"
        value={values.type}
        options={(data?.types ?? []).map((type) => ({ value: type, label: type }))}
        onChange={(type) => handleFilterChange({ type })}
      />
      <button
        type="button"
        onClick={handleExport}
        disabled={isExporting || !data}
        className="inline-flex h-12 items-center gap-2 rounded-lg bg-[#FF5514] px-3.5 text-xs font-medium text-white transition-colors hover:bg-[#E84D12] disabled:opacity-60"
      >
        <ExportSquare size="18" variant="Outline" color="#FFFFFF" />
        {isExporting ? "Exporting..." : "Export CSV"}
      </button>
    </div>
  );

  return (
    <SessionsCard
      title="Completed Sessions"
      count={data && `${data.total.toLocaleString("en-NG")} Sessions`}
      toolbar={toolbar}
      columns={COLUMNS}
      rowCount={data?.items.length}
      emptyMessage="No completed sessions match these filters."
      isRefreshing={isFetching && !!data}
      page={page}
      lastPage={data ? Math.max(Math.ceil(data.total / data.pageSize), 1) : 1}
      onPageChange={setPage}
    >
      {data?.items.map((session) => (
        <tr key={session.id}>
          <td className={cn(sessionsCellClass, "whitespace-nowrap pl-8")}>
            <p>{formatLongDate(session.startsAt)}</p>
            <p className="mt-1">{formatClock(session.startsAt)}</p>
          </td>
          <td className={sessionsCellClass}>
            <SessionPersonCell person={session.mentor} />
          </td>
          <td className={sessionsCellClass}>
            <SessionPersonCell person={session.mentee} />
          </td>
          <td className={sessionsCellClass}>
            <SessionTypeChip type={session.type} />
          </td>
          <td className={cn(sessionsCellClass, "text-xs")}>
            {session.rating === null ? (
              "—"
            ) : (
              <span className="flex items-center gap-1.5">
                <Star1 size="16" variant="Bold" color="#FACC15" />
                {session.rating.toFixed(1)}
              </span>
            )}
          </td>
          <td className={cn(sessionsCellClass, "text-xs")}>{session.durationMinutes}m</td>
          <td className={sessionsCellClass}>
            <span className={cn(squareChipClass, "bg-[#E7F4EE] text-[#12B76A]")}>Completed</span>
          </td>
          <td className={sessionsCellClass}>
            <Link href={`/admin/bookings/${session.id}`} className={viewButtonClass}>
              View
            </Link>
          </td>
        </tr>
      ))}
    </SessionsCard>
  );
}
