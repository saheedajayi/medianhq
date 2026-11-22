"use client";

import { useState } from "react";
import Link from "next/link";
import { Pagination } from "@/components/admin/shared/list-controls";
import { formatDay } from "@/components/admin/shared/format";
import { TableSkeletonRows } from "@/components/admin/shared/skeletons";
import type { BookingTab } from "@/components/bookings/types";
import {
  cardClass,
  cardTitleClass,
  chipClass,
  tableCellClass,
  tableHeadClass,
  viewLinkClass,
} from "@/components/earnings/earnings-utils";
import { cn } from "@/lib/utils";
import type { SessionBookingStatus } from "@/services/mentor-sessions";
import { useMentorSessionBookings } from "@/services/mentor-sessions/queries/mentor-sessions.queries";

const COLUMNS = ["Mentee", "Date", "Status", "Action"];

/** The chip for each status, and the bookings tab where that booking can be opened */
const STATUS: Record<SessionBookingStatus, { label: string; className: string; tab: BookingTab }> = {
  PENDING_CONFIRMATION: { label: "Pending", className: "bg-[#FFFAEB] text-[#B54708]", tab: "pending" },
  CONFIRMED: { label: "Upcoming", className: "bg-[#EFF8FF] text-[#175CD3]", tab: "upcoming" },
  COMPLETED: { label: "Completed", className: "bg-[#ECFDF3] text-[#067647]", tab: "past" },
  NO_SHOW: { label: "No-show", className: "bg-[#F2F4F7] text-[#475467]", tab: "past" },
  CANCELLED: { label: "Cancelled", className: "bg-[#FEF3F2] text-[#B42318]", tab: "cancelled" },
  DECLINED: { label: "Declined", className: "bg-[#FEF3F2] text-[#B42318]", tab: "cancelled" },
  EXPIRED: { label: "Expired", className: "bg-[#F2F4F7] text-[#475467]", tab: "cancelled" },
};

/** Everyone who has booked this session, a page at a time */
export function SessionBookingsTable({ sessionId }: { sessionId: string }) {
  const [page, setPage] = useState(1);
  const { data, isError, isFetching, refetch } = useMentorSessionBookings(sessionId, page);

  const rows = data?.items ?? [];
  const firstRow = data ? (data.page - 1) * data.pageSize + 1 : 0;
  const lastPage = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <section className={cardClass}>
      <h2 className={cn(cardTitleClass, "px-4 pt-6 pb-5")}>All bookings</h2>

      {isError && !data ? (
        <div role="alert" className="flex items-center justify-between gap-4 border-t border-[#F2F4F7] p-4">
          <p className="text-sm text-[#475467]">We couldn&apos;t load these bookings.</p>
          <button
            type="button"
            disabled={isFetching}
            onClick={() => refetch()}
            className="shrink-0 rounded-full border border-[#FF8D62] px-3.5 py-1.5 text-xs font-semibold text-[#FF5514] transition hover:bg-[#FDF9F6] disabled:opacity-60"
          >
            {isFetching ? "Trying again..." : "Try again"}
          </button>
        </div>
      ) : data?.total === 0 ? (
        <p className="border-t border-[#F2F4F7] px-4 py-10 text-center text-sm text-[#667085]">
          No one has booked this session yet. Share it to get your first booking.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse">
              <thead>
                <tr>
                  {COLUMNS.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      // The mentee's name takes the spare width, as in the design
                      className={cn(tableHeadClass, column === "Mentee" && "w-[62%]")}
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={cn(isFetching && data && "opacity-60")}>
                {!data && <TableSkeletonRows headers={COLUMNS} rows={8} cellClassName="px-4 py-4" />}
                {rows.map((booking) => {
                  const status = STATUS[booking.status];
                  return (
                    <tr key={booking.id}>
                      <td className={cn(tableCellClass, "text-sm font-medium text-[#101828]")}>
                        {booking.menteeName}
                      </td>
                      <td className={cn(tableCellClass, "text-xs whitespace-nowrap text-[#667085]")}>
                        {formatDay(booking.date)}
                      </td>
                      <td className={tableCellClass}>
                        <span className={cn(chipClass, status.className)}>{status.label}</span>
                      </td>
                      <td className={tableCellClass}>
                        <Link href={`/mentor/bookings?tab=${status.tab}`} className={viewLinkClass}>
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {data && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F2F4F7] px-4 py-4">
              <p className="text-xs text-[#667085]">
                Showing {firstRow}–{firstRow + rows.length - 1} of {data.total}{" "}
                {data.total === 1 ? "booking" : "bookings"}
              </p>
              <Pagination page={data.page} lastPage={lastPage} onChange={setPage} />
            </div>
          )}
        </>
      )}
    </section>
  );
}
