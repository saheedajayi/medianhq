"use client";

import { useState } from "react";
import { Bank as BankIcon } from "iconsax-react";
import type { ApiError } from "@/services/api-client";
import type { PayoutAccount, RequestedPayout } from "@/services/earnings";
import { useRequestPayout } from "@/services/earnings/queries/earnings.queries";
import { cn } from "@/lib/utils";
import { EarningsModal, modalErrorClass, modalInputClass, modalLabelClass } from "./earnings-modal";
import { formatNaira, maskAccount, primaryButtonClass } from "./earnings-utils";

// The API answers a wrong password with 403, and too many tries with 429
const isPasswordError = (error: ApiError) => error.status === 403 || error.status === 429;

interface RequestPayoutModalProps {
  account: PayoutAccount;
  /** Everything available to withdraw; a payout always takes all of it */
  amount: number;
  onClose: () => void;
  onChangeAccount: () => void;
  onRequested: (payout: RequestedPayout) => void;
  /** The request was refused for a reason the mentor can't fix in this dialog */
  onFailed: () => void;
}

/** Confirms a payout: where it is going, and the mentor's password before it is requested */
export function RequestPayoutModal({
  account,
  amount,
  onClose,
  onChangeAccount,
  onRequested,
  onFailed,
}: RequestPayoutModalProps) {
  const [password, setPassword] = useState("");
  const requestPayout = useRequestPayout();
  const passwordError = requestPayout.error && isPasswordError(requestPayout.error) ? requestPayout.error : null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    requestPayout.mutate(password, {
      onSuccess: onRequested,
      onError: (error) => {
        if (!isPasswordError(error)) onFailed();
      },
    });
  };

  return (
    <EarningsModal
      isOpen
      onClose={onClose}
      title="Request Payout"
      description="All your earnings will be sent to your payout destination below."
    >
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="flex items-center gap-3 rounded-xl bg-[#F7F8FB] p-3.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white">
            <BankIcon size="24" variant="Outline" color="#FF5514" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[#101828]">{account.bankName}</p>
            <p className="mt-1 text-xs text-[#667085]">{maskAccount(account.accountLastFour)} · NGN account</p>
          </div>
          <button type="button" onClick={onChangeAccount} className="text-sm font-medium text-[#FF5514] hover:underline">
            Change
          </button>
        </div>

        <div className="mt-4">
          <label htmlFor="payout-password" className={modalLabelClass}>
            Password
          </label>
          <input
            id="payout-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter password"
            aria-invalid={!!passwordError}
            className={cn(modalInputClass, passwordError && "border-[#F04438] focus:border-[#F04438]")}
          />
          {passwordError && (
            <p role="alert" className={modalErrorClass}>
              {passwordError.message}
            </p>
          )}
        </div>

        <p className="mt-4 rounded-xl bg-[#F3F6FD] p-3.5 text-sm leading-5 text-[#3538CD]">
          NGN payout via Paystack. Arrives in 1–2 business days. For USD international payouts, switch to a
          Flutterwave-linked USD account (3–5 business days).
        </p>

        <button
          type="submit"
          disabled={requestPayout.isPending}
          className={cn(primaryButtonClass, "mt-10 w-full")}
        >
          {requestPayout.isPending ? "Requesting..." : `Withdraw ${formatNaira(amount)} now`}
        </button>
      </form>
    </EarningsModal>
  );
}
