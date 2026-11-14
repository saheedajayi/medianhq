"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { ApiError } from "@/services/api-client";
import type { FinancePayout, PayoutActionResult } from "@/services/admin/finance";
import {
  useApprovePayout,
  useRejectPayout,
  useSyncPayout,
} from "@/services/admin/finance/queries/finance.queries";
import { AdminModal } from "../shared/admin-modal";
import { formatDateTime } from "../shared/format";
import {
  DetailList,
  dangerPillClass,
  dangerSolidPillClass,
  neutralPillClass,
  primaryPillClass,
  textareaClass,
} from "../shared/shared";
import { formatAmount } from "./finance-utils";

type Step = "review" | "confirm-pay" | "confirm-reject";

const showError = (error: ApiError) => toast.error(error.message || "That didn't work. Please try again.");

interface PayoutReviewModalProps {
  payout: FinancePayout;
  /** Read-only admin types see the details but no actions */
  canAct: boolean;
  onClose: () => void;
}

/** A payout's details and what can be done with it; paying always needs a second confirmation */
export function PayoutReviewModal({ payout, canAct, onClose }: PayoutReviewModalProps) {
  const [step, setStep] = useState<Step>("review");
  const [reason, setReason] = useState("");
  const approvePayout = useApprovePayout();
  const rejectPayout = useRejectPayout();
  const syncPayout = useSyncPayout();
  const amount = `₦${formatAmount(payout.amount)}`;
  const bank = payout.bankName ?? `bank code ${payout.bankCode}`;
  const account = `${bank}, account ending ${payout.accountNumber.slice(-4)}`;
  const isSaving = approvePayout.isPending || rejectPayout.isPending || syncPayout.isPending;

  const handleResult = (result: PayoutActionResult) => {
    if (result.status === "FAILED") toast.error(result.failureReason ?? "Paystack couldn't send the payout.");
    else if (result.status === "PAID") toast.success(`${amount} paid to ${payout.mentor.name}.`);
    else if (result.status === "PROCESSING") toast.success("Sent to Paystack. It will update when the transfer settles.");
    else if (result.status === "REJECTED") toast.success("Payout rejected and the mentor emailed.");
    onClose();
  };

  if (step === "confirm-pay") {
    return (
      <AdminModal
        isOpen
        onClose={onClose}
        title={`Send ${amount}?`}
        description={`This pays ${payout.mentor.name} to ${account} through Paystack Transfers, from Median's Paystack balance. Once sent it can't be undone.`}
      >
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => setStep("review")} className={neutralPillClass}>
            Back
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => approvePayout.mutate(payout.id, { onSuccess: handleResult, onError: showError })}
            className={primaryPillClass}
          >
            {approvePayout.isPending ? "Sending..." : `Pay ${amount}`}
          </button>
        </div>
      </AdminModal>
    );
  }

  if (step === "confirm-reject") {
    return (
      <AdminModal
        isOpen
        onClose={onClose}
        title="Reject this payout?"
        description={`The ${amount} goes back to ${payout.mentor.name}'s available balance, and we'll email them.`}
      >
        <label className="flex flex-col gap-2 text-sm font-medium text-[#344054]">
          Note to the mentor (optional)
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            maxLength={1000}
            className={`${textareaClass} font-normal`}
          />
        </label>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => setStep("review")} className={neutralPillClass}>
            Back
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={() =>
              rejectPayout.mutate(
                { payoutId: payout.id, reason: reason.trim() || undefined },
                { onSuccess: handleResult, onError: showError },
              )
            }
            className={dangerSolidPillClass}
          >
            {rejectPayout.isPending ? "Saving..." : "Reject payout"}
          </button>
        </div>
      </AdminModal>
    );
  }

  return (
    <AdminModal isOpen onClose={onClose} title="Review payout" description={`${amount} requested by ${payout.mentor.name}.`}>
      <DetailList
        items={[
          ["Bank account", account],
          ["Requested", formatDateTime(payout.requestedAt)],
          ...(payout.paidAt ? ([["Paid", formatDateTime(payout.paidAt)]] as [string, string][]) : []),
          ...(payout.transferReference
            ? ([["Paystack reference", payout.transferReference]] as [string, string][])
            : []),
        ]}
      />
      {payout.failureReason && (
        <p className="rounded-xl bg-[#FEF3F2] px-3.5 py-3 text-sm text-[#B42318]">{payout.failureReason}</p>
      )}

      {canAct && payout.status === "PENDING" && (
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => setStep("confirm-reject")} className={dangerPillClass}>
            Reject
          </button>
          <button type="button" onClick={() => setStep("confirm-pay")} className={primaryPillClass}>
            Approve and pay
          </button>
        </div>
      )}
      {canAct && payout.status === "PROCESSING" && (
        <div className="flex justify-end">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => syncPayout.mutate(payout.id, { onSuccess: handleResult, onError: showError })}
            className={neutralPillClass}
          >
            {syncPayout.isPending ? "Checking..." : "Check status with Paystack"}
          </button>
        </div>
      )}
    </AdminModal>
  );
}
