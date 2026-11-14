import { DocumentText, People, Verify, Video, Wallet } from "iconsax-react";
import type { AdminOverview } from "@/services/admin/overview";
import { cn } from "@/lib/utils";
import { formatCount, formatMoney } from "../shared/format";
import { cardClass } from "../shared/shared";

interface OverviewStatsProps {
  stats: AdminOverview["stats"];
}

export function OverviewStats({ stats }: OverviewStatsProps) {
  const cards = [
    {
      label: "Total MAU",
      icon: People,
      value: formatCount(stats.monthlyActiveUsers),
      note: "Active in the last 30 days",
    },
    {
      label: "Sessions today",
      icon: Video,
      value: formatCount(stats.sessionsToday.total),
      note: `${formatCount(stats.sessionsToday.completed)} completed · ${formatCount(stats.sessionsToday.inProgress)} in progress`,
    },
    {
      label: "Revenue today",
      icon: Wallet,
      value: formatMoney(stats.revenueToday.amount),
      note: "Gross revenue",
    },
    {
      label: "Active mentors",
      icon: Verify,
      value: formatCount(stats.mentors.approved),
      note: `${formatCount(stats.mentors.withSessionsLast30Days)} with sessions in the last 30 days`,
    },
    {
      label: "Pending applications",
      icon: DocumentText,
      value: formatCount(stats.pendingApplications.total),
      note: `${formatCount(stats.pendingApplications.nearingReviewTarget)} approaching review target`,
    },
  ];

  return (
    <section aria-label="Key figures" className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      {cards.map(({ label, icon: Icon, value, note }) => (
        <div key={label} className={cn(cardClass, "flex flex-col gap-3 p-5")}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-[#667085]">{label}</span>
            <Icon size="18" variant="Outline" color="#FF5514" className="shrink-0" />
          </div>
          <div className="text-[26px] font-bold leading-tight tracking-tight text-[#101828]">{value}</div>
          <span className="text-xs text-[#667085]">{note}</span>
        </div>
      ))}
    </section>
  );
}
