import type { MentorEarningsSummary } from "@/services/earnings";
import { cn } from "@/lib/utils";
import { formatClearsIn, formatMonth, formatNaira } from "./earnings-utils";

interface EarningsStatCardsProps {
  summary: MentorEarningsSummary;
}

type Stat = {
  label: string;
  amount: number;
  note?: string | null;
  /** Notes about something still in progress sit in a pill */
  isNotePill?: boolean;
};

/** The four figures beside the balance: what is clearing, expected, earned in all, and held */
export function EarningsStatCards({ summary }: EarningsStatCardsProps) {
  const stats: Stat[] = [
    {
      label: "Pending Clearance",
      amount: summary.pendingClearance,
      note: summary.nextClearanceAt && formatClearsIn(summary.nextClearanceAt),
      isNotePill: true,
    },
    { label: "Projected this month", amount: summary.projectedThisMonth, note: "Based on booked sessions" },
    {
      label: "All time earnings",
      amount: summary.totalEarned,
      note: summary.firstEarningAt && `Since ${formatMonth(summary.firstEarningAt)}`,
    },
    { label: "Dispute/held", amount: summary.heldOnDispute, note: "Awaiting resolution", isNotePill: true },
  ];

  return (
    <section
      aria-label="Earnings summary"
      className="grid grid-cols-1 gap-4 rounded-3xl bg-cover bg-center p-4 sm:grid-cols-2 xl:grid-cols-4"
      style={{ backgroundImage: "url('/sessions/session-stats-pattern.png')", backgroundColor: "#4E0703" }}
    >
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col rounded-2xl border border-[#FFE8D4] bg-[#FFFAF5] p-4">
          <h3 className="text-sm text-[#101828]">{stat.label}</h3>
          <p className="font-neco mt-6 text-[28px] leading-8 font-bold text-[#4E0703]">
            {/* An empty figure reads as a plain 0, as in the design */}
            {stat.amount > 0 ? formatNaira(stat.amount) : "0"}
          </p>
          {stat.amount > 0 && stat.note && (
            <p
              className={cn(
                "mt-1.5 self-start text-xs text-[#7A2E0E]",
                stat.isNotePill && "rounded-full bg-[#FFEEE8] px-3 py-1",
              )}
            >
              {stat.note}
            </p>
          )}
        </div>
      ))}
    </section>
  );
}
