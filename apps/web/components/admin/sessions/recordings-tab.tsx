"use client";

import { useState } from "react";
import { ArrowRight, ArrowSwapHorizontal, People, Play, Trash, Verify } from "iconsax-react";
import { toast } from "sonner";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { adminSessionsService, type RecordingConsent, type RecordingsFilters } from "@/services/admin/sessions";
import { useSessionRecordings } from "@/services/admin/sessions/queries/sessions.queries";
import { cn } from "@/lib/utils";
import { formatClock, formatLongDate } from "../shared/format";
import { CaptionSelect } from "../shared/caption-select";
import { ALL, SearchField, pickedFilter } from "../shared/list-controls";
import { SessionPersonCell, SessionTypeChip } from "./session-cells";
import { SessionStatTile } from "./session-stat-tile";
import { sessionsCellClass, squareChipClass, viewButtonClass } from "./session-utils";
import { SessionsCard } from "./sessions-card";

const COLUMNS = [
  "Date & Time",
  "Session ID",
  "Mentor",
  "Mentee",
  "Session Type",
  "Duration",
  "Consent",
  "Recording",
  "Actions",
];

// Who agreed to the recording: both sides, or only one of them
const CONSENT: Record<RecordingConsent, { label: string; className: string }> = {
  BOTH: { label: "Both", className: "bg-[#E7F4EE] text-[#067647]" },
  MENTEE: { label: "Mentee", className: "bg-[#FEFBE8] text-[#CA8504]" },
  MENTOR: { label: "Mentor", className: "bg-[#FFF4ED] text-[#E04F16]" },
};

const RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
];

const CONSENT_OPTIONS = (Object.keys(CONSENT) as RecordingConsent[]).map((consent) => ({
  value: consent,
  label: CONSENT[consent].label,
}));

const EMPTY_FILTERS = { search: "", range: ALL, mentorId: ALL, menteeId: ALL, type: ALL, consent: ALL };

const toOptions = (people: { id: string; name: string }[]) =>
  people.map((person) => ({ value: person.id, label: person.name }));

const percentOf = (part: number, total: number) => `${total ? ((part / total) * 100).toFixed(1) : "0.0"}% of total`;

export function RecordingsTab() {
  const [values, setValues] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const search = useDebouncedValue(values.search.trim());

  const filters: RecordingsFilters = {
    search: search || undefined,
    range: pickedFilter(values.range),
    mentorId: pickedFilter(values.mentorId),
    menteeId: pickedFilter(values.menteeId),
    type: pickedFilter(values.type),
    consent: pickedFilter(values.consent),
  };
  const { data, isError, isFetching, refetch } = useSessionRecordings(filters, page);

  // Any filter change starts again from the first page
  const handleFilterChange = (change: Partial<typeof EMPTY_FILTERS>) => {
    setValues((current) => ({ ...current, ...change }));
    setPage(1);
  };

  // The tab opens straight away so the browser doesn't block it, then gets the signed link
  const handleView = async (recordingId: string) => {
    const tab = window.open("", "_blank");
    setOpeningId(recordingId);
    try {
      const response = await adminSessionsService.getRecordingPlayback(recordingId);
      if (tab) {
        tab.opener = null;
        tab.location.href = response.data.url;
      } else {
        window.location.assign(response.data.url);
      }
    } catch {
      tab?.close();
      toast.error("We couldn't open this recording. Please try again.");
    } finally {
      setOpeningId(null);
    }
  };

  if (isError && !data) return <DashboardErrorState onRetry={() => refetch()} isRetrying={isFetching} />;

  const toolbar = (
    <div className="flex flex-wrap items-end gap-3">
      <SearchField
        value={values.search}
        onChange={(value) => handleFilterChange({ search: value })}
        placeholder="Search by mentor, mentee, or topic..."
        label="Search recordings"
        className="min-w-56 flex-1 border-0 bg-[#F7F8FB]"
      />
      <CaptionSelect
        caption="Date Range"
        placeholder="All Time"
        value={values.range}
        options={RANGE_OPTIONS}
        onChange={(range) => handleFilterChange({ range })}
      />
      <CaptionSelect
        caption="Mentor"
        placeholder="All Mentors"
        value={values.mentorId}
        options={toOptions(data?.mentors ?? [])}
        onChange={(mentorId) => handleFilterChange({ mentorId })}
      />
      <CaptionSelect
        caption="Mentee"
        placeholder="All Mentees"
        value={values.menteeId}
        options={toOptions(data?.mentees ?? [])}
        onChange={(menteeId) => handleFilterChange({ menteeId })}
      />
      <CaptionSelect
        caption="Session Type"
        placeholder="All Types"
        value={values.type}
        options={(data?.types ?? []).map((type) => ({ value: type, label: type }))}
        onChange={(type) => handleFilterChange({ type })}
      />
      <CaptionSelect
        caption="Consent Status"
        placeholder="All"
        value={values.consent}
        options={CONSENT_OPTIONS}
        onChange={(consent) => handleFilterChange({ consent })}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-9">
      {data && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SessionStatTile
            label="Total Recordings"
            value={data.stats.total}
            icon={<People size="18" variant="Outline" color="#067647" />}
            note={
              <>
                <span
                  className={cn(
                    "font-medium",
                    data.stats.totalChangePct < 0 ? "text-[#D92D20]" : "text-[#067647]",
                  )}
                >
                  {data.stats.totalChangePct < 0 ? "↓" : "↑"} {Math.abs(data.stats.totalChangePct)}%
                </span>{" "}
                vs. last 7 days
              </>
            }
          />
          <SessionStatTile
            label="Dual Consent verified"
            value={data.stats.dualConsent}
            icon={<ArrowSwapHorizontal size="18" variant="Outline" color="#344054" />}
            note={percentOf(data.stats.dualConsent, data.stats.total)}
          />
          <SessionStatTile
            label="Pending Deletion"
            value={data.stats.pendingDeletion}
            icon={<Trash size="18" variant="Outline" color="#D92D20" />}
            note={percentOf(data.stats.pendingDeletion, data.stats.total)}
          />
          <div className="rounded-2xl bg-[#DCEBE4] p-6">
            <p className="flex items-center gap-2 text-[15px] font-medium text-[#0B6B46]">
              <Verify size="28" variant="Bold" color="#0B6B46" />
              Dual Consent Verified
            </p>
            <p className="mt-1 pl-9 text-[10px] leading-snug text-[#475467]">
              Recording are only available when both mentor and mentee have given consent.
            </p>
            <p className="mt-5 flex items-center gap-2 pl-9 text-[11px] font-medium text-[#0B6B46]">
              Learn More
              <ArrowRight size="18" variant="Outline" color="#0B6B46" />
            </p>
          </div>
        </div>
      )}

      <SessionsCard
        title="Recording Session"
        count={data && `${data.total.toLocaleString("en-NG")} Sessions`}
        toolbar={toolbar}
        columns={COLUMNS}
        rowCount={data?.items.length}
        emptyMessage="No recordings match these filters."
        isRefreshing={isFetching && !!data}
        page={page}
        lastPage={data ? Math.max(Math.ceil(data.total / data.pageSize), 1) : 1}
        onPageChange={setPage}
      >
        {data?.items.map((recording) => (
          <tr key={recording.id}>
            <td className={cn(sessionsCellClass, "whitespace-nowrap pl-8 text-xs")}>
              <p>{formatLongDate(recording.startsAt)}</p>
              <p>{formatClock(recording.startsAt)}</p>
            </td>
            <td className={cn(sessionsCellClass, "text-xs")}>{recording.sessionId}</td>
            <td className={sessionsCellClass}>
              <SessionPersonCell person={{ ...recording.mentor, country: null }} />
            </td>
            <td className={sessionsCellClass}>
              <SessionPersonCell person={{ ...recording.mentee, country: null }} />
            </td>
            <td className={sessionsCellClass}>
              <SessionTypeChip type={recording.type} />
            </td>
            <td className={cn(sessionsCellClass, "text-xs")}>{recording.durationMinutes}m</td>
            <td className={sessionsCellClass}>
              <span className={cn(squareChipClass, CONSENT[recording.consent].className)}>
                {CONSENT[recording.consent].label}
              </span>
            </td>
            <td className={sessionsCellClass}>
              <div className="flex items-center gap-2">
                <span className="flex h-14 w-24 shrink-0 items-center justify-center rounded bg-[#101828]">
                  <Play size="16" variant="Bold" color="#FFFFFF" />
                </span>
                <div className="whitespace-nowrap text-[9px] leading-relaxed text-[#475467]">
                  <p>
                    {recording.recording.format} • {recording.recording.sizeMb} MB
                  </p>
                  <p>
                    {formatLongDate(recording.recording.recordedAt)} {formatClock(recording.recording.recordedAt)}
                  </p>
                </div>
              </div>
            </td>
            <td className={sessionsCellClass}>
              <button
                type="button"
                onClick={() => void handleView(recording.id)}
                disabled={openingId === recording.id}
                className={cn(viewButtonClass, "disabled:opacity-60")}
              >
                {openingId === recording.id ? "Opening..." : "View"}
              </button>
            </td>
          </tr>
        ))}
      </SessionsCard>
    </div>
  );
}
