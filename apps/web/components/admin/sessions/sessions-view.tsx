"use client";

import { useState } from "react";
import { ExportSquare } from "iconsax-react";
import { toast } from "sonner";
import { SegmentedTabs } from "@/components/ui/custom/segmented-tabs";
import { adminSessionsService } from "@/services/admin/sessions";
import { cn } from "@/lib/utils";
import { AdminPageHeader } from "../shared/admin-page-header";
import { outlineButtonClass } from "../shared/shared";
import { CompletedSessionsTab } from "./completed-sessions-tab";
import { LiveSessionsTab } from "./live-sessions-tab";
import { NoShowTrackerTab } from "./no-show-tracker-tab";
import { RecordingsTab } from "./recordings-tab";
import { exportSessions } from "./session-utils";
import { SessionsCalendar } from "./sessions-calendar";

const TABS = [
  { value: "live", label: "Live Sessions" },
  { value: "completed", label: "Completed Sessions" },
  { value: "recording", label: "Recording" },
  { value: "tracker", label: "Tracker" },
] as const;

// The calendar is opened from its own button, so it is a view with no tab of its own
type SessionsTab = (typeof TABS)[number]["value"] | "calendar";

export function SessionsView() {
  const [tab, setTab] = useState<SessionsTab>("live");
  const [isExporting, setIsExporting] = useState(false);
  const isCalendar = tab === "calendar";

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      const response = await adminSessionsService.exportCompleted({});
      exportSessions("median-sessions.csv", response.data);
    } catch {
      toast.error("We couldn't export the sessions. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-9">
      <AdminPageHeader
        title="Session Management"
        description="Monitor live sessions, review completed sessions, manage upcoming sessions and handle no shows"
      >
        <button type="button" onClick={handleExportAll} disabled={isExporting} className={outlineButtonClass}>
          <ExportSquare size="18" variant="Outline" color="#101828" />
          {isExporting ? "Exporting..." : "Export all CSV"}
        </button>
      </AdminPageHeader>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedTabs
          tabs={TABS}
          // No tab is highlighted while the calendar is open
          activeTab={isCalendar ? ("" as SessionsTab) : tab}
          onChange={setTab}
          size="lg"
        />
        <button
          type="button"
          onClick={() => setTab("calendar")}
          aria-pressed={isCalendar}
          className={cn(
            "rounded-full bg-[#FFE8D4] px-5 py-2 text-lg text-[#E84D12] transition-colors hover:bg-[#FFDDBF]",
            isCalendar && "font-semibold ring-1 ring-[#FFCAB6]",
          )}
        >
          Calendar
        </button>
      </div>

      {tab === "live" && <LiveSessionsTab />}
      {tab === "completed" && <CompletedSessionsTab />}
      {tab === "recording" && <RecordingsTab />}
      {tab === "tracker" && <NoShowTrackerTab />}
      {isCalendar && <SessionsCalendar />}
    </div>
  );
}
