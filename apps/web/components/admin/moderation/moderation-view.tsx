"use client";

import { useState } from "react";
import { ExportSquare, Refresh2 } from "iconsax-react";
import { toast } from "sonner";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { SegmentedTabs } from "@/components/ui/custom/segmented-tabs";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { adminModerationService, type FlagContentType, type ModerationFlagsFilters } from "@/services/admin/moderation";
import { useModerationFlags } from "@/services/admin/moderation/queries/moderation.queries";
import { AdminPageHeader } from "../shared/admin-page-header";
import { formatClock } from "../shared/format";
import { ALL, Pagination, pickedFilter } from "../shared/list-controls";
import { outlineButtonClass } from "../shared/shared";
import { flagColumnsFor } from "./flag-columns";
import { FlagDetailsPanel } from "./flag-details-panel";
import { FlagsTable } from "./flags-table";
import { ModerationHistoryTable } from "./moderation-history-table";
import {
  EMPTY_MODERATION_FILTERS,
  ModerationToolbar,
  type ModerationFilterValues,
} from "./moderation-toolbar";
import { exportFlags } from "./moderation-utils";

type TypeTab = FlagContentType | typeof ALL;

export function ModerationView() {
  const [tab, setTab] = useState<TypeTab>(ALL);
  const [values, setValues] = useState(EMPTY_MODERATION_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const search = useDebouncedValue(values.search.trim());

  // A tab narrows to one content type; on the All tab the dropdown can do the same
  const type = pickedFilter<FlagContentType>(tab) ?? pickedFilter<FlagContentType>(values.type);
  const filters: ModerationFlagsFilters = {
    type,
    search: search || undefined,
    status: pickedFilter(values.status),
    flaggedOver: pickedFilter(values.flaggedOver),
  };
  const { data, isError, isFetching, refetch } = useModerationFlags(filters, page);
  const selected = data?.items.find((flag) => flag.id === selectedId);

  const tabs = [
    { value: ALL, label: `All (${data?.counts.all ?? 0})` },
    { value: "FORUM_POST", label: `Forum Post (${data?.counts.forumPost ?? 0})` },
    { value: "MESSAGE", label: `Messages (${data?.counts.message ?? 0})` },
    { value: "PROFILE_TEXT", label: `Profile Text (${data?.counts.profileText ?? 0})` },
  ] as const;

  // Any change to what is listed starts from the first page with nothing selected
  const resetList = () => {
    setPage(1);
    setSelectedId(null);
  };

  const handleTabChange = (nextTab: TypeTab) => {
    setTab(nextTab);
    setIsHistoryOpen(false);
    resetList();
  };

  const handleFilterChange = (change: Partial<ModerationFilterValues>) => {
    setValues((current) => ({ ...current, ...change }));
    resetList();
  };

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      const response = await adminModerationService.exportFlags(filters);
      exportFlags("median-flagged-content.csv", response.data);
    } catch {
      toast.error("We couldn't export the flagged content. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-9">
      <AdminPageHeader
        title="Content Moderation"
        description="Review flagged posts, messages and profile text. Take action to keep the community safe."
      >
        <button type="button" onClick={handleExportAll} disabled={isExporting || !data} className={outlineButtonClass}>
          <ExportSquare size="18" variant="Outline" color="#101828" />
          {isExporting ? "Exporting..." : "Export all CSV"}
        </button>
      </AdminPageHeader>

      <SegmentedTabs
        tabs={tabs}
        // No tab is highlighted while the history is open
        activeTab={isHistoryOpen ? ("" as TypeTab) : tab}
        onChange={handleTabChange}
        size="lg"
        className="self-start"
      />

      <section className="overflow-hidden rounded-2xl border border-[#EAECF0] bg-white">
        <ModerationToolbar
          values={values}
          onChange={handleFilterChange}
          isHistoryOpen={isHistoryOpen}
          onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
        />

        {isHistoryOpen ? (
          <ModerationHistoryTable />
        ) : isError && !data ? (
          <div className="p-5">
            <DashboardErrorState onRetry={() => refetch()} isRetrying={isFetching} />
          </div>
        ) : (
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
            <div className="min-w-0 flex-1">
              <FlagsTable
                columns={flagColumnsFor(type)}
                flags={data?.items}
                isRefreshing={isFetching && !!data}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
              {data && (
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-5">
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="flex items-center gap-2 text-[10px] text-[#475467]"
                  >
                    Last update <span className="text-[#067647]">● {formatClock(data.updatedAt)}</span>
                    <Refresh2 size="18" variant="Outline" color="#067647" />
                  </button>
                  <Pagination
                    page={page}
                    lastPage={Math.max(Math.ceil(data.total / data.pageSize), 1)}
                    onChange={setPage}
                  />
                </div>
              )}
            </div>

            {selected && (
              <div className="px-5 pb-5 xl:pl-0 xl:pt-5">
                <FlagDetailsPanel flag={selected} onClose={() => setSelectedId(null)} />
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
