import type { ReactNode } from "react";
import { StatCards } from "../shared/stat-cards";

interface AnalyticsTabLayoutProps {
  stats: { label: string; value: string; note: string; tag?: string }[];
  /** The tab switcher, which sits between the headline figures and the tab's content */
  tabBar: ReactNode;
  children: ReactNode;
}

export function AnalyticsTabLayout({ stats, tabBar, children }: AnalyticsTabLayoutProps) {
  return (
    <div className="flex flex-col gap-6">
      <StatCards
        stats={stats}
        className={stats.length === 5 ? "xl:grid-cols-5" : stats.length === 3 ? "xl:grid-cols-3" : undefined}
      />
      {tabBar}
      {children}
    </div>
  );
}

export interface AnalyticsTabProps {
  tabBar: ReactNode;
}
