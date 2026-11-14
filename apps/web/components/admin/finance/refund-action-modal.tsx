"use client";

import { useState } from "react";
import type { FinanceRefund } from "@/services/admin/finance";
import { AdminModal } from "../shared/admin-modal";
import { dangerSolidPillClass, neutralPillClass, primaryPillClass, textareaClass } from "../shared/shared";
import { formatAmount } from "./finance-utils";

export type RefundAction = "approve" | "reject";

interface RefundActionModalProps {
  action: RefundAction;
  refund: FinanceRefund;
  isSubmitting: boolean;
  onClose: () => void;
  /** The reason is only collected when rejecting */
  onConfirm: (reason?: string) => void;
}

/** The confirmation before money is sent back to a mentee, or a refund is closed without paying */
export function RefundActionModal({ action, refund, isSubmitting, onClose, onConfirm }: RefundActionModalProps) {
  const [reason, setReason] = useState("");
  const amount = `₦${formatAmount(refund.amount)}`;
  const isApproval = action === "approve";

  const description = isApproval
    ? refund.status === "FAILED"
      ? `This sends ${amount} back to ${refund.user.name} through Paystack. Once Paystack accepts it, it can't be undone.`
      : `Paystack hasn't finished this refund of ${amount} yet. This checks its latest status.`
    : `${refund.user.name} won't get the ${amount} back, and we'll email them to say so.`;

  return (
    <AdminModal
      isOpen
      onClose={onClose}
      title={isApproval ? "Approve this refund?" : "Reject this refund?"}
      description={description}
    >
      {!isApproval && (
        <label className="flex flex-col gap-2 text-sm font-medium text-[#344054]">
          Reason, included in the email (optional)
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            maxLength={1000}
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
          onClick={() => onConfirm(reason.trim() || undefined)}
          className={isApproval ? primaryPillClass : dangerSolidPillClass}
        >
          {isSubmitting ? "Saving..." : isApproval ? "Approve refund" : "Reject refund"}
        </button>
      </div>
    </AdminModal>
  );
}
