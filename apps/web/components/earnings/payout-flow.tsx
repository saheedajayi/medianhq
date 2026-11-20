"use client";

import { useState } from "react";
import type { PayoutAccount, RequestedPayout } from "@/services/earnings";
import { AddPayoutAccountModal } from "./add-payout-account-modal";
import { PayoutFailedModal, PayoutInitiatedModal } from "./payout-result-modals";
import { RequestPayoutModal } from "./request-payout-modal";

type Step = "request" | "account" | "failed";

interface PayoutFlowProps {
  account: PayoutAccount;
  amount: number;
  onClose: () => void;
}

/** The dialogs a payout goes through: confirm it, optionally change the account, then how it went */
export function PayoutFlow({ account, amount, onClose }: PayoutFlowProps) {
  const [step, setStep] = useState<Step>("request");
  const [payout, setPayout] = useState<RequestedPayout | null>(null);

  if (payout) return <PayoutInitiatedModal payout={payout} onClose={onClose} />;
  if (step === "account") return <AddPayoutAccountModal onClose={() => setStep("request")} />;
  if (step === "failed") return <PayoutFailedModal onClose={onClose} onRetry={() => setStep("request")} />;

  return (
    <RequestPayoutModal
      account={account}
      amount={amount}
      onClose={onClose}
      onChangeAccount={() => setStep("account")}
      onRequested={setPayout}
      onFailed={() => setStep("failed")}
    />
  );
}
