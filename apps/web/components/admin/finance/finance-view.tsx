"use client";

import { useState } from "react";
import { ExportSquare } from "iconsax-react";
import { toast } from "sonner";
import { SegmentedTabs } from "@/components/ui/custom/segmented-tabs";
import { adminFinanceService } from "@/services/admin/finance";
import { downloadCsv } from "@/lib/csv";
import { AdminPageHeader } from "../shared/admin-page-header";
import { outlineButtonClass } from "../shared/shared";
import { PayoutTab } from "./payout-tab";
import { RefundTrackerTab } from "./refund-tracker-tab";
import { exportRefunds } from "./refund-utils";
import { RevenueTab } from "./revenue-tab";
import { ServiceTab } from "./service-tab";

const TABS = [
  { value: "revenue", label: "Revenue" },
  { value: "payout", label: "Payout" },
  { value: "service", label: "Service" },
  { value: "tracker", label: "Tracker" },
] as const;

type FinanceTab = (typeof TABS)[number]["value"];

/** "Export all CSV" saves whatever the open tab is about */
const exportTab = async (tab: FinanceTab) => {
  if (tab === "tracker") return exportRefunds((await adminFinanceService.exportRefunds({})).data);

  if (tab === "payout") {
    const { data } = await adminFinanceService.exportPayouts({});
    return downloadCsv("median-payouts.csv", [
      ["Payout ID", "Mentor", "Bank code", "Amount", "Status", "Requested at"],
      ...data.map((payout) => [
        payout.id,
        payout.mentor.name,
        payout.bankCode,
        payout.amount,
        payout.status,
        payout.requestedAt,
      ]),
    ]);
  }

  if (tab === "service") {
    const { data } = await adminFinanceService.exportSessionCharges({});
    return downloadCsv("median-service-charges.csv", [
      ["Date", "Session ID", "Mentor", "Session fee", "Service charge"],
      ...data.map((charge) => [charge.date, charge.sessionId, charge.mentorName, charge.sessionFee, charge.serviceCharge]),
    ]);
  }

  const { data } = await adminFinanceService.getRevenue("monthly");
  downloadCsv("median-revenue.csv", [
    ["Period", "Session revenue", "Subscription revenue", "Total revenue", "Growth %"],
    ...data.series.map((bucket) => [
      bucket.label,
      bucket.sessionRevenue,
      bucket.subscriptionRevenue,
      bucket.totalRevenue,
      bucket.growthPct,
    ]),
  ]);
};

export function FinanceView() {
  const [tab, setTab] = useState<FinanceTab>("revenue");
  const [isExporting, setIsExporting] = useState(false);

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      await exportTab(tab);
    } catch {
      toast.error("We couldn't export the report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Financial Report"
        description="Track your platform earning from sessions and subscriptions."
      >
        <button type="button" onClick={handleExportAll} disabled={isExporting} className={outlineButtonClass}>
          <ExportSquare size="18" variant="Outline" color="#101828" />
          {isExporting ? "Exporting..." : "Export all CSV"}
        </button>
      </AdminPageHeader>

      <SegmentedTabs tabs={TABS} activeTab={tab} onChange={setTab} size="lg" className="self-start" />

      {tab === "revenue" && <RevenueTab />}
      {tab === "payout" && <PayoutTab />}
      {tab === "service" && <ServiceTab />}
      {tab === "tracker" && <RefundTrackerTab />}
    </div>
  );
}
