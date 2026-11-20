"use client";

import { useState } from "react";
import type { Bank } from "@/services/earnings";
import { useResolvePayoutAccount, useSavePayoutAccount } from "@/services/earnings/queries/earnings.queries";
import { cn } from "@/lib/utils";
import { BankSelect } from "./bank-select";
import { EarningsModal, modalErrorClass, modalInputClass, modalLabelClass } from "./earnings-modal";
import { primaryButtonClass } from "./earnings-utils";

// Nigerian bank accounts are always ten digits
const ACCOUNT_NUMBER_LENGTH = 10;

// Scattered across the top of the "all set" dialog: [x, y, size, colour]
const CONFETTI: [number, number, number, string][] = [
  [6, 20, 5, "#4E0703"], [22, 8, 6, "#FF5514"], [14, 44, 5, "#FF5514"], [52, 4, 5, "#FF5514"],
  [70, 30, 4, "#4E0703"], [88, 10, 6, "#FF5514"], [96, 44, 5, "#FF5514"], [118, 22, 4, "#4E0703"],
  [134, 6, 6, "#FF5514"], [152, 34, 5, "#4E0703"], [170, 12, 5, "#FF5514"], [182, 46, 5, "#FF5514"],
  [200, 24, 4, "#4E0703"], [216, 6, 6, "#FF5514"], [236, 30, 5, "#FF5514"], [244, 12, 4, "#4E0703"],
];
// Where each of the three party hats sits
const HATS = [38, 122, 206];

function Confetti() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 256 56"
      className="pointer-events-none absolute top-0 left-1/2 h-14 w-64 -translate-x-1/2"
    >
      {CONFETTI.map(([x, y, size, fill]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={size} height={size} fill={fill} transform={`rotate(18 ${x} ${y})`} />
      ))}
      {HATS.map((x) => (
        <path key={x} d={`M${x} 24 l18 10 -14 6 z`} fill="#FF5514" stroke="#4E0703" strokeWidth="1" />
      ))}
    </svg>
  );
}

interface AddPayoutAccountModalProps {
  onClose: () => void;
}

/**
 * Saves the bank account payouts go to. The account's name is looked up at the
 * bank as soon as both fields are filled, and has to match the mentor's own.
 */
export function AddPayoutAccountModal({ onClose }: AddPayoutAccountModalProps) {
  const [bank, setBank] = useState<Bank | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const resolveAccount = useResolvePayoutAccount();
  const saveAccount = useSavePayoutAccount();

  const resolved = resolveAccount.data;
  const isMismatch = !!resolved && !resolved.isNameMatch;

  const lookUp = (nextBank: Bank | null, nextNumber: string) => {
    resolveAccount.reset();
    saveAccount.reset();
    if (nextBank && nextNumber.length === ACCOUNT_NUMBER_LENGTH) {
      resolveAccount.mutate({ bankCode: nextBank.code, accountNumber: nextNumber });
    }
  };

  const handleBankChange = (nextBank: Bank) => {
    setBank(nextBank);
    lookUp(nextBank, accountNumber);
  };

  const handleAccountNumberChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, ACCOUNT_NUMBER_LENGTH);
    setAccountNumber(digits);
    lookUp(bank, digits);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (bank && resolved?.isNameMatch) saveAccount.mutate({ bankCode: bank.code, accountNumber });
  };

  if (saveAccount.isSuccess) {
    return (
      <EarningsModal
        isOpen
        onClose={onClose}
        title="You’re all set!"
        description="This account is now saved for your payouts."
        decoration={<Confetti />}
      >
        <button type="button" onClick={onClose} className={cn(primaryButtonClass, "mt-12 w-full")}>
          Done
        </button>
      </EarningsModal>
    );
  }

  return (
    <EarningsModal
      isOpen
      onClose={onClose}
      title="Add payout account"
      description="Enter your bank account details. The account must be in your own name."
    >
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        <div>
          <label htmlFor="payout-bank" className={modalLabelClass}>
            Bank name
          </label>
          <BankSelect id="payout-bank" value={bank} onChange={handleBankChange} />
        </div>

        <div>
          <label htmlFor="payout-account-number" className={modalLabelClass}>
            Account number
          </label>
          <input
            id="payout-account-number"
            inputMode="numeric"
            autoComplete="off"
            value={accountNumber}
            onChange={(event) => handleAccountNumberChange(event.target.value)}
            placeholder="Enter account number"
            aria-invalid={resolveAccount.isError}
            className={modalInputClass}
          />
          {resolveAccount.isPending && <p className="mt-2 text-sm text-[#667085]">Checking account...</p>}
          {resolveAccount.isError && (
            <p role="alert" className={modalErrorClass}>
              {resolveAccount.error.message || "We couldn't check that account. Please try again."}
            </p>
          )}
        </div>

        {resolved && (
          <div>
            <label htmlFor="payout-account-name" className={modalLabelClass}>
              Account name
            </label>
            <input
              id="payout-account-name"
              readOnly
              value={resolved.accountName}
              aria-invalid={isMismatch}
              className={cn(modalInputClass, isMismatch && "border-[#F04438] focus:border-[#F04438]")}
            />
            {isMismatch && (
              <p role="alert" className={modalErrorClass}>
                This account name doesn&apos;t match your registered name “{resolved.registeredName}”. Enter your own
                bank account.
              </p>
            )}
          </div>
        )}

        {saveAccount.isError && (
          <p role="alert" className={cn(modalErrorClass, "mt-0")}>
            {saveAccount.error.message || "We couldn't save this account. Please try again."}
          </p>
        )}

        <button
          type="submit"
          disabled={!resolved?.isNameMatch || saveAccount.isPending}
          className={cn(primaryButtonClass, "mt-4 w-full")}
        >
          {saveAccount.isPending ? "Saving..." : "Add payout account details"}
        </button>
      </form>
    </EarningsModal>
  );
}
