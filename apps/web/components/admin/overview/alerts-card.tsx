import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { ShieldTick } from "iconsax-react";
import type { AdminOverviewAlert } from "@/services/admin/overview";
import { cn } from "@/lib/utils";
import { formatTime } from "../shared/format";
import { badgeClass, cardClass, cardTitleClass, linkClass } from "../shared/shared";

const SEVERITY: Record<AdminOverviewAlert["severity"], { label: string; className: string }> = {
  URGENT: { label: "Urgent", className: "bg-[#FEF3F2] text-[#B42318]" },
  NEEDS_REVIEW: { label: "Needs review", className: "bg-[#FFFAEB] text-[#B54708]" },
};

// Where an admin goes to deal with each kind of alert
const ALERT_ACTION: Record<AdminOverviewAlert["kind"], { label: string; href: string }> = {
  MENTOR_NO_SHOW: { label: "Review attendance", href: "/admin/sessions" },
  REFUND_FAILED: { label: "Inspect refund", href: "/admin/finance" },
  APPLICATIONS_WAITING: { label: "Review applications", href: "/admin/applications" },
  CONTENT_FLAGGED: { label: "Review report", href: "/admin/moderation" },
  PAYOUT_FAILED: { label: "Inspect payouts", href: "/admin/finance" },
};

interface AlertsCardProps {
  alerts: AdminOverviewAlert[];
  generatedAt: string;
}

export function AlertsCard({ alerts, generatedAt }: AlertsCardProps) {
  return (
    <section className={cn(cardClass, "min-w-0 p-6")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className={cardTitleClass}>Real-time alerts</h2>
          <span className={cn(badgeClass, "bg-[#FFF4ED] text-[#B93815]")}>{alerts.length} open</span>
        </div>
        <span className="text-xs text-[#667085]">Snapshot at {formatTime(generatedAt)} WAT</span>
      </div>

      {alerts.length === 0 ? (
        <p className="mt-6 text-sm text-[#667085]">Nothing needs attention right now.</p>
      ) : (
        <ul className="mt-3 divide-y divide-[#EAECF0]">
          {alerts.map((alert) => {
            const action = ALERT_ACTION[alert.kind];
            const severity = SEVERITY[alert.severity];

            return (
              <li key={alert.id} className="flex gap-4 py-4 last:pb-0">
                <ShieldTick size="22" variant="Outline" color="#101828" className="mt-6 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#101828]">{alert.title}</p>
                  <p className="mt-1 text-xs text-[#667085]">{alert.detail}</p>
                  <p className="mt-2 flex items-center gap-2.5 text-xs text-[#667085]">
                    <span className={cn("rounded-full px-2 py-0.5 font-semibold", severity.className)}>
                      {severity.label}
                    </span>
                    {formatDistanceToNowStrict(new Date(alert.occurredAt), { addSuffix: true })}
                  </p>
                </div>
                <Link href={action.href} className={cn(linkClass, "shrink-0 self-center")}>
                  {action.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
