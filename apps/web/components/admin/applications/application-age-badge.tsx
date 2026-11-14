import type { AdminApplicationRow } from "@/services/admin/applications";
import { cn } from "@/lib/utils";
import { badgeClass } from "../shared/shared";
import { formatAge } from "./application-utils";

// The review target is 5 business days
const TARGET_DAYS = 5;

interface ApplicationAgeBadgeProps {
  application: AdminApplicationRow;
}

/** Red once a pending application reaches the review target, amber the day before */
export function ApplicationAgeBadge({ application }: ApplicationAgeBadgeProps) {
  const days = application.ageBusinessDays;
  const isPending = application.status === "PENDING_REVIEW";

  return (
    <span
      className={cn(
        badgeClass,
        isPending && days >= TARGET_DAYS
          ? "bg-[#FEF3F2] text-[#B42318]"
          : isPending && days === TARGET_DAYS - 1
            ? "bg-[#FFFAEB] text-[#B54708]"
            : "bg-[#F2F4F7] text-[#344054]",
      )}
    >
      {formatAge(days)}
    </span>
  );
}
