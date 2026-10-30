"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SegmentedTabs } from "@/components/ui/custom/segmented-tabs";
import { AccountTab } from "./account-tab";
import { CalendarTab } from "./calendar-tab";
import { NotificationsTab } from "./notifications-tab";
import { SecurityTab } from "./security-tab";

const TABS = [
  { value: "account", label: "Account" },
  { value: "security", label: "Security" },
  { value: "calendar", label: "Calendar" },
  { value: "notifications", label: "Notifications" },
] as const;

type SettingsTab = (typeof TABS)[number]["value"];

export function MenteeSettingsView() {
  const router = useRouter();
  const tabParam = useSearchParams().get("tab");
  const activeTab: SettingsTab = TABS.some((tab) => tab.value === tabParam)
    ? (tabParam as SettingsTab)
    : "account";

  return (
    <section className="mx-auto flex w-full max-w-[640px] flex-col gap-6 pb-12">
      <header>
        <h1 className="text-xl font-semibold text-[#101828]">Settings</h1>
        <p className="mt-0.5 text-sm text-[#475467]">
          Manage your account, security, calendar and notifications.
        </p>
      </header>

      <div className="overflow-x-auto">
        <SegmentedTabs
          tabs={TABS}
          activeTab={activeTab}
          onChange={(tab) => router.replace(`/settings?tab=${tab}`, { scroll: false })}
          size="lg"
          className="border-0"
          tabClassName="whitespace-nowrap font-normal"
        />
      </div>

      {activeTab === "account" && <AccountTab />}
      {activeTab === "security" && <SecurityTab />}
      {activeTab === "calendar" && <CalendarTab />}
      {activeTab === "notifications" && <NotificationsTab />}
    </section>
  );
}
