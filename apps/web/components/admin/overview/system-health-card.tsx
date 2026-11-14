import type { AdminHealthStatus, AdminOverview } from "@/services/admin/overview";
import { cn } from "@/lib/utils";
import { formatTime } from "../shared/format";
import { badgeClass, cardClass, cardTitleClass } from "../shared/shared";

const HEALTH_BADGE: Record<AdminHealthStatus, string> = {
  OPERATIONAL: "bg-[#ECFDF3] text-[#067647]",
  DEGRADED: "bg-[#FFFAEB] text-[#B54708]",
};

interface SystemHealthCardProps {
  systemHealth: AdminOverview["systemHealth"];
}

export function SystemHealthCard({ systemHealth }: SystemHealthCardProps) {
  return (
    <section className={cn(cardClass, "p-6")}>
      <div className="flex items-center justify-between gap-3">
        <h2 className={cardTitleClass}>System health</h2>
        <span className={cn(badgeClass, "shrink-0", HEALTH_BADGE[systemHealth.status])}>
          {systemHealth.status === "DEGRADED" ? "Degraded" : "Operational"}
        </span>
      </div>

      <dl className="mt-3 divide-y divide-[#EAECF0]">
        {systemHealth.items.map((item) => (
          <div key={item.label} className="flex items-start justify-between gap-3 py-4">
            <div>
              <dt className="text-xs text-[#667085]">{item.label}</dt>
              <dd className="mt-1.5 text-sm font-semibold text-[#101828]">{item.value}</dd>
            </div>
            <span className={cn(badgeClass, "shrink-0", HEALTH_BADGE[item.status])}>{item.statusLabel}</span>
          </div>
        ))}
      </dl>

      <p className="border-t border-[#EAECF0] pt-4 text-xs text-[#667085]">
        Last checked {formatTime(systemHealth.checkedAt)} WAT · {systemHealth.note}
      </p>
    </section>
  );
}
