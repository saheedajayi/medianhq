"use client";

import { useState } from "react";
import { ExportSquare } from "iconsax-react";
import { toast } from "sonner";
import { SegmentedTabs } from "@/components/ui/custom/segmented-tabs";
import { adminAnalyticsService } from "@/services/admin/analytics";
import { downloadCsv } from "@/lib/csv";
import { AdminPageHeader } from "../shared/admin-page-header";
import { outlineButtonClass } from "../shared/shared";
import { ActivityTab } from "./activity-tab";
import { DemandRatioTab } from "./demand-ratio-tab";
import { FillRateTab } from "./fill-rate-tab";
import { FunnelTab } from "./funnel-tab";
import { PerformanceTab } from "./performance-tab";
import { ResponseMetricsTab } from "./response-metrics-tab";
import { VisitorsTab } from "./visitors-tab";

const TABS = [
  { value: "funnel", label: "Analytics", component: FunnelTab },
  { value: "demand", label: "Demand Ratio", component: DemandRatioTab },
  { value: "fill", label: "Fill Rate", component: FillRateTab },
  { value: "performance", label: "Performance", component: PerformanceTab },
  { value: "metrics", label: "Metrics", component: ResponseMetricsTab },
  { value: "activity", label: "Activity", component: ActivityTab },
  { value: "visitors", label: "Visitors", component: VisitorsTab },
] as const;

type AnalyticsTab = (typeof TABS)[number]["value"];

/** Saves the funnel, the headline analytics, as one CSV */
const exportFunnel = async () => {
  const { data } = await adminAnalyticsService.getFunnel();
  downloadCsv("median-user-analytics.csv", [
    ["Day", "Sign ups", "Goal set up", "First search", "First booking", "First session"],
    ...data.series.map((day) => [
      day.label,
      day.signUps,
      day.goalSetups,
      day.firstSearches,
      day.firstBookings,
      day.firstSessions,
    ]),
  ]);
};

export function AnalyticsView() {
  const [tab, setTab] = useState<AnalyticsTab>("funnel");
  const [isExporting, setIsExporting] = useState(false);
  const ActiveTab = TABS.find((option) => option.value === tab)!.component;

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      await exportFunnel();
    } catch {
      toast.error("We couldn't export the analytics. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Each tab shows its own headline figures above the switcher, so it places the switcher itself
  const tabBar = (
    <div className="max-w-full overflow-x-auto">
      <SegmentedTabs tabs={TABS} activeTab={tab} onChange={setTab} size="lg" tabClassName="whitespace-nowrap" />
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="User Analytics"
        description="Track how user move through to the platform and how well they retain over time."
      >
        <button type="button" onClick={handleExportAll} disabled={isExporting} className={outlineButtonClass}>
          <ExportSquare size="18" variant="Outline" color="#101828" />
          {isExporting ? "Exporting..." : "Export all CSV"}
        </button>
      </AdminPageHeader>

      <ActiveTab tabBar={tabBar} />
    </div>
  );
}
