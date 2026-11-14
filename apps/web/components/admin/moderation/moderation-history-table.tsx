"use client";

import { useState } from "react";
import { More } from "iconsax-react";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { Skeleton } from "@/components/ui/base/skeleton";
import { useModerationHistory } from "@/services/admin/moderation/queries/moderation.queries";
import { cn } from "@/lib/utils";
import { Pagination } from "../shared/list-controls";
import { ContentTypeChip, FlagDate, FlagStatusChip, ModerationPerson } from "./moderation-cells";

const COLUMNS = ["Date & Time", "Content Type", "Content Preview", "Action", "Reviewer", "Reason"];
const headClass = "px-5 py-5 text-left text-base font-semibold text-[#475467]";
const cellClass = "px-5 py-4 align-middle text-sm text-[#475467]";

/** Every reviewer action taken, newest first */
export function ModerationHistoryTable() {
  const [page, setPage] = useState(1);
  const { data, isError, isFetching, refetch } = useModerationHistory(page);

  if (isError && !data) return <DashboardErrorState onRetry={() => refetch()} isRetrying={isFetching} />;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse">
          <thead className="bg-[#F2F4F7]">
            <tr>
              {COLUMNS.map((column) => (
                <th key={column} scope="col" className={headClass}>
                  {column}
                </th>
              ))}
              <th>
                <span className="sr-only">Actions</span>
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
            {data?.items.map((entry) => (
              <tr key={entry.id}>
                <td className={cellClass}>
                  <FlagDate iso={entry.at} />
                </td>
                <td className={cellClass}>
                  <ContentTypeChip type={entry.contentType} className="px-2 text-sm" />
                </td>
                <td className={cellClass}>
                  <p className="line-clamp-2 max-w-52 text-xs">{entry.content}</p>
                  <p className="mt-1 text-[10px] text-[#98A2B3]">By {entry.authorName}</p>
                </td>
                <td className={cellClass}>
                  <FlagStatusChip status={entry.outcome} className="px-2 text-sm" />
                </td>
                <td className={cellClass}>
                  <ModerationPerson person={entry.reviewer} />
                </td>
                <td className={cn(cellClass, "max-w-36")}>{entry.reason}</td>
                <td className={cellClass}>
                  <More size="18" variant="Outline" color="#475467" className="rotate-90" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.total > data.pageSize && (
        <div className="flex justify-end px-5 py-5">
          <Pagination page={page} lastPage={Math.ceil(data.total / data.pageSize)} onChange={setPage} />
        </div>
      )}
    </>
  );
}
