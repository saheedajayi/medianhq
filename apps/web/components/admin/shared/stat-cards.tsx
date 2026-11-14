import { cn } from "@/lib/utils";

interface Stat {
  label: string;
  value: string;
  note: string;
  /** A short status under the note, such as "On Time" */
  tag?: string;
}

interface StatCardsProps {
  stats: Stat[];
  className?: string;
}

/** The row of headline figures at the top of a finance or analytics tab */
export function StatCards({ stats, className }: StatCardsProps) {
  return (
    <section aria-label="Key figures" className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {stats.map((stat) => (
        <div key={stat.label} className={"flex flex-col gap-4 rounded-2xl border border-[#EAECF0] bg-[#FCFCFD] px-4 py-5"}>
          <span className="text-sm text-[#667085]">{stat.label}</span>
          <span className="text-2xl font-bold tracking-tight text-[#101828]">{stat.value}</span>
          <span className="text-xs text-[#667085]">{stat.note}</span>
          {stat.tag && <span className="text-xs text-[#067647]">{stat.tag}</span>}
        </div>
      ))}
    </section>
  );
}
