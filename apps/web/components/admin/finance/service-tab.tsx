"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { adminFinanceService, type ServiceReportFilters } from "@/services/admin/finance";
import { useMentorCharges, useSessionCharges } from "@/services/admin/finance/queries/finance.queries";
import { downloadCsv } from "@/lib/csv";
import { cn } from "@/lib/utils";
import { formatLongDate } from "../shared/format";
import { financeCellClass, formatAmount } from "./finance-utils";
import { ServiceReportCard } from "./service-report-card";

type Report = "sessions" | "mentors";

const rowClass = cn(financeCellClass, "py-2.5 text-sm");
const firstCellClass = cn(rowClass, "pl-14");

/** Search, paging and the expanded state for one of the two reports */
function useReportControls() {
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const search = useDebouncedValue(searchInput.trim());

  return {
    searchInput,
    search: search || undefined,
    page,
    setPage,
    // A new search starts again from the first page
    handleSearchChange: (value: string) => {
      setSearchInput(value);
      setPage(1);
    },
  };
}

export function ServiceTab() {
  // "view all" opens one report on its own with a longer list
  const [expanded, setExpanded] = useState<Report | null>(null);
  const sessions = useReportControls();
  const mentors = useReportControls();

  const filtersFor = (report: Report, search?: string): ServiceReportFilters => ({
    search,
    view: expanded === report ? "all" : undefined,
  });
  const sessionFilters = filtersFor("sessions", sessions.search);
  const mentorFilters = filtersFor("mentors", mentors.search);
  const sessionCharges = useSessionCharges(sessionFilters, sessions.page);
  const mentorCharges = useMentorCharges(mentorFilters, mentors.page);

  const handleToggleExpanded = (report: Report) => {
    setExpanded(expanded === report ? null : report);
    sessions.setPage(1);
    mentors.setPage(1);
  };

  const handleExportSessions = async () => {
    try {
      const response = await adminFinanceService.exportSessionCharges(sessionFilters);
      downloadCsv("median-service-charge-per-session.csv", [
        ["Date", "Session ID", "Mentor", "Session fee", "Service charge"],
        ...response.data.map((charge) => [
          charge.date,
          charge.sessionId,
          charge.mentorName,
          charge.sessionFee,
          charge.serviceCharge,
        ]),
      ]);
    } catch {
      toast.error("We couldn't export the report. Please try again.");
    }
  };

  const handleExportMentors = async () => {
    try {
      const response = await adminFinanceService.exportMentorCharges(mentorFilters);
      downloadCsv("median-service-charge-per-mentor.csv", [
        ["Mentor", "Sessions", "Session revenue", "Service charge"],
        ...response.data.map((charge) => [
          charge.mentorName,
          charge.sessions,
          charge.sessionRevenue,
          charge.serviceCharge,
        ]),
      ]);
    } catch {
      toast.error("We couldn't export the report. Please try again.");
    }
  };

  const failed = [sessionCharges, mentorCharges].find((query) => query.isError && !query.data);
  if (failed) return <DashboardErrorState onRetry={() => failed.refetch()} isRetrying={failed.isFetching} />;

  return (
    <div className="flex flex-col gap-6">
      {expanded !== "mentors" && (
        <ServiceReportCard
          title="Per session report"
          columns={["Date", "Session ID", "Mentor", "Session Fee", "Service Charge"]}
          search={sessions.searchInput}
          onSearchChange={sessions.handleSearchChange}
          isExpanded={expanded === "sessions"}
          onToggleExpanded={() => handleToggleExpanded("sessions")}
          onExport={handleExportSessions}
          rowCount={sessionCharges.data?.items.length}
          total={sessionCharges.data?.total ?? 0}
          pageSize={sessionCharges.data?.pageSize ?? 1}
          page={sessions.page}
          onPageChange={sessions.setPage}
          isRefreshing={sessionCharges.isFetching && !!sessionCharges.data}
        >
          {sessionCharges.data?.items.map((charge) => (
            <tr key={charge.id}>
              <td className={cn(firstCellClass, "whitespace-nowrap")}>{formatLongDate(charge.date)}</td>
              <td className={rowClass}>{charge.sessionId}</td>
              <td className={rowClass}>{charge.mentorName}</td>
              <td className={rowClass}>{formatAmount(charge.sessionFee)}</td>
              <td className={rowClass} colSpan={2}>
                {formatAmount(charge.serviceCharge)}
              </td>
            </tr>
          ))}
        </ServiceReportCard>
      )}

      {expanded !== "sessions" && (
        <ServiceReportCard
          title="Per Mentor report"
          columns={["Mentor", "Session", "Session Revenue", "Service Charge"]}
          search={mentors.searchInput}
          onSearchChange={mentors.handleSearchChange}
          isExpanded={expanded === "mentors"}
          onToggleExpanded={() => handleToggleExpanded("mentors")}
          onExport={handleExportMentors}
          rowCount={mentorCharges.data?.items.length}
          total={mentorCharges.data?.total ?? 0}
          pageSize={mentorCharges.data?.pageSize ?? 1}
          page={mentors.page}
          onPageChange={mentors.setPage}
          isRefreshing={mentorCharges.isFetching && !!mentorCharges.data}
        >
          {mentorCharges.data?.items.map((charge) => (
            <tr key={charge.mentorId}>
              <td className={firstCellClass}>{charge.mentorName}</td>
              <td className={rowClass}>{charge.sessions}</td>
              <td className={rowClass}>{formatAmount(charge.sessionRevenue)}</td>
              <td className={rowClass} colSpan={2}>
                {formatAmount(charge.serviceCharge)}
              </td>
            </tr>
          ))}
        </ServiceReportCard>
      )}
    </div>
  );
}
