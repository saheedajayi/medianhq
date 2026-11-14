import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/base/skeleton";
import { cn } from "@/lib/utils";
import { Pagination } from "../shared/list-controls";
import { sessionsCellClass, sessionsHeadClass } from "./session-utils";

interface SessionsCardProps {
  title?: string;
  /** The green count beside the title, such as "30 Active" */
  count?: string;
  /** Search and filters, shown between the title and the table */
  toolbar?: ReactNode;
  columns: string[];
  /** Undefined while the first page loads */
  rowCount?: number;
  emptyMessage: string;
  isRefreshing: boolean;
  page: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  /** The table rows */
  children: ReactNode;
}

const SKELETON_ROWS = 6;

/** The bordered card every sessions tab shows its table in */
export function SessionsCard({
  title,
  count,
  toolbar,
  columns,
  rowCount,
  emptyMessage,
  isRefreshing,
  page,
  lastPage,
  onPageChange,
  children,
}: SessionsCardProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#EAECF0] bg-white">
      {title && (
        <div className="flex items-center gap-3 px-5 pb-3 pt-5">
          <h2 className="text-sm font-semibold text-[#101828]">{title}</h2>
          {count && (
            <span className="flex items-center gap-2 text-sm text-[#067647]">
              <span className="size-1.5 rounded-full bg-[#067647]" />
              {count}
            </span>
          )}
        </div>
      )}
      {toolbar && <div className="px-5 pb-4 pt-2">{toolbar}</div>}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse">
          <thead className="bg-[#F2F4F7]">
            <tr>
              {columns.map((column, index) => (
                <th key={column} scope="col" className={cn(sessionsHeadClass, index === 0 && "pl-8")}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={cn(isRefreshing && "opacity-60")}>
            {rowCount === undefined &&
              Array.from({ length: SKELETON_ROWS }).map((_, index) => (
                <tr key={index}>
                  <td colSpan={columns.length} className="px-5 py-3">
                    <Skeleton className="h-12 w-full" />
                  </td>
                </tr>
              ))}
            {rowCount === 0 && (
              <tr>
                <td colSpan={columns.length} className={cn(sessionsCellClass, "py-16 text-center text-[#667085]")}>
                  {emptyMessage}
                </td>
              </tr>
            )}
            {children}
          </tbody>
        </table>
      </div>

      {!!rowCount && (
        <div className="flex justify-end px-5 py-5">
          <Pagination page={page} lastPage={lastPage} onChange={onPageChange} />
        </div>
      )}
    </section>
  );
}
