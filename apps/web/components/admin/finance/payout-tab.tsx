"use client";

import { useState } from "react";
import { ExportSquare, More } from "iconsax-react";
import { toast } from "sonner";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { Skeleton } from "@/components/ui/base/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { adminFinanceService, type PayoutsFilters, type PayoutStatus } from "@/services/admin/finance";
import { useFinancePayouts } from "@/services/admin/finance/queries/finance.queries";
import { downloadCsv } from "@/lib/csv";
import { cn } from "@/lib/utils";
import { formatClock, formatLongDate } from "../shared/format";
import { Pagination, SearchField } from "../shared/list-controls";
import { StatCards } from "../shared/stat-cards";
import { UserAvatar } from "../shared/shared";
import {
  exportButtonClass,
  financeCardClass,
  financeCellClass,
  financeChipClass,
  financeHeadClass,
  formatAmount,
  formatChange,
  notifyNotConnected,
} from "./finance-utils";

const PAYOUT_STATUS: Record<PayoutStatus, { label: string; className: string }> = {
  PAID: { label: "Paid", className: "bg-[#E7F4EE] text-[#067647]" },
  PENDING: { label: "Pending", className: "bg-[#FFEAD5] text-[#E04F16]" },
  FAILED: { label: "Failed", className: "bg-[#FEE4E2] text-[#F04438]" },
};

// "Total" lists every payout; the other two narrow to one status
const STATUS_FILTERS: { label: string; value?: PayoutStatus }[] = [
  { label: "Total" },
  { label: "Pending", value: "PENDING" },
  { label: "Failed", value: "FAILED" },
];

const COLUMNS = ["Mentor", "Amount", "Status", "Date", "Actions"];

export function PayoutTab() {
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<PayoutStatus>();
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const search = useDebouncedValue(searchInput.trim());

  const filters: PayoutsFilters = { status, search: search || undefined };
  const { data, isError, isFetching, refetch } = useFinancePayouts(filters, page);

  const handleStatusChange = (nextStatus?: PayoutStatus) => {
    setStatus(nextStatus);
    setPage(1);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await adminFinanceService.exportPayouts(filters);
      downloadCsv("median-payouts.csv", [
        ["Payout ID", "Mentor", "Bank code", "Amount", "Currency", "Status", "Requested at"],
        ...response.data.map((payout) => [
          payout.id,
          payout.mentor.name,
          payout.bankCode,
          payout.amount,
          payout.currency,
          PAYOUT_STATUS[payout.status].label,
          payout.requestedAt,
        ]),
      ]);
    } catch {
      toast.error("We couldn't export the payouts. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isError && !data) return <DashboardErrorState onRetry={() => refetch()} isRetrying={isFetching} />;

  return (
    <div className="flex flex-col gap-8">
      {data && (
        <StatCards
          className="xl:grid-cols-3"
          stats={[
            { label: "Total Paid Out", ...statOf(data.stats.totalPaidOut) },
            { label: "Pending Balance", ...statOf(data.stats.pendingBalance) },
            { label: "Failed Disbursements", ...statOf(data.stats.failedDisbursements) },
          ]}
        />
      )}

      <section className={cn(financeCardClass, "overflow-hidden")}>
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-10">
          <SearchField
            value={searchInput}
            onChange={(value) => {
              setSearchInput(value);
              setPage(1);
            }}
            placeholder="Search by mentor, mentee, or topic..."
            label="Search payouts"
            className="w-full max-w-md border-0 bg-[#F7F8FB]"
          />
          <div className="flex flex-wrap gap-5">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.label}
                type="button"
                aria-pressed={status === filter.value}
                onClick={() => handleStatusChange(filter.value)}
                className={cn(
                  "rounded px-7 py-2 text-lg transition-colors",
                  status === filter.value ? "bg-[#FF5514] font-medium text-white" : "bg-[#D0D5DD] text-[#EAECF0]",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead className="bg-[#F2F4F7]">
              <tr>
                {COLUMNS.map((column) => (
                  <th key={column} scope="col" className={cn(financeHeadClass, column === "Mentor" && "pl-12")}>
                    {column}
                  </th>
                ))}
                <th className="pr-5 text-right">
                  <button type="button" onClick={handleExport} disabled={isExporting || !data} className={exportButtonClass}>
                    <ExportSquare size="18" variant="Outline" color="#FFFFFF" />
                    Export
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className={cn(isFetching && data && "opacity-60")}>
              {!data && (
                <tr>
                  <td colSpan={COLUMNS.length + 1} className="px-5 py-4">
                    <Skeleton className="h-64 w-full" />
                  </td>
                </tr>
              )}
              {data?.items.length === 0 && (
                <tr>
                  <td colSpan={COLUMNS.length + 1} className={cn(financeCellClass, "py-16 text-center text-sm")}>
                    No payouts match these filters.
                  </td>
                </tr>
              )}
              {data?.items.map((payout) => (
                <tr key={payout.id}>
                  <td className={cn(financeCellClass, "pl-12")}>
                    <div className="flex items-center gap-3">
                      <UserAvatar name={payout.mentor.name} avatarUrl={payout.mentor.avatarUrl} className="size-11" />
                      <div>
                        <p className="text-sm font-semibold text-[#101828]">{payout.mentor.name}</p>
                        <p className="text-xs text-[#667085]">Bank {payout.bankCode}</p>
                      </div>
                    </div>
                  </td>
                  <td className={cn(financeCellClass, "text-lg")}>{formatAmount(payout.amount)}</td>
                  <td className={financeCellClass}>
                    <span className={cn(financeChipClass, PAYOUT_STATUS[payout.status].className)}>
                      {PAYOUT_STATUS[payout.status].label}
                    </span>
                  </td>
                  <td className={cn(financeCellClass, "whitespace-nowrap text-sm")}>
                    <p>{formatLongDate(payout.requestedAt)}</p>
                    <p className="text-xs">{formatClock(payout.requestedAt)}</p>
                  </td>
                  <td className={financeCellClass} colSpan={2}>
                    <button
                      type="button"
                      onClick={() => notifyNotConnected("Payout review")}
                      className="flex size-8 items-center justify-center rounded-full hover:bg-[#F2F4F7]"
                    >
                      <More size="20" variant="Outline" color="#475467" className="rotate-90" />
                      <span className="sr-only">Review payout</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!!data?.items.length && (
          <div className="flex justify-end px-5 py-6">
            <Pagination page={page} lastPage={Math.max(Math.ceil(data.total / data.pageSize), 1)} onChange={setPage} />
          </div>
        )}
      </section>
    </div>
  );
}

const statOf = (stat: { amount: number; changePct: number | null }) => ({
  value: formatAmount(stat.amount),
  note: formatChange(stat.changePct),
});
