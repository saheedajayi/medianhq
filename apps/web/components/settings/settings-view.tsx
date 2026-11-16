"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChangePasswordForm } from "@/features/auth/change-password-form";
import { SessionsManager } from "@/features/auth/sessions-manager";
import { SecurityAuditTrail } from "@/features/auth/security-audit-trail";
import { NotificationsTab } from "./mentee/notifications-tab";

export function SettingsView() {
  const [auditRefreshKey, setAuditRefreshKey] = useState(0);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const wantsNotifications = useSearchParams().get("tab") === "notifications";

  // Email links open /settings?tab=notifications, so bring that card into view
  useEffect(() => {
    if (wantsNotifications) notificationsRef.current?.scrollIntoView({ block: "start" });
  }, [wantsNotifications]);

  function handleSessionsRevoked() {
    setAuditRefreshKey((prev) => prev + 1);
  }

  return (
    <section className="grid max-w-4xl gap-8 pb-12">
      <header>
        <h1 className="text-2xl font-semibold text-[#101828]">Settings</h1>
        <p className="mt-1 text-sm text-[#667085]">
          Manage your password, active sessions, notifications and account security activity.
        </p>
      </header>

      <div className="grid gap-6">
        <ChangePasswordForm />
        <SessionsManager onRevoked={handleSessionsRevoked} />
        <div ref={notificationsRef} className="scroll-mt-6">
          <NotificationsTab />
        </div>
        <SecurityAuditTrail refreshKey={auditRefreshKey} />
      </div>
    </section>
  );
}
