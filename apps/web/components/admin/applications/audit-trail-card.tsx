"use client";

import { ExportSquare } from "iconsax-react";
import type { AdminApplicationDetail } from "@/services/admin/applications";
import { downloadCsv } from "@/lib/csv";
import { cn } from "@/lib/utils";
import { formatDateTime } from "../shared/format";
import { cardClass, cardTitleClass, textButtonClass } from "../shared/shared";

const EVENT_LABEL: Record<string, string> = {
  APPLICATION_REVIEWER_ASSIGNED: "Reviewer assigned",
  APPLICATION_CHECKLIST_UPDATED: "Human checklist updated",
  APPLICATION_NOTE_SAVED: "Private note saved",
  APPLICATION_APPROVED: "Application approved",
  APPLICATION_REJECTED: "Application rejected",
};

interface AuditTrailCardProps {
  application: AdminApplicationDetail;
}

export function AuditTrailCard({ application }: AuditTrailCardProps) {
  const { auditTrail } = application;

  const handleExport = () =>
    downloadCsv(`median-application-${application.id}-audit.csv`, [
      ["When", "Event", "Detail", "Admin", "Application ID", "User ID"],
      ...auditTrail.map((event) => [
        event.at,
        EVENT_LABEL[event.action] ?? event.action,
        event.detail,
        event.adminName,
        application.id,
        application.userId,
      ]),
    ]);

  return (
    <section className={cn(cardClass, "p-5")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={cardTitleClass}>Audit trail</h2>
        <button
          type="button"
          onClick={handleExport}
          disabled={auditTrail.length === 0}
          className={cn(textButtonClass, "inline-flex items-center gap-2")}
        >
          <ExportSquare size="18" variant="Outline" color="#101828" />
          Export CSV
        </button>
      </div>

      <ul className="mt-4 flex flex-col gap-3">
        {auditTrail.map((event) => (
          <li key={event.id} className="rounded-xl bg-[#F9FAFB] p-3.5">
            <p className="text-xs font-semibold text-[#101828]">
              {[EVENT_LABEL[event.action] ?? event.action, event.detail].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-2 break-words text-xs text-[#667085]">
              {[event.adminName, application.id, application.userId].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-2 text-xs text-[#667085]">{formatDateTime(event.at)}</p>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-[#667085]">
        Submitted by {application.name} · {formatDateTime(application.submittedAt)}.
        {application.status === "PENDING_REVIEW" && " No decision recorded yet."}
      </p>
    </section>
  );
}
