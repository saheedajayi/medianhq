import type { AdminApplicationDetail } from "@/services/admin/applications";
import { cn } from "@/lib/utils";
import { formatDay } from "../shared/format";
import { badgeClass } from "../shared/shared";
import { APPLICATION_STATUS, formatAge } from "./application-utils";

interface ApplicationStatusBarProps {
  application: AdminApplicationDetail;
}

/** Status, age and reviewer in one line across the top of the review page */
export function ApplicationStatusBar({ application }: ApplicationStatusBarProps) {
  const status = APPLICATION_STATUS[application.status];
  // A pending application shows what it is working towards; a decided one, when it was decided
  const milestone =
    application.status === "PENDING_REVIEW"
      ? `Target: ${formatDay(application.reviewTarget)}`
      : application.decidedAt && `Decided ${formatDay(application.decidedAt)}`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#FFCAB6] bg-[#FFF6F2] px-4 py-3 text-sm">
      <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[#344054]">
        <span className={cn(badgeClass, status.className)}>{status.label}</span>
        {[
          `Submitted ${formatDay(application.submittedAt)}`,
          `${formatAge(application.ageBusinessDays, "business")} old`,
          milestone,
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>
      <span className="text-xs text-[#667085]">Reviewer: {application.reviewer?.name ?? "Unassigned"}</span>
    </div>
  );
}
