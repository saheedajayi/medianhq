"use client";

import { ArrowRight } from "lucide-react";
import { Pagination } from "@/components/admin/shared/list-controls";
import { TableSkeletonRows } from "@/components/admin/shared/skeletons";
import { checkboxClass } from "@/components/admin/shared/shared";
import { formatDay } from "@/components/admin/shared/format";
import { useRowSelection } from "@/components/admin/shared/use-row-selection";
import type { Page, SessionEarning } from "@/services/earnings";
import { cn } from "@/lib/utils";
import { EarningsEmptyState } from "./earnings-empty-state";
import {
  EARNING_STATUS,
  cardClass,
  cardTitleClass,
  chipClass,
  formatNaira,
  formatNetEarned,
  tableCellClass,
  tableHeadClass,
  viewLinkClass,
} from "./earnings-utils";

const COLUMNS = ["Session", "Mentee", "Date", "Gross", "Net Earned", "Status", "Action"];

interface EarningsTableProps {
  /** Undefined while the first page loads */
  earnings?: Page<SessionEarning>;
  isFetching: boolean;
  isShowingAll: boolean;
  onShowAll: () => void;
  onPageChange: (page: number) => void;
  onView: (earning: SessionEarning) => void;
}

/** What each session earned, a page at a time */
export function EarningsTable({
  earnings,
  isFetching,
  isShowingAll,
  onShowAll,
  onPageChange,
  onView,
}: EarningsTableProps) {
  const selection = useRowSelection<SessionEarning>();
  const rows = earnings?.items ?? [];
  const isEmpty = earnings?.total === 0;
  const firstRow = earnings ? (earnings.page - 1) * earnings.pageSize + 1 : 0;

  return (
    <section className={cardClass}>
      <div className="flex items-center justify-between gap-4 px-4 pt-8 pb-5">
        <h2 className={cardTitleClass}>Earnings</h2>
        <button
          type="button"
          disabled={isEmpty || isShowingAll}
          onClick={onShowAll}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#FF5514] hover:underline disabled:text-[#98A2B3] disabled:no-underline"
        >
          View all earnings
          <ArrowRight className="size-5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse">
          <thead>
            <tr>
              <th scope="col" className={cn(tableHeadClass, "w-11 pr-0")}>
                <input
                  type="checkbox"
                  aria-label="Select every session on this page"
                  disabled={rows.length === 0}
                  checked={selection.isPageSelected(rows)}
                  onChange={() => selection.togglePage(rows)}
                  className={checkboxClass}
                />
              </th>
              {COLUMNS.map((column) => (
                <th key={column} scope="col" className={cn(tableHeadClass, column === "Session" && "pl-3")}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={cn(isFetching && earnings && "opacity-60")}>
            {!earnings && <TableSkeletonRows headers={COLUMNS} withCheckbox rows={8} cellClassName="px-4 py-4" />}
            {rows.map((earning) => {
              const status = EARNING_STATUS[earning.status];
              return (
                <tr key={earning.id} className={cn(selection.isSelected(earning.id) && "bg-[#FFFAF7]")}>
                  <td className={cn(tableCellClass, "pr-0")}>
                    <input
                      type="checkbox"
                      aria-label={`Select ${earning.sessionTitle} with ${earning.menteeName}`}
                      checked={selection.isSelected(earning.id)}
                      onChange={() => selection.toggle(earning)}
                      className={checkboxClass}
                    />
                  </td>
                  <td className={cn(tableCellClass, "pl-3 text-sm font-medium text-[#101828]")}>
                    {earning.sessionTitle}
                  </td>
                  <td className={cn(tableCellClass, "text-sm text-[#475467]")}>{earning.menteeName}</td>
                  <td className={cn(tableCellClass, "text-xs whitespace-nowrap text-[#667085]")}>
                    {formatDay(earning.date)}
                  </td>
                  <td className={cn(tableCellClass, "text-[13px] text-[#667085]")}>
                    {formatNaira(earning.grossAmount)}
                  </td>
                  <td
                    className={cn(
                      tableCellClass,
                      "text-[13px]",
                      earning.status === "REFUNDED" ? "text-[#D92D20]" : "text-[#101828]",
                    )}
                  >
                    {formatNetEarned(earning.status, earning.netAmount)}
                  </td>
                  <td className={tableCellClass}>
                    <span className={cn(chipClass, status.className)}>{status.label}</span>
                  </td>
                  <td className={tableCellClass}>
                    <button type="button" onClick={() => onView(earning)} className={viewLinkClass}>
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
          title="No earnings yet"
          description="You have not received any earnings on Median. Once you receive your first payment from a completed session, the details will show here"
        />
      )}

      {earnings && !isEmpty && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F2F4F7] px-4 py-4">
          <span className="text-xs text-[#667085]">
            Showing {firstRow.toLocaleString("en-NG")}–{(firstRow + rows.length - 1).toLocaleString("en-NG")} of{" "}
            {earnings.total.toLocaleString("en-NG")}
          </span>
          <Pagination
            page={earnings.page}
            lastPage={Math.max(Math.ceil(earnings.total / earnings.pageSize), 1)}
            onChange={onPageChange}
          />
        </div>
      )}
    </section>
  );
}
