"use client";

import { useState } from "react";
import { ChangePasswordForm } from "@/features/auth/change-password-form";
import { SessionsManager } from "@/features/auth/sessions-manager";
import { SecurityAuditTrail } from "@/features/auth/security-audit-trail";

export default function SettingsPage() {
  const [auditRefreshKey, setAuditRefreshKey] = useState(0);

  function handleSessionsRevoked() {
    setAuditRefreshKey((prev) => prev + 1);
  }

  return (
    <section className="grid max-w-4xl gap-8 pb-12">
      <header>
        <h1 className="text-2xl font-semibold text-[#101828]">Settings</h1>
        <p className="mt-1 text-sm text-[#667085]">
          Manage your password, active sessions, and account security activity.
        </p>
      </header>

      <div className="grid gap-6">
        <ChangePasswordForm />
        <SessionsManager onRevoked={handleSessionsRevoked} />
        <SecurityAuditTrail refreshKey={auditRefreshKey} />
      </div>
    </section>
  );
}
