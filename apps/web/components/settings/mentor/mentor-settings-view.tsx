"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SegmentedTabs } from "@/components/ui/custom/segmented-tabs";
import { AccountTab } from "../mentee/account-tab";
import { CalendarTab } from "../mentee/calendar-tab";
import { NotificationsTab } from "../mentee/notifications-tab";
import { SecurityTab } from "../mentee/security-tab";
import { PayoutsTab } from "./payouts-tab";

const TABS = [
  { value: "account", label: "Account" },
  { value: "security", label: "Security" },
  { value: "calendar", label: "Calendar" },
  { value: "payouts", label: "Payouts" },
  { value: "notifications", label: "Notifications" },
] as const;

type SettingsTab = (typeof TABS)[number]["value"];

/** A mentor's settings: the mentee tabs they share, plus payouts */
export function MentorSettingsView() {
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
          Manage your account, security, calendar, payouts and notifications.
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

      {activeTab === "account" && <AccountTab withGoals={false} />}
      {activeTab === "security" && <SecurityTab />}
      {activeTab === "calendar" && <CalendarTab />}
      {activeTab === "payouts" && <PayoutsTab />}
      {activeTab === "notifications" && <NotificationsTab />}
    </section>
  );
}
