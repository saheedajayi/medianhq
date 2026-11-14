"use client";

import { useState } from "react";
import { ExportSquare } from "iconsax-react";
import { toast } from "sonner";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { SegmentedTabs } from "@/components/ui/custom/segmented-tabs";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  adminApplicationsService,
  type AdminApplicationRow,
  type AdminApplicationsFilters,
  type AdminApplicationStatus,
} from "@/services/admin/applications";
import { useAdminApplications, useAssignReviewer } from "@/services/admin/applications/queries/applications.queries";
import { cn } from "@/lib/utils";
import { AdminPageHeader } from "../shared/admin-page-header";
import { formatCount } from "../shared/format";
import { pickedFilter } from "../shared/list-controls";
import { SelectionBar } from "../shared/selection-bar";
import { badgeClass, outlineButtonClass } from "../shared/shared";
import { TableFooter } from "../shared/table-footer";
import { useRowSelection } from "../shared/use-row-selection";
import {
  ApplicationQueueFilters,
  EMPTY_APPLICATION_FILTERS,
  type ApplicationQueueFilterValues,
} from "./application-queue-filters";
import { APPLICATION_STATUS, exportApplications } from "./application-utils";
import { ApplicationsTable } from "./applications-table";
import { AssignReviewerModal } from "./assign-reviewer-modal";
import { ReviewSlaBanner } from "./review-sla-banner";
import { SelectedApplicationPanel } from "./selected-application-panel";

export function ApplicationQueueView() {
  const [status, setStatus] = useState<AdminApplicationStatus>("PENDING_REVIEW");
  const [filterValues, setFilterValues] = useState(EMPTY_APPLICATION_FILTERS);
  const [sort, setSort] = useState<"oldest" | "newest">("oldest");
  const [page, setPage] = useState(1);
  // The application shown in the side panel: the one ticked most recently
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const selection = useRowSelection<AdminApplicationRow>();
  const assignReviewer = useAssignReviewer();
  const search = useDebouncedValue(filterValues.search.trim());

  const filters: AdminApplicationsFilters = {
    status,
    search: search || undefined,
    expertise: pickedFilter(filterValues.expertise),
    submitted: pickedFilter(filterValues.submitted),
    reviewer: pickedFilter(filterValues.reviewer),
    sort,
  };

  const { data, isError, isFetching, refetch } = useAdminApplications(filters, page);
  const applications = data?.items ?? [];
  const lastPage = data ? Math.max(Math.ceil(data.total / data.pageSize), 1) : 1;
  const firstShown = data?.total ? (data.page - 1) * data.pageSize + 1 : 0;
  const lastShown = firstShown ? firstShown + applications.length - 1 : 0;
  // Taken from the loaded page when it's there, so the panel shows saved changes
  const focused =
    applications.find((application) => application.id === focusedId) ??
    (focusedId ? selection.selected.get(focusedId) : undefined);

  const tabs = [
    { value: "PENDING_REVIEW", label: "Pending", count: data?.counts.pending },
    { value: "APPROVED", label: "Approved", count: data?.counts.approved },
    { value: "REJECTED", label: "Rejected", count: data?.counts.rejected },
  ] as const;

  // Any filter change starts again from the first page
  const handleFilterChange = (values: Partial<ApplicationQueueFilterValues>) => {
    setFilterValues((current) => ({ ...current, ...values }));
    setPage(1);
  };

  const handleSortChange = (nextSort: "oldest" | "newest") => {
    setSort(nextSort);
    setPage(1);
  };

  const handleClearSelection = () => {
    selection.clear();
    setFocusedId(null);
  };

  // A selection made on one tab doesn't apply to another
  const handleStatusChange = (nextStatus: AdminApplicationStatus) => {
    setStatus(nextStatus);
    setPage(1);
    handleClearSelection();
  };

  const handleToggle = (application: AdminApplicationRow) => {
    setFocusedId(selection.isSelected(application.id) ? null : application.id);
    selection.toggle(application);
  };

  const handleAssign = (reviewerId: string | null) =>
    assignReviewer.mutate(
      { applicationIds: [...selection.selected.keys()], reviewerId },
      {
        onSuccess: () => {
          toast.success(reviewerId ? "Reviewer assigned." : "Reviewer removed.");
          setIsAssignModalOpen(false);
        },
        onError: (error) => toast.error(error.message || "We couldn't assign the reviewer."),
      },
    );

  const handleExportQueue = async () => {
    setIsExporting(true);
    try {
      const response = await adminApplicationsService.exportApplications(filters);
      exportApplications("median-mentor-applications.csv", response.data);
    } catch {
      toast.error("We couldn't export the queue. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Mentor applications"
        description="A human-led review queue for the next generation of Median mentors."
      >
        <button
          type="button"
          onClick={handleExportQueue}
          disabled={isExporting || !data}
          className={outlineButtonClass}
        >
          <ExportSquare size="18" variant="Outline" color="#101828" />
          {isExporting ? "Exporting..." : "Export queue CSV"}
        </button>
      </AdminPageHeader>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedTabs tabs={tabs} activeTab={status} onChange={handleStatusChange} size="lg" />
        {!!data?.nearingTarget && (
          <span className={cn(badgeClass, "bg-[#FFFAEB] text-[#B54708]")}>{data.nearingTarget} nearing target</span>
        )}
      </div>

      <ReviewSlaBanner sort={sort} onSortChange={handleSortChange} />

      <ApplicationQueueFilters
        values={filterValues}
        onChange={handleFilterChange}
        expertise={data?.expertise ?? []}
        reviewers={data?.reviewers ?? []}
      />

      <div className={cn("grid items-start gap-4", focused && "xl:grid-cols-[minmax(0,1fr)_320px]")}>
        <div className="flex min-w-0 flex-col gap-3">
          {selection.count > 0 && (
            <SelectionBar label={`${selection.count} selected`} onClear={handleClearSelection} className="bg-[#F9FAFB]">
              {/* Only pending applications can be given a reviewer */}
              {status === "PENDING_REVIEW" && (
                <button type="button" onClick={() => setIsAssignModalOpen(true)} className={outlineButtonClass}>
                  Assign reviewer
                </button>
              )}
              <button
                type="button"
                onClick={() => exportApplications("median-mentor-applications-selected.csv", selection.rows)}
                className={outlineButtonClass}
              >
                <ExportSquare size="18" variant="Outline" color="#101828" />
                Export selected
              </button>
            </SelectionBar>
          )}

          {isError && !data ? (
            <DashboardErrorState onRetry={() => refetch()} isRetrying={isFetching} />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#EAECF0]">
              <ApplicationsTable
                applications={data?.items}
                isRefreshing={isFetching && !!data}
                isSelected={selection.isSelected}
                isPageSelected={selection.isPageSelected(applications)}
                onToggle={handleToggle}
                onTogglePage={() => selection.togglePage(applications)}
              />
              {data && (
                <TableFooter
                  summary={`${firstShown}–${lastShown} of ${formatCount(data.total)} ${APPLICATION_STATUS[status].label.toLowerCase()}`}
                  page={page}
                  lastPage={lastPage}
                  onPageChange={setPage}
                />
              )}
            </div>
          )}
        </div>

        {focused && <SelectedApplicationPanel application={focused} onClose={() => setFocusedId(null)} />}
      </div>

      {isAssignModalOpen && (
        <AssignReviewerModal
          applicationCount={selection.count}
          reviewers={data?.reviewers ?? []}
          isSubmitting={assignReviewer.isPending}
          onClose={() => setIsAssignModalOpen(false)}
          onAssign={handleAssign}
        />
      )}
    </div>
  );
}
