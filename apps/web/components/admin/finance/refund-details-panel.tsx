"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { ApiError } from "@/services/api-client";
import type { FinanceRefund } from "@/services/admin/finance";
import {
  useApproveRefund,
  useRejectRefund,
  useRequestRefundInfo,
  useSaveRefundNote,
} from "@/services/admin/finance/queries/finance.queries";
import { cn } from "@/lib/utils";
import { useAdminAccess } from "../shared/admin-access";
import { formatClock, formatLongDate } from "../shared/format";
import { UserAvatar } from "../shared/shared";
import { formatAmount } from "./finance-utils";
import { RefundActionModal, type RefundAction } from "./refund-action-modal";
import { REFUND_STATUS, refundChipClass } from "./refund-utils";

const actionClass = "w-full rounded border py-2 text-xs transition-colors disabled:opacity-50";
const formatMoment = (iso: string) => `${formatLongDate(iso)} ${formatClock(iso)}`;
const showError = (error: ApiError) => toast.error(error.message || "That didn't work. Please try again.");

interface RefundDetailsPanelProps {
  refund: FinanceRefund;
}

/** One refund in full beside the table: what it is for, how far along it is, and the admin's actions */
export function RefundDetailsPanel({ refund }: RefundDetailsPanelProps) {
  const [note, setNote] = useState(refund.note ?? "");
  const [action, setAction] = useState<RefundAction | null>(null);
  const approveRefund = useApproveRefund();
  const rejectRefund = useRejectRefund();
  const requestInfo = useRequestRefundInfo();
  const saveNote = useSaveRefundNote();
  const { canWrite } = useAdminAccess();

  const status = REFUND_STATUS[refund.status];
  const isFailed = refund.status === "FAILED";
  const isOpen = isFailed || refund.status === "PENDING";
  const isEditable = canWrite("finance");

  // Filled dots are steps that have happened; the hollow one is what the refund is waiting on
  const timeline = [
    { label: "Refund Request Submitted", at: refund.requestedAt, color: "#067647" },
    ...(refund.infoRequestedAt
      ? [{ label: "More information requested", at: refund.infoRequestedAt, color: "#E04F16" }]
      : []),
    ...(refund.completedAt ? [{ label: "Refund Completed", at: refund.completedAt, color: "#067647" }] : []),
    ...(isFailed ? [{ label: "Refund Failed", at: null, color: "#F04438" }] : []),
    ...(refund.status === "REJECTED" ? [{ label: "Refund Rejected", at: refund.noteAt, color: "#475467" }] : []),
    ...(isOpen ? [{ label: "Awaiting Approval", at: null, color: null }] : []),
  ];

  const handleConfirm = (reason?: string) => {
    const onSuccess = () => {
      toast.success(action === "approve" ? "Refund sent to Paystack." : "Refund rejected and the mentee emailed.");
      setAction(null);
    };
    if (action === "approve") approveRefund.mutate(refund.id, { onSuccess, onError: showError });
    else rejectRefund.mutate({ paymentId: refund.id, reason }, { onSuccess, onError: showError });
  };

  const handleRequestInfo = () =>
    requestInfo.mutate(refund.id, {
      onSuccess: () => toast.success(`We emailed ${refund.user.name} asking for more information.`),
      onError: showError,
    });

  const handleSaveNote = () =>
    saveNote.mutate(
      { paymentId: refund.id, note },
      { onSuccess: () => toast.success("Note saved."), onError: showError },
    );

  return (
    <aside className="flex w-full flex-col gap-5 rounded-lg border border-[#EAECF0] p-2.5 xl:w-64">
      <h2 className="text-[15px] text-[#101828]">Refund Request Details</h2>

      <p className="flex items-center gap-6 text-[10px] text-[#475467]">
        <span className={cn(refundChipClass, "text-[8px]", status.className)}>{status.label}</span>
        <span className="truncate">{refund.id}</span>
      </p>

      <div className="flex items-center gap-2">
        <UserAvatar name={refund.user.name} avatarUrl={refund.user.avatarUrl} className="size-10" />
        <div>
          <p className="text-xs font-semibold text-[#101828]">{refund.user.name}</p>
          <p className="text-[8px] text-[#667085]">{refund.user.role}</p>
        </div>
      </div>

      <dl className="grid grid-cols-[88px_minmax(0,1fr)] gap-y-3 rounded border border-[#FFE8D4] bg-[#FFFAF5] p-2.5 text-[10px]">
        <dt className="text-[#667085]">Amount</dt>
        <dd className="font-medium text-[#101828]">{formatAmount(refund.amount)}</dd>
        <dt className="text-[#667085]">Type</dt>
        <dd className="font-medium text-[#101828]">Session</dd>
        <dt className="text-[#667085]">Reason</dt>
        <dd className="font-medium text-[#101828]">{refund.reason}</dd>
        <dt className="text-[#667085]">Requested at</dt>
        <dd className="font-medium text-[#101828]">{formatMoment(refund.requestedAt)}</dd>
      </dl>

      <div>
        <h3 className="text-[11px] text-[#101828]">Status Timeline</h3>
        <ol className="mt-3 flex flex-col gap-4">
          {timeline.map((step) => (
            <li key={step.label} className="flex gap-3 text-[9px]">
              <span
                className={cn("mt-0.5 size-1.5 shrink-0 rounded-full", !step.color && "border border-[#98A2B3]")}
                style={step.color ? { backgroundColor: step.color } : undefined}
              />
              <span className={step.color ? "text-[#101828]" : "text-[#667085]"}>
                {step.label}
                {step.at && <span className="block text-[#667085]">{formatMoment(step.at)}</span>}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {isEditable && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs text-[#101828]">Actions</h3>
          <button
            type="button"
            disabled={!isOpen}
            onClick={() => setAction("approve")}
            className={cn(actionClass, "border-[#FF5514] bg-[#FF5514] font-medium text-white")}
          >
            Approve Refund
          </button>
          <button
            type="button"
            disabled={!isFailed}
            onClick={() => setAction("reject")}
            className={cn(actionClass, "border-[#FDA29B] bg-[#FEF3F2] text-[#F04438]")}
          >
            Reject Refund
          </button>
          <button
            type="button"
            disabled={!isOpen || requestInfo.isPending}
            onClick={handleRequestInfo}
            className={cn(actionClass, "border-[#D0D5DD] bg-[#F9FAFB] text-[#475467]")}
          >
            {requestInfo.isPending ? "Sending..." : "Request More Information"}
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h3 className="text-xs text-[#101828]">Notes</h3>
        <label>
          <span className="sr-only">Note about this refund request</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            disabled={!isEditable}
            rows={4}
            maxLength={1000}
            placeholder="Add a note about this refund request"
            className="w-full rounded border border-[#D0D5DD] p-2 text-[10px] text-[#101828] outline-none placeholder:text-[#98A2B3] focus:border-[#FF5514] disabled:bg-[#F9FAFB]"
          />
        </label>
        {refund.noteAt && (
          <p className="text-[9px] text-[#667085]">
            Saved{refund.noteBy ? ` by ${refund.noteBy}` : ""} · {formatMoment(refund.noteAt)}
          </p>
        )}
        {isEditable && (
          <button
            type="button"
            disabled={!note.trim() || note.trim() === (refund.note ?? "") || saveNote.isPending}
            onClick={handleSaveNote}
            className={cn(actionClass, "border-[#98A2B3] bg-[#D0D5DD] text-[#344054]")}
          >
            {saveNote.isPending ? "Saving..." : "Save Note"}
          </button>
        )}
      </div>

      {action && (
        <RefundActionModal
          action={action}
          refund={refund}
          isSubmitting={approveRefund.isPending || rejectRefund.isPending}
          onClose={() => setAction(null)}
          onConfirm={handleConfirm}
        />
      )}
    </aside>
  );
}
