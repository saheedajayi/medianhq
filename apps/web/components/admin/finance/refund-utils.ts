import type { FinanceRefund, RefundStatus } from "@/services/admin/finance";
import { downloadCsv } from "@/lib/csv";

export const REFUND_STATUS: Record<RefundStatus, { label: string; className: string }> = {
  COMPLETED: { label: "Completed", className: "bg-[#E7F4EE] text-[#067647]" },
  PENDING: { label: "Pending", className: "bg-[#FFEAD5] text-[#E04F16]" },
  FAILED: { label: "Failed", className: "bg-[#FEE4E2] text-[#F04438]" },
};

export const refundChipClass = "inline-block whitespace-nowrap rounded px-1.5 py-1 text-[10px]";

export function exportRefunds(refunds: FinanceRefund[]) {
  downloadCsv("median-refunds.csv", [
    ["Refund ID", "User", "Type", "Amount", "Reason", "Status", "Requested at", "Completed at"],
    ...refunds.map((refund) => [
      refund.id,
      refund.user.name,
      "Session",
      refund.amount,
      refund.reason,
      REFUND_STATUS[refund.status].label,
      refund.requestedAt,
      refund.completedAt,
    ]),
  ]);
}
