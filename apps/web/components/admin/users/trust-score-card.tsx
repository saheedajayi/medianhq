import { ShieldTick } from "iconsax-react";
import type { AdminUserDetail } from "@/services/admin/users";
import { cn } from "@/lib/utils";
import { cardClass, cardTitleClass } from "../shared/shared";

const PART_LABEL = { reviews: "Reviews", attendance: "Attendance", responseRate: "Response rate" } as const;

interface TrustScoreCardProps {
  trustScore: AdminUserDetail["trustScoreDetail"];
}

export function TrustScoreCard({ trustScore }: TrustScoreCardProps) {
  return (
    <section className={cn(cardClass, "p-5")}>
      <div className="flex items-center justify-between gap-3">
        <h2 className={cardTitleClass}>Mentor Trust Score</h2>
        <ShieldTick size="20" variant="Outline" color="#079455" />
      </div>

      {trustScore ? (
        <>
          <p className="mt-5 flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight text-[#101828]">{trustScore.score}</span>
            <span className="text-sm text-[#667085]">/ 100 · {trustScore.label}</span>
          </p>

          <dl className="mt-5 flex flex-col gap-4">
            {trustScore.components.map((part) => (
              <div key={part.key}>
                <div className="flex items-center justify-between text-xs">
                  <dt className="text-[#667085]">
                    {PART_LABEL[part.key]} · {part.weight}% weight
                  </dt>
                  {/* A dash means there is nothing to measure yet, not a score of zero */}
                  <dd className="font-semibold text-[#101828]">{part.value ?? "—"}</dd>
                </div>
                <div className="mt-2 h-1 rounded-full bg-[#F2F4F7]" aria-hidden="true">
                  <div className="h-full rounded-full bg-[#079455]" style={{ width: `${part.value ?? 0}%` }} />
                </div>
              </div>
            ))}
          </dl>

          <p className="mt-5 text-xs leading-relaxed text-[#667085]">
            Weighted score: {trustScore.weighted}, rounded to {trustScore.score}.
          </p>
        </>
      ) : (
        <p className="mt-5 text-sm text-[#667085]">No score yet. It appears after the first review or booking.</p>
      )}
    </section>
  );
}
