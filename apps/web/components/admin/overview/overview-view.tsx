"use client";

import { useState } from "react";
import { ExportSquare } from "iconsax-react";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import type { AdminOverviewRange } from "@/services/admin/overview";
import { useAdminOverview } from "@/services/admin/overview/queries/overview.queries";
import { AdminPageHeader } from "../shared/admin-page-header";
import { outlineButtonClass } from "../shared/shared";
import { AlertsCard } from "./alerts-card";
import { OverviewSkeleton } from "./overview-skeleton";
import { OverviewStats } from "./overview-stats";
import { exportSnapshot } from "./overview-utils";
import { PlatformActivityCard } from "./platform-activity-card";
import { SystemHealthCard } from "./system-health-card";
import { WeeklyNpsCard } from "./weekly-nps-card";

const twoColumnClass = "grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]";

export function OverviewView() {
  const [range, setRange] = useState<AdminOverviewRange>("7d");
  const { data: overview, isError, isFetching, refetch } = useAdminOverview(range);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Platform overview"
        description="A clear view of platform activity, community trust and operational health."
      >
        <button
          type="button"
          disabled={!overview}
          onClick={() => overview && exportSnapshot(overview)}
          className={outlineButtonClass}
        >
          <ExportSquare size="18" variant="Outline" color="#101828" />
          Export snapshot
        </button>
      </AdminPageHeader>

      {overview ? (
        <>
          <OverviewStats stats={overview.stats} />

          <div className={twoColumnClass}>
            <PlatformActivityCard activity={overview.activity} range={range} onRangeChange={setRange} />
            <WeeklyNpsCard nps={overview.nps} />
          </div>

          <div className={twoColumnClass}>
            <AlertsCard alerts={overview.alerts} generatedAt={overview.generatedAt} />
            <SystemHealthCard systemHealth={overview.systemHealth} />
          </div>
        </>
      ) : isError ? (
        <DashboardErrorState onRetry={() => refetch()} isRetrying={isFetching} />
      ) : (
        <OverviewSkeleton />
      )}
    </div>
  );
}
