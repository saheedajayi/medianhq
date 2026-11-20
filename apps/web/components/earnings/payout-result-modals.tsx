"use client";

import type { RequestedPayout } from "@/services/earnings";
import { formatDateTime } from "@/components/admin/shared/format";
import { cn } from "@/lib/utils";
import { EarningsModal } from "./earnings-modal";
import { formatNaira, maskAccount, primaryButtonClass } from "./earnings-utils";

const EXPECTED_ARRIVAL = "1–2 business days";

/** Saves the payout's details as a text file the mentor can keep */
function downloadReceipt(payout: RequestedPayout) {
  const lines = [
    "Median payout receipt",
    "",
    `Reference: ${payout.reference}`,
    `Amount: ${formatNaira(payout.amount)}`,
    `Destination: ${payout.bankName} ${maskAccount(payout.accountLastFour)}`,
    `Requested: ${formatDateTime(payout.requestedAt)}`,
    `Expected arrival: ${EXPECTED_ARRIVAL}`,
  ];
  const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${payout.reference}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

interface PayoutInitiatedModalProps {
  payout: RequestedPayout;
  onClose: () => void;
}

export function PayoutInitiatedModal({ payout, onClose }: PayoutInitiatedModalProps) {
  return (
    <EarningsModal
      isOpen
      onClose={onClose}
      title="Payout initiated"
      description={`Your payout of ${formatNaira(payout.amount)} is on its way to your ${payout.bankName} account.`}
    >
      <dl className="mt-6 flex flex-col gap-3 rounded-xl bg-[#F7F8FB] p-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-[#475467]">Reference</dt>
          <dd className="text-[#101828]">{payout.reference}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[#475467]">Expected arrival</dt>
          <dd className="text-[#101828]">{EXPECTED_ARRIVAL}</dd>
        </div>
      </dl>
      <button type="button" onClick={() => downloadReceipt(payout)} className={cn(primaryButtonClass, "mt-10 w-full")}>
        Download payout receipt
      </button>
    </EarningsModal>
  );
}

interface PayoutFailedModalProps {
  onClose: () => void;
  onRetry: () => void;
}

export function PayoutFailedModal({ onClose, onRetry }: PayoutFailedModalProps) {
  return (
    <EarningsModal
      isOpen
      onClose={onClose}
      title="Payout couldn’t be started"
      description="Please reach out to your destination bank to resolve it."
    >
      <button type="button" onClick={onRetry} className={cn(primaryButtonClass, "mt-12 w-full")}>
        Retry payout
      </button>
    </EarningsModal>
  );
}
