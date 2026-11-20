import type { PayoutAccount } from "@/services/earnings";
import { maskAccount, onDarkButtonClass } from "./earnings-utils";

interface PayoutAccountCardProps {
  account: PayoutAccount;
  onChange: () => void;
}

/** The bank account payouts are sent to */
export function PayoutAccountCard({ account, onChange }: PayoutAccountCardProps) {
  const details = [
    ["Account name", account.accountName],
    ["Account number", maskAccount(account.accountLastFour)],
    ["Bank", account.bankName],
  ];

  return (
    <section className="flex flex-col gap-5 rounded-3xl bg-[#4E0703] p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-base font-semibold text-white">Payout account details</h2>
        <dl className="mt-3.5 flex flex-wrap gap-x-12 gap-y-3">
          {details.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-white/80">{label}</dt>
              <dd className="mt-1.5 text-sm text-white">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <button type="button" onClick={onChange} className={onDarkButtonClass}>
        Change payout account
      </button>
    </section>
  );
}
