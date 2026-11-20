"use client";

import { useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/base/skeleton";
import type { Payout } from "@/services/earnings";
import {
  useMentorEarningsSummary,
  usePayoutAccount,
  usePayouts,
} from "@/services/earnings/queries/earnings.queries";
import { AddPayoutAccountBanner } from "./add-payout-account-banner";
import { AddPayoutAccountModal } from "./add-payout-account-modal";
import { EarningsLoadError } from "./earnings-load-error";
import { PayoutAccountCard } from "./payout-account-card";
import { PayoutFlow } from "./payout-flow";
import { PayoutHistoryTable } from "./payout-history-table";
import { PayoutStatementDrawer } from "./payout-statement-drawer";

export function PayoutDetailsView() {
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<Payout | null>(null);
  const [isChangingAccount, setIsChangingAccount] = useState(false);
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);

  const summaryQuery = useMentorEarningsSummary();
  const accountQuery = usePayoutAccount();
  const payoutsQuery = usePayouts(page);
  const { data: summary } = summaryQuery;
  const { data: account } = accountQuery;
  const availableBalance = summary?.availableBalance ?? 0;

  const failedQueries = [summaryQuery, accountQuery, payoutsQuery].filter((query) => query.isError && !query.data);

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Runs edge to edge across the top of the page, over the page's own padding */}
      <nav
        aria-label="Breadcrumb"
        className="-mx-5 -mt-5 flex items-center gap-3.5 border-b border-[#F2F4F7] px-5 py-4 text-sm font-medium sm:-mx-7 sm:-mt-7 sm:px-7 md:-mx-8 md:-mt-8 md:px-8"
      >
        <Link href="/mentor/earnings" className="text-[#344054]! hover:underline">
          Earnings
        </Link>
        <span aria-hidden="true" className="text-lg font-light text-[#D0D5DD]">
          /
        </span>
        <span aria-current="page" className="text-[#FF5514]">
          Payout details
        </span>
      </nav>

      <header className="mt-2">
        <h1 className="text-xl font-semibold text-[#101828]">Payout details</h1>
        <p className="mt-1 text-sm text-[#475467]">Manage your payout history and account details.</p>
      </header>

      {failedQueries.length > 0 ? (
        <EarningsLoadError
          message="We couldn't load your payout details. Please try again."
          isRetrying={failedQueries.some((query) => query.isFetching)}
          onRetry={() => failedQueries.forEach((query) => query.refetch())}
        />
      ) : (
        <>
          {account === undefined ? (
            <Skeleton className="h-[124px] rounded-3xl" />
          ) : account ? (
            <PayoutAccountCard account={account} onChange={() => setIsChangingAccount(true)} />
          ) : (
            <AddPayoutAccountBanner onAdd={() => setIsChangingAccount(true)} />
          )}

          <PayoutHistoryTable
            payouts={payoutsQuery.data}
            isFetching={payoutsQuery.isFetching}
            canRequestPayout={!!account && availableBalance > 0}
            onRequestPayout={() => setIsRequestingPayout(true)}
            onPageChange={setPage}
            onView={setViewing}
          />
        </>
      )}

      <PayoutStatementDrawer payout={viewing} onClose={() => setViewing(null)} />
      {isChangingAccount && <AddPayoutAccountModal onClose={() => setIsChangingAccount(false)} />}
      {isRequestingPayout && account && (
        <PayoutFlow account={account} amount={availableBalance} onClose={() => setIsRequestingPayout(false)} />
      )}
    </div>
  );
}
