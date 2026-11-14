"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { useAdminOverview } from "@/services/admin/overview/queries/overview.queries";
import { useAdminAuditLog } from "@/services/admin/settings/queries/settings.queries";
import {
  formatClock,
  formatCount,
  formatLongDate,
  formatMoney,
} from "../shared/format";
import { UserAvatar, textButtonClass } from "../shared/shared";
import { StatCards } from "../shared/stat-cards";
import { AdminSkeleton, StatCardsSkeleton, TableCardSkeleton } from "../shared/skeletons";

const cardClass = "rounded-2xl border border-[#EAECF0] bg-white";
const titleClass = "text-2xl font-semibold text-[#475467]";
const headClass = "px-6 py-2.5 text-left text-lg font-semibold text-[#475467]";
const cellClass = "px-6 py-3.5 text-xl text-[#667085]";
const linkButtonClass =
  "block rounded border border-[#475467] bg-[#FCFCFD] px-4 py-3 text-center text-lg font-semibold text-[#344054]! transition-colors hover:bg-[#F2F4F7]";

const AUDIT_PREVIEW_ROWS = 4;
const ALERT_PREVIEW_ROWS = 3;

const QUICK_LINKS = [
  { label: "Export Reports", href: "/admin/finance" },
  { label: "Manage Users", href: "/admin/users" },
  { label: "Moderate Content", href: "/admin/moderation" },
  { label: "View Analytics", href: "/admin/analytics" },
];

export function AdminsDashboardTab() {
  const [isAuditLogExpanded, setIsAuditLogExpanded] = useState(false);
  const overviewQuery = useAdminOverview("7d");
  const auditLogQuery = useAdminAuditLog();
  const { data: overview } = overviewQuery;
  const { data: auditLog } = auditLogQuery;

  const failed = [overviewQuery, auditLogQuery].find(
    (query) => query.isError && !query.data,
  );
  if (failed)
    return (
      <DashboardErrorState
        onRetry={() => failed.refetch()}
        isRetrying={failed.isFetching}
      />
    );

  if (!overview || !auditLog) {
    return (
      <AdminSkeleton label="Loading the admins dashboard">
        <StatCardsSkeleton />
        <TableCardSkeleton headers={["Date & Time", "Admin", "Action", "User", "Status"]} />
      </AdminSkeleton>
    );
  }

  const { stats, nps, alerts } = overview;
  const shownEntries = isAuditLogExpanded
    ? auditLog
    : auditLog.slice(0, AUDIT_PREVIEW_ROWS);

  return (
    <div className="flex flex-col gap-8">
      <StatCards
        className="xl:grid-cols-5"
        stats={[
          {
            label: "MUA",
            value: formatCount(stats.monthlyActiveUsers),
            note: "Active in the last 30 days",
          },
          {
            label: "Sessions",
            value: formatCount(stats.sessionsToday.total),
            note: `${formatCount(stats.sessionsToday.completed)} completed today`,
          },
          {
            label: "Revenue",
            value: formatMoney(stats.revenueToday.amount),
            note: "Gross revenue today",
          },
          {
            label: "NPS",
            value: nps.score === null ? "—" : String(nps.score),
            note: `${formatCount(nps.responses)} responses this week`,
          },
          {
            label: "Pending Application",
            value: formatCount(stats.pendingApplications.total),
            note: `${formatCount(stats.pendingApplications.nearingReviewTarget)} approaching review target`,
          },
        ]}
      />

      <section className={`${cardClass} overflow-hidden`}>
        <div className="flex items-center gap-10 px-6 py-4">
          <h2 className={titleClass}>Audit log</h2>
          {auditLog.length > AUDIT_PREVIEW_ROWS && (
            <button
              type="button"
              onClick={() => setIsAuditLogExpanded(!isAuditLogExpanded)}
              className={textButtonClass}
            >
              {isAuditLogExpanded ? "view less" : "view all"}
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead className="bg-[#F2F4F7]">
              <tr>
                {["Time", "Admin", "Action", "Details"].map((column) => (
                  <th key={column} scope="col" className={headClass}>
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shownEntries.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className={`${cellClass} py-12 text-center text-sm`}
                  >
                    No admin actions recorded yet.
                  </td>
                </tr>
              )}
              {shownEntries.map((entry) => (
                <tr key={entry.id}>
                  <td className={`${cellClass} whitespace-nowrap`}>
                    {formatLongDate(entry.at)}. {formatClock(entry.at)}
                  </td>
                  <td className={cellClass}>
                    <span title={entry.adminName}>
                      <UserAvatar
                        name={entry.adminName}
                        avatarUrl={null}
                        className="bg-[#FF8D62] text-white"
                      />
                    </span>
                    <span className="sr-only">{entry.adminName}</span>
                  </td>
                  <td className={cellClass}>{entry.action}</td>
                  <td className={cellClass}>{entry.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] xl:max-w-3xl">
        <section className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className={titleClass}>Real Time Alerts</h2>
            <Link
              href="/admin"
              className={`${textButtonClass} text-[#FF5514]!`}
            >
              view all
            </Link>
          </div>
          {alerts.length === 0 ? (
            <p className="mt-6 text-sm text-[#667085]">
              Nothing needs attention right now.
            </p>
          ) : (
            <ul className="mt-8 flex flex-col gap-7">
              {alerts.slice(0, ALERT_PREVIEW_ROWS).map((alert) => (
                <li
                  key={alert.id}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-lg text-[#344054]">{alert.title}</p>
                    <p className="truncate text-sm text-[#475467]">
                      {alert.detail}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-[#344054]">
                    {formatDistanceToNowStrict(new Date(alert.occurredAt), {
                      addSuffix: true,
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={`${cardClass} p-7`}>
          <h2 className={titleClass}>Quick actions</h2>
          <ul className="mt-6 flex flex-col gap-5">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkButtonClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
