"use client";

import { useState } from "react";
import { More } from "iconsax-react";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { RefundsFilters } from "@/services/admin/finance";
import { useFinanceRefunds } from "@/services/admin/finance/queries/finance.queries";
import { cn } from "@/lib/utils";
import { CaptionSelect } from "../shared/caption-select";
import { formatClock, formatLongDate } from "../shared/format";
import { ALL, Pagination, SearchField, pickedFilter } from "../shared/list-controls";
import { StatCards } from "../shared/stat-cards";
import { UserAvatar, checkboxClass } from "../shared/shared";
import { financeCardClass, formatAmount, formatChange } from "./finance-utils";
import { RefundDetailsPanel } from "./refund-details-panel";
import { REFUND_STATUS, refundChipClass } from "./refund-utils";
import { TableSkeletonRows } from "../shared/skeletons";

const COLUMNS = ["ID", "User", "Type", "Amount", "Reason", "Status", "Request at", "Actions"];
const headClass = "px-2.5 py-5 text-left text-xs font-semibold text-[#475467]";
const cellClass = "px-2.5 py-4 align-middle text-[10px] text-[#475467]";

const STATUS_OPTIONS = Object.entries(REFUND_STATUS).map(([value, { label }]) => ({ value, label }));
const RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

const EMPTY_FILTERS = { search: "", status: ALL, range: ALL };

export function RefundTrackerTab() {
  const [values, setValues] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const search = useDebouncedValue(values.search.trim());

  const filters: RefundsFilters = {
    search: search || undefined,
    status: pickedFilter(values.status),
    range: pickedFilter(values.range),
  };
  const { data, isError, isFetching, refetch } = useFinanceRefunds(filters, page);
  const selected = data?.items.find((refund) => refund.id === selectedId);

  // Any filter change starts from the first page with nothing selected
  const handleFilterChange = (change: Partial<typeof EMPTY_FILTERS>) => {
    setValues((current) => ({ ...current, ...change }));
    setPage(1);
    setSelectedId(null);
  };

  if (isError && !data) return <DashboardErrorState onRetry={() => refetch()} isRetrying={isFetching} />;

  return (
    <div className="flex flex-col gap-8">
      {data && (
        <StatCards
          stats={[
            { label: "Total Refund Request", ...statOf(data.stats.total) },
            { label: "Completed Refunds", ...statOf(data.stats.completed) },
            { label: "Pending Refunds", ...statOf(data.stats.pending) },
            { label: "Failed Refunds", ...statOf(data.stats.failed) },
          ]}
        />
      )}

      <section className={cn(financeCardClass, "overflow-hidden")}>
        <div className="px-5 pb-6 pt-7">
          <h2 className="text-3xl font-semibold tracking-tight text-[#344054]">Refund Request</h2>
          <div className="mt-3 flex flex-wrap items-end gap-5">
            <SearchField
              value={values.search}
              onChange={(value) => handleFilterChange({ search: value })}
              placeholder="Search by mentor, mentee, or topic..."
              label="Search refunds"
              className="w-full max-w-lg border-0 bg-[#F7F8FB]"
            />
            <CaptionSelect
              caption="Status"
              placeholder="All types"
              value={values.status}
              options={STATUS_OPTIONS}
              onChange={(status) => handleFilterChange({ status })}
            />
            <CaptionSelect
              caption="Range"
              placeholder="All time"
              value={values.range}
              options={RANGE_OPTIONS}
              onChange={(range) => handleFilterChange({ range })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
          <div className="min-w-0 flex-1">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] border-collapse">
                <thead className="bg-[#F2F4F7]">
                  <tr>
                    <th className="w-10 py-5 pl-5 text-left">
                      <input
                        type="checkbox"
                        aria-label="Clear the selected refund"
                        checked={selectedId !== null}
                        onChange={() => setSelectedId(null)}
                        className={checkboxClass}
                      />
                    </th>
                    {COLUMNS.map((column) => (
                      <th key={column} scope="col" className={headClass}>
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={cn(isFetching && data && "opacity-60")}>
                  {!data && <TableSkeletonRows headers={COLUMNS} withActions rows={5} cellClassName="px-5 py-4" />}
                  {data?.items.length === 0 && (
                    <tr>
                      <td colSpan={COLUMNS.length + 1} className={cn(cellClass, "py-16 text-center text-sm")}>
                        No refunds match these filters.
                      </td>
                    </tr>
                  )}
                  {data?.items.map((refund) => {
                    const isSelected = refund.id === selectedId;
                    return (
                      <tr key={refund.id}>
                        <td className="py-4 pl-5 align-middle">
                          <input
                            type="checkbox"
                            aria-label={`Review the refund for ${refund.user.name}`}
                            checked={isSelected}
                            onChange={() => setSelectedId(isSelected ? null : refund.id)}
                            className={checkboxClass}
                          />
                        </td>
                        <td className={cn(cellClass, "max-w-20 truncate")}>{refund.id}</td>
                        <td className={cellClass}>
                          <div className="flex items-center gap-2">
                            <UserAvatar
                              name={refund.user.name}
                              avatarUrl={refund.user.avatarUrl}
                              className="size-7 text-[10px]"
                            />
                            <div>
                              <p className="text-xs font-semibold text-[#101828]">{refund.user.name}</p>
                              <p className="text-[9px]">{refund.user.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className={cellClass}>
                          <span className={cn(refundChipClass, "bg-[#FBE8FB] text-[#C026D3]")}>Session</span>
                        </td>
                        <td className={cn(cellClass, "text-[#101828]")}>{formatAmount(refund.amount)}</td>
                        <td className={cn(cellClass, "max-w-28 text-[#101828]")}>{refund.reason}</td>
                        <td className={cellClass}>
                          <span className={cn(refundChipClass, REFUND_STATUS[refund.status].className)}>
                            {REFUND_STATUS[refund.status].label}
                          </span>
                        </td>
                        <td className={cn(cellClass, "whitespace-nowrap text-xs text-[#101828]")}>
                          <p>{formatLongDate(refund.requestedAt)}</p>
                          <p className="text-[10px] text-[#475467]">{formatClock(refund.requestedAt)}</p>
                        </td>
                        <td className={cellClass}>
                          <button
                            type="button"
                            onClick={() => setSelectedId(refund.id)}
                            className="flex size-8 items-center justify-center rounded-full hover:bg-[#F2F4F7]"
                          >
                            <More size="18" variant="Outline" color="#475467" className="rotate-90" />
                            <span className="sr-only">Open details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {!!data?.items.length && (
              <div className="flex justify-end px-5 py-5">
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
              {/* Remounts for each refund, so a half-written note never carries over */}
              <RefundDetailsPanel key={selected.id} refund={selected} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const statOf = (stat: { count: number; changePct: number | null }) => ({
  value: formatAmount(stat.count),
  note: formatChange(stat.changePct),
});
