import type { ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { Skeleton, SkeletonGroup } from "@/components/ui/base/skeleton";
import type { ApiError } from "@/services/api-client";
import type { AnalyticsStat } from "@/services/admin/analytics";
import { cn } from "@/lib/utils";
import { formatCount } from "../shared/format";

export const analyticsTitleClass = "text-xl font-semibold text-[#475467]";
export const analyticsSubtitleClass = "mt-1 text-xs text-[#475467]";

/** "+12% vs previous 7 days", or a plain note when there is no earlier figure to compare with */
export const formatChange = (changePct: number | null) =>
  changePct === null ? "No earlier data to compare" : `${changePct > 0 ? "+" : ""}${changePct}% vs previous 7 days`;

export const statCard = (label: string, stat: AnalyticsStat) => ({
  label,
  value: formatCount(stat.value),
  note: formatChange(stat.changePct),
});

/** "2h 18m", or "45m" under an hour */
export function formatDuration(minutes: number | null) {
  if (minutes === null) return "—";
  const hours = Math.floor(minutes / 60);
  return hours ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}

interface AnalyticsCardProps {
  title?: string;
  subtitle?: string;
  /** Shown opposite the title, such as a chart's legend */
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function AnalyticsCard({ title, subtitle, aside, className, children }: AnalyticsCardProps) {
  return (
    <section className={cn("rounded-2xl border border-[#EAECF0] bg-white p-4", className)}>
      {(title || aside) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className={analyticsTitleClass}>{title}</h2>}
            {subtitle && <p className={analyticsSubtitleClass}>{subtitle}</p>}
          </div>
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

interface LegendProps {
  items: { label: string; color: string }[];
}

export function Legend({ items }: LegendProps) {
  return (
    <ul className="flex flex-wrap gap-3 text-xs text-[#475467]">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

interface ProgressBarProps {
  /** 0 to 100 */
  pct: number;
  color: string;
  className?: string;
}

export function ProgressBar({ pct, color, className }: ProgressBarProps) {
  return (
    <div className={cn("h-2 rounded-full bg-[#F2F4F7]", className)} aria-hidden="true">
      <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }} />
    </div>
  );
}

interface AnalyticsTabStateProps<T> {
  query: UseQueryResult<T, ApiError>;
  /** Rendered once the tab's data has loaded */
  children: (data: T) => ReactNode;
}

/** Shows a tab's loading and error states, so each tab only describes its loaded content */
export function AnalyticsTabState<T>({ query, children }: AnalyticsTabStateProps<T>) {
  if (query.data) return <>{children(query.data)}</>;
  if (query.isError) return <DashboardErrorState onRetry={() => query.refetch()} isRetrying={query.isFetching} />;
  return (
    <SkeletonGroup label="Loading analytics" className="flex flex-col gap-4">
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="h-96 w-full rounded-2xl" />
    </SkeletonGroup>
  );
}
