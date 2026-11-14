"use client";

import { useState } from "react";
import { TickCircle } from "iconsax-react";
import { toast } from "sonner";
import type { ApiError } from "@/services/api-client";
import type { AdminApplicationDetail } from "@/services/admin/applications";
import {
  useApproveApplication,
  useRejectApplication,
} from "@/services/admin/applications/queries/applications.queries";
import { dangerPillClass, primaryPillClass } from "../shared/shared";
import { DecisionModal, type ApplicationDecision } from "./decision-modal";

interface DecisionCardProps {
  application: AdminApplicationDetail;
}

export function DecisionCard({ application }: DecisionCardProps) {
  const [decision, setDecision] = useState<ApplicationDecision | null>(null);
  const approveApplication = useApproveApplication(application.id);
  const rejectApplication = useRejectApplication(application.id);
  // Accepting needs every check ticked; rejecting can happen at any point
  const isChecklistComplete = application.checksDone === application.checksTotal;

  const handleConfirm = (feedback?: string) => {
    const options = {
      onSuccess: () => {
        toast.success(
          decision === "approve"
            ? "Application approved and the applicant emailed."
            : "Application rejected and the applicant emailed.",
        );
        setDecision(null);
      },
      onError: (error: ApiError) => toast.error(error.message || "We couldn't save the decision."),
    };

    if (decision === "approve") approveApplication.mutate(undefined, options);
    else rejectApplication.mutate(feedback, options);
  };

  return (
    <section className="rounded-2xl border border-[#FFCAB6] bg-[#FFF9F6] p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-[#101828]">
        <TickCircle size="18" variant="Outline" color={isChecklistComplete ? "#079455" : "#98A2B3"} />
        {isChecklistComplete ? "Ready for a reviewer decision" : "Complete the checklist to accept"}
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!isChecklistComplete}
          onClick={() => setDecision("approve")}
          className={primaryPillClass}
        >
          Accept application...
        </button>
        <button type="button" onClick={() => setDecision("reject")} className={dangerPillClass}>
          Reject...
        </button>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[#667085]">
        A final confirmation shows the applicant and email recipient. The decision, reviewer and timestamp are logged;
        the applicant is then emailed.
      </p>

      {decision && (
        <DecisionModal
          decision={decision}
          applicantName={application.name}
          applicantEmail={application.email}
          isSubmitting={approveApplication.isPending || rejectApplication.isPending}
          onClose={() => setDecision(null)}
          onConfirm={handleConfirm}
        />
      )}
    </section>
  );
}
