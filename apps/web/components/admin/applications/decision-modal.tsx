"use client";

import { useState } from "react";
import { AdminModal } from "../shared/admin-modal";
import { dangerSolidPillClass, neutralPillClass, primaryPillClass, textareaClass } from "../shared/shared";

export type ApplicationDecision = "approve" | "reject";

interface DecisionModalProps {
  decision: ApplicationDecision;
  applicantName: string;
  applicantEmail: string;
  isSubmitting: boolean;
  onClose: () => void;
  /** The feedback is only collected when rejecting */
  onConfirm: (feedback?: string) => void;
}

/** The final confirmation before a decision is saved and the applicant emailed */
export function DecisionModal({
  decision,
  applicantName,
  applicantEmail,
  isSubmitting,
  onClose,
  onConfirm,
}: DecisionModalProps) {
  const [feedback, setFeedback] = useState("");
  const isApproval = decision === "approve";

  return (
    <AdminModal
      isOpen
      onClose={onClose}
      title={isApproval ? "Accept this application?" : "Reject this application?"}
      description={`${
        isApproval
          ? `${applicantName} becomes an approved mentor and is visible to mentees.`
          : `${applicantName} will be told their application was not approved.`
      } The decision email goes to ${applicantEmail}.`}
    >
      {!isApproval && (
        <label className="flex flex-col gap-2 text-sm font-medium text-[#344054]">
          Feedback to include in the email (optional)
          <textarea
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            rows={3}
            maxLength={500}
            className={`${textareaClass} font-normal`}
          />
        </label>
      )}

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className={neutralPillClass}>
          Cancel
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => onConfirm(feedback.trim() || undefined)}
          className={isApproval ? primaryPillClass : dangerSolidPillClass}
        >
          {isSubmitting ? "Saving..." : isApproval ? "Accept and email" : "Reject and email"}
        </button>
      </div>
    </AdminModal>
  );
}
