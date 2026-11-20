"use client";

import { Pagination } from "@/components/admin/shared/list-controls";
import { formatDay } from "@/components/admin/shared/format";
import { TableSkeletonRows } from "@/components/admin/shared/skeletons";
import type { Page, Payout } from "@/services/earnings";
import { cn } from "@/lib/utils";
import { EarningsEmptyState } from "./earnings-empty-state";
import {
  PAYOUT_STATUS,
  cardClass,
  cardTitleClass,
  chipClass,
  formatNaira,
  tableCellClass,
  tableHeadClass,
  viewLinkClass,
} from "./earnings-utils";

const COLUMNS = ["Date requested", "Amount", "Destination", "Reference", "Status", "Action"];

interface PayoutHistoryTableProps {
  /** Undefined while the first page loads */
  payouts?: Page<Payout>;
  isFetching: boolean;
  canRequestPayout: boolean;
  onRequestPayout: () => void;
  onPageChange: (page: number) => void;
  onView: (payout: Payout) => void;
}

/** Every payout the mentor has asked for, newest first */
export function PayoutHistoryTable({
  payouts,
  isFetching,
  canRequestPayout,
  onRequestPayout,
  onPageChange,
  onView,
}: PayoutHistoryTableProps) {
  const rows = payouts?.items ?? [];
  const isEmpty = payouts?.total === 0;
  const firstRow = payouts ? (payouts.page - 1) * payouts.pageSize + 1 : 0;

  return (
    <section className={cardClass}>
      <h2 className={cn(cardTitleClass, "px-4 pt-8 pb-5")}>Payout history</h2>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse">
          <thead>
            <tr>
              {COLUMNS.map((column) => (
                <th key={column} scope="col" className={tableHeadClass}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={cn(isFetching && payouts && "opacity-60")}>
            {!payouts && <TableSkeletonRows headers={COLUMNS} rows={8} cellClassName="px-4 py-4" />}
            {rows.map((payout) => {
              const status = PAYOUT_STATUS[payout.status];
              return (
                <tr key={payout.id}>
                  <td className={cn(tableCellClass, "text-xs text-[#667085]")}>{formatDay(payout.requestedAt)}</td>
                  <td className={cn(tableCellClass, "text-sm font-medium text-[#101828]")}>
                    {formatNaira(payout.amount)}
                  </td>
                  <td className={cn(tableCellClass, "text-sm whitespace-nowrap text-[#475467]")}>
                    {payout.bankName} •••• {payout.accountLastFour}
                  </td>
                  <td className={cn(tableCellClass, "text-sm whitespace-nowrap text-[#667085]")}>{payout.reference}</td>
                  <td className={tableCellClass}>
                    <span className={cn(chipClass, status.className)}>{status.label}</span>
                  </td>
                  <td className={tableCellClass}>
                    <button type="button" onClick={() => onView(payout)} className={viewLinkClass}>
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isEmpty && (
        <EarningsEmptyState
          title="No payouts yet"
          description="Once you request a payout, it'll show up here with its status and reference."
          action={
            <button
              type="button"
              disabled={!canRequestPayout}
              onClick={onRequestPayout}
              className="h-10 rounded-full bg-[#FF5514] px-4 text-sm font-medium text-white transition-colors hover:bg-[#E84D12] disabled:cursor-not-allowed disabled:bg-[#F2F4F7] disabled:text-[#98A2B3]"
            >
              Request payout
            </button>
          }
        />
      )}

      {payouts && !isEmpty && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F2F4F7] px-4 py-4">
          <span className="text-xs text-[#667085]">
            Showing {firstRow.toLocaleString("en-NG")}–{(firstRow + rows.length - 1).toLocaleString("en-NG")} of{" "}
            {payouts.total.toLocaleString("en-NG")}
          </span>
          <Pagination
            page={payouts.page}
            lastPage={Math.max(Math.ceil(payouts.total / payouts.pageSize), 1)}
            onChange={onPageChange}
          />
        </div>
      )}
    </section>
  );
}
