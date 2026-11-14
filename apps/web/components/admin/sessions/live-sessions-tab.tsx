"use client";

import { useState } from "react";
import Link from "next/link";
import { Video } from "iconsax-react";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { useLiveSessions } from "@/services/admin/sessions/queries/sessions.queries";
import { cn } from "@/lib/utils";
import { formatClock } from "../shared/format";
import { SessionPersonCell, SessionTypeChip } from "./session-cells";
import { sessionsCellClass, squareChipClass, viewButtonClass } from "./session-utils";
import { SessionsCard } from "./sessions-card";

const COLUMNS = ["Start Time", "Duration", "Mentor", "Mentee", "Session Type", "Status", "Action"];

export function LiveSessionsTab() {
  const [page, setPage] = useState(1);
  const { data, isError, isFetching, refetch } = useLiveSessions(page);

  if (isError && !data) return <DashboardErrorState onRetry={() => refetch()} isRetrying={isFetching} />;

  return (
    <SessionsCard
      title="Live Sessions"
      count={data && `${data.total} Active`}
      columns={COLUMNS}
      rowCount={data?.items.length}
      emptyMessage="No sessions are in progress right now."
      isRefreshing={isFetching && !!data}
      page={page}
      lastPage={data ? Math.max(Math.ceil(data.total / data.pageSize), 1) : 1}
      onPageChange={setPage}
    >
      {data?.items.map((session) => (
        <tr key={session.id}>
          <td className={cn(sessionsCellClass, "pl-8")}>
            <span className="flex items-center gap-4 whitespace-nowrap">
              <Video size="20" variant="Outline" color="#344054" />
              {formatClock(session.startsAt)}
            </span>
          </td>
          <td className={sessionsCellClass}>{session.durationMinutes}m</td>
          <td className={sessionsCellClass}>
            <SessionPersonCell person={session.mentor} />
          </td>
          <td className={sessionsCellClass}>
            <SessionPersonCell person={session.mentee} />
          </td>
          <td className={sessionsCellClass}>
            <SessionTypeChip type={session.type} />
          </td>
          <td className={sessionsCellClass}>
            <span className={cn(squareChipClass, "inline-flex items-center gap-2 bg-[#E7F4EE] text-[#067647]")}>
              <span className="size-1.5 rounded-full bg-[#067647]" />
              In Progress
            </span>
          </td>
          <td className={sessionsCellClass}>
            <Link href={`/admin/bookings/${session.id}`} className={viewButtonClass}>
              View
            </Link>
          </td>
        </tr>
      ))}
    </SessionsCard>
  );
}
