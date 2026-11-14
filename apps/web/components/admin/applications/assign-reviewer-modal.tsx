"use client";

import { AdminModal } from "../shared/admin-modal";

const optionClass =
  "rounded-xl px-3.5 py-3 text-left text-sm font-medium transition-colors hover:bg-[#F9FAFB] disabled:opacity-60";

interface AssignReviewerModalProps {
  applicationCount: number;
  reviewers: { id: string; name: string }[];
  isSubmitting: boolean;
  onClose: () => void;
  /** Null removes the current reviewer */
  onAssign: (reviewerId: string | null) => void;
}

export function AssignReviewerModal({
  applicationCount,
  reviewers,
  isSubmitting,
  onClose,
  onAssign,
}: AssignReviewerModalProps) {
  return (
    <AdminModal
      isOpen
      onClose={onClose}
      title="Assign reviewer"
      description={`Choose who reviews the ${applicationCount} selected ${applicationCount === 1 ? "application" : "applications"}.`}
    >
      <div className="flex flex-col gap-2">
        {reviewers.map((reviewer) => (
          <button
            key={reviewer.id}
            type="button"
            disabled={isSubmitting}
            onClick={() => onAssign(reviewer.id)}
            className={`${optionClass} border border-[#EAECF0] text-[#101828]`}
          >
            {reviewer.name}
          </button>
        ))}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => onAssign(null)}
          className={`${optionClass} text-[#667085]`}
        >
          Remove reviewer
        </button>
      </div>
    </AdminModal>
  );
}
