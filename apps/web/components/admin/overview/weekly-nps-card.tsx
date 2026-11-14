import type { AdminOverview } from "@/services/admin/overview";
import { cn } from "@/lib/utils";
import { formatCount, formatDayRange } from "../shared/format";
import { badgeClass, cardClass, cardTitleClass } from "../shared/shared";
import { NPS_GROUPS, formatSigned } from "./overview-utils";

interface WeeklyNpsCardProps {
  nps: AdminOverview["nps"];
}

export function WeeklyNpsCard({ nps }: WeeklyNpsCardProps) {
  return (
    <section className={cn(cardClass, "p-6")}>
      <div className="flex items-center justify-between gap-3">
        <h2 className={cardTitleClass}>Weekly NPS</h2>
        {nps.changeFromPreviousWeek !== null && (
          <span
            className={cn(
              badgeClass,
              nps.changeFromPreviousWeek < 0 ? "bg-[#FEF3F2] text-[#B42318]" : "bg-[#ECFDF3] text-[#067647]",
            )}
          >
            {formatSigned(nps.changeFromPreviousWeek)} pts
          </span>
        )}
      </div>
      <p className="mt-3 text-xs text-[#667085]">
        {formatDayRange(nps.from, nps.to)}
      </p>

      {nps.score === null ? (
        <p className="mt-8 text-sm text-[#667085]">No NPS responses in the last 7 days.</p>
      ) : (
        <>
          <p className="mt-6 flex items-baseline gap-2.5">
            <span className="text-4xl font-bold tracking-tight text-[#101828]">{formatSigned(nps.score)}</span>
            <span className="text-xs text-[#667085]">
              {formatCount(nps.responses)} {nps.responses === 1 ? "response" : "responses"}
            </span>
          </p>

          <div className="mt-5 flex h-2 gap-0.5" aria-hidden="true">
            {NPS_GROUPS.filter((group) => nps[group.key] > 0).map((group) => (
              <span
                key={group.key}
                className="rounded-full"
                style={{ flexGrow: nps[group.key], backgroundColor: group.color }}
              />
            ))}
          </div>

          <dl className="mt-6 flex flex-col gap-4">
            {NPS_GROUPS.map((group) => (
              <div key={group.key} className="flex items-center justify-between text-sm">
                <dt className="flex items-center gap-2 text-[#667085]">
                  <span className="size-2 rounded-full" style={{ backgroundColor: group.color }} />
                  {group.label}
                </dt>
                <dd className="font-semibold text-[#101828]">{nps[group.key]}%</dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </section>
  );
}
