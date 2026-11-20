import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatNaira, onDarkButtonClass, primaryButtonClass } from "./earnings-utils";

interface BalanceCardProps {
  availableBalance: number;
  hasPayoutAccount: boolean;
  onRequestPayout: () => void;
}

/** What the mentor can withdraw right now, with the way to their payout details and to withdraw it */
export function BalanceCard({ availableBalance, hasPayoutAccount, onRequestPayout }: BalanceCardProps) {
  return (
    <section className="flex flex-col gap-5 rounded-3xl bg-[#4E0703] p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-sm text-white">Available to withdraw</h2>
        <p className="font-neco mt-2 text-[44px] leading-none font-bold text-white">{formatNaira(availableBalance)}</p>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {hasPayoutAccount ? (
          <Link href="/mentor/earnings/payout-details" className={onDarkButtonClass}>
            View payout details
          </Link>
        ) : (
          <button type="button" disabled className={onDarkButtonClass}>
            View payout details
          </button>
        )}
        <button
          type="button"
          disabled={!hasPayoutAccount || availableBalance <= 0}
          onClick={onRequestPayout}
          className={cn(primaryButtonClass)}
        >
          Request payout
        </button>
      </div>
    </section>
  );
}
