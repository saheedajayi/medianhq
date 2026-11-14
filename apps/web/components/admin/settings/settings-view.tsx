"use client";

import { useState } from "react";
import { ExportSquare } from "iconsax-react";
import { SegmentedTabs } from "@/components/ui/custom/segmented-tabs";
import { AdminPageHeader } from "../shared/admin-page-header";
import { outlineButtonClass } from "../shared/shared";
import { exportAdminRoles } from "./admin-roles";
import { AdminRolesTab } from "./admin-roles-tab";
import { AdminsDashboardTab } from "./admins-dashboard-tab";

const TABS = [
  { value: "roles", label: "Admin Roles" },
  { value: "dashboard", label: "Admins Dashboard" },
] as const;

type SettingsTab = (typeof TABS)[number]["value"];

export function SettingsView() {
  const [tab, setTab] = useState<SettingsTab>("roles");

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Admin Roles & Permissions"
        description="Manage admin roles and control access across the platform."
      >
        <button type="button" onClick={exportAdminRoles} className={outlineButtonClass}>
          <ExportSquare size="18" variant="Outline" color="#101828" />
          Export all CSV
        </button>
      </AdminPageHeader>

      <SegmentedTabs tabs={TABS} activeTab={tab} onChange={setTab} size="lg" className="self-start" />

      {tab === "roles" ? <AdminRolesTab /> : <AdminsDashboardTab />}
    </div>
  );
}
