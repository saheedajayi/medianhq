"use client";

import { useState } from "react";
import type { FinanceRefund } from "@/services/admin/finance";
import { cn } from "@/lib/utils";
import { formatClock, formatLongDate } from "../shared/format";
import { UserAvatar } from "../shared/shared";
import { formatAmount, notifyNotConnected } from "./finance-utils";
import { REFUND_STATUS, refundChipClass } from "./refund-utils";

const actionClass = "w-full rounded border py-2 text-xs transition-colors";
const formatMoment = (iso: string) => `${formatLongDate(iso)} ${formatClock(iso)}`;

interface RefundDetailsPanelProps {
  refund: FinanceRefund;
}

/** One refund in full beside the table: what it is for, how far along it is, and the admin's actions */
export function RefundDetailsPanel({ refund }: RefundDetailsPanelProps) {
  const [note, setNote] = useState("");
  const status = REFUND_STATUS[refund.status];
  const isOpen = refund.status === "PENDING";

  // Filled dots are steps that have happened; the hollow one is what the refund is waiting on
  const timeline = [
    { label: "Refund Request Submitted", at: refund.requestedAt, color: "#067647" },
    ...(refund.completedAt ? [{ label: "Refund Completed", at: refund.completedAt, color: "#067647" }] : []),
    ...(refund.status === "FAILED" ? [{ label: "Refund Failed", at: null, color: "#F04438" }] : []),
    ...(isOpen ? [{ label: "Awaiting Approval", at: null, color: null }] : []),
  ];

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

      <div className="flex flex-col gap-2">
        <h3 className="text-xs text-[#101828]">Actions</h3>
        <button
          type="button"
          disabled={!isOpen}
          onClick={() => notifyNotConnected("Approving a refund")}
          className={cn(actionClass, "border-[#FF5514] bg-[#FF5514] font-medium text-white disabled:opacity-50")}
        >
          Approve Refund
        </button>
        <button
          type="button"
          disabled={!isOpen}
          onClick={() => notifyNotConnected("Rejecting a refund")}
          className={cn(actionClass, "border-[#FDA29B] bg-[#FEF3F2] text-[#F04438] disabled:opacity-50")}
        >
          Reject Refund
        </button>
        <button
          type="button"
          disabled={!isOpen}
          onClick={() => notifyNotConnected("Requesting more information")}
          className={cn(actionClass, "border-[#D0D5DD] bg-[#F9FAFB] text-[#98A2B3]")}
        >
          Request More Information
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-xs text-[#101828]">Notes</h3>
        <label>
          <span className="sr-only">Note about this refund request</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={4}
            placeholder="Add a note about this refund request"
            className="w-full rounded border border-[#D0D5DD] p-2 text-[10px] text-[#101828] outline-none placeholder:text-[#98A2B3] focus:border-[#FF5514]"
          />
        </label>
        <button
          type="button"
          disabled={!note.trim()}
          onClick={() => notifyNotConnected("Saving a note")}
          className={cn(actionClass, "border-[#98A2B3] bg-[#D0D5DD] text-[#667085]")}
        >
          Save Note
        </button>
      </div>
    </aside>
  );
}
