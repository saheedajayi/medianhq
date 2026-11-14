"use client";

import type { ReactNode } from "react";
import { ExportSquare } from "iconsax-react";
import { cn } from "@/lib/utils";
import { Pagination, SearchField } from "../shared/list-controls";
import { textButtonClass } from "../shared/shared";
import { exportButtonClass, financeCardClass, financeCellClass, financeHeadClass } from "./finance-utils";
import { TableSkeletonRows } from "../shared/skeletons";

interface ServiceReportCardProps {
  title: string;
  columns: string[];
  search: string;
  onSearchChange: (search: string) => void;
  /** Whether the report is showing its longer, expanded list */
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onExport: () => void;
  /** Undefined while the first page loads */
  rowCount?: number;
  total: number;
  pageSize: number;
  page: number;
  onPageChange: (page: number) => void;
  isRefreshing: boolean;
  /** The table rows */
  children: ReactNode;
}

/** One of the two service charge reports: a searchable, exportable table that can be expanded */
export function ServiceReportCard({
  title,
  columns,
  search,
  onSearchChange,
  isExpanded,
  onToggleExpanded,
  onExport,
  rowCount,
  total,
  pageSize,
  page,
  onPageChange,
  isRefreshing,
  children,
}: ServiceReportCardProps) {
  return (
    <section className={cn(financeCardClass, "overflow-hidden")}>
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-5">
        <div>
          <h2 className="text-4xl font-semibold tracking-tight text-[#344054]">{title}</h2>
          <p className="mt-1 text-lg text-[#344054]">Service charge earned per session</p>
        </div>
        <div className="flex flex-1 items-center justify-end gap-3">
          <SearchField
            value={search}
            onChange={onSearchChange}
            placeholder="Search by mentor, mentee, or topic..."
            label={`Search the ${title.toLowerCase()}`}
            className="w-full max-w-md border-0 bg-[#F7F8FB]"
          />
          <button type="button" onClick={onToggleExpanded} className={cn(textButtonClass, "shrink-0 px-3 text-xl")}>
            {isExpanded ? "Previous" : "view all"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <thead className="bg-[#F2F4F7]">
            <tr>
              {columns.map((column, index) => (
                <th key={column} scope="col" className={cn(financeHeadClass, index === 0 && "pl-14")}>
                  {column}
                </th>
              ))}
              <th className="pr-7 text-right">
                <button type="button" onClick={onExport} disabled={!rowCount} className={exportButtonClass}>
                  <ExportSquare size="18" variant="Outline" color="#FFFFFF" />
                  Export
                </button>
              </th>
            </tr>
          </thead>
          <tbody className={cn(isRefreshing && "opacity-60")}>
            {rowCount === undefined && <TableSkeletonRows headers={columns} withActions rows={5} cellClassName="px-5 py-4" />}
            {rowCount === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className={cn(financeCellClass, "py-12 text-center text-sm")}>
                  No service charges to show.
                </td>
              </tr>
            )}
            {children}
          </tbody>
        </table>
      </div>

      {!!rowCount && (
        <div className="flex justify-end px-7 py-5">
          <Pagination page={page} lastPage={Math.max(Math.ceil(total / pageSize), 1)} onChange={onPageChange} />
        </div>
      )}
    </section>
  );
}
