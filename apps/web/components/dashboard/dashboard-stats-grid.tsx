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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col justify-between rounded-2xl bg-white p-5 shadow-xs transition-shadow hover:shadow-md md:p-6"
        >
          <span className="text-xs font-semibold tracking-wider text-[#667085] uppercase">
            {stat.label}
          </span>

          <div className="my-3 text-4xl font-bold text-[#2C1810] font-[family-name:var(--font-neco)]">
            {stat.value}
          </div>

          <span className="text-xs font-medium text-[#667085]">
            {stat.subtext}
          </span>
        </div>
      ))}
    </div>
  );
}
