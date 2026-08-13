"use client";

interface StatItem {
  label: string;
  value: number | string;
  subtext: string;
}

interface DashboardStatsGridProps {
  stats?: StatItem[];
}

const defaultStats: StatItem[] = [
  { label: "SESSIONS DONE", value: 0, subtext: "0 this week" },
  { label: "SESSIONS BOOKED", value: 0, subtext: "0 this week" },
  { label: "ACTION ITEMS", value: 0, subtext: "0 this week" },
  { label: "MENTORS MATCHED", value: 0, subtext: "0 this week" },
];

export function DashboardStatsGrid({ stats = defaultStats }: DashboardStatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4 md:gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col justify-between rounded-2xl bg-white p-4 shadow-xs transition-shadow hover:shadow-md md:p-6"
        >
          <span className="text-[11px] font-semibold tracking-wider text-[#667085] uppercase md:text-xs">
            {stat.label}
          </span>

          <div className="my-2 text-3xl font-bold text-[#2C1810] font-[family-name:var(--font-neco)] md:my-3 md:text-4xl">
            {stat.value}
          </div>

          <span className="text-[11px] font-medium text-[#667085] md:text-xs">
            {stat.subtext}
          </span>
        </div>
      ))}
    </div>
  );
}
