"use client";

import { useState } from "react";
import { Skeleton, SkeletonGroup } from "@/components/ui/base/skeleton";
import type { SessionEarning } from "@/services/earnings";
import {
  useMentorEarningsSummary,
  usePayoutAccount,
  useSessionEarnings,
} from "@/services/earnings/queries/earnings.queries";
import { AddPayoutAccountBanner } from "./add-payout-account-banner";
import { AddPayoutAccountModal } from "./add-payout-account-modal";
import { BalanceCard } from "./balance-card";
import { EarningDetailsDrawer } from "./earning-details-drawer";
import { EarningsLoadError } from "./earnings-load-error";
import { EarningsStatCards } from "./earnings-stat-cards";
import { EarningsTable } from "./earnings-table";
import { PayoutFlow } from "./payout-flow";

export function EarningsView() {
  const [page, setPage] = useState(1);
  const [isShowingAll, setIsShowingAll] = useState(false);
  const [viewing, setViewing] = useState<SessionEarning | null>(null);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);

  const summaryQuery = useMentorEarningsSummary();
  const accountQuery = usePayoutAccount();
  const earningsQuery = useSessionEarnings(page, isShowingAll ? "all" : undefined);
  const { data: summary } = summaryQuery;
  const { data: account } = accountQuery;

  const failedQueries = [summaryQuery, accountQuery, earningsQuery].filter((query) => query.isError && !query.data);

  const handleShowAll = () => {
    setIsShowingAll(true);
    setPage(1);
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <header>
        <h1 className="text-xl font-semibold text-[#101828]">Earnings</h1>
        <p className="mt-1 text-sm text-[#475467]">Track your income, manage payouts, and view earnings history.</p>
      </header>

      {failedQueries.length > 0 ? (
        <EarningsLoadError
          message="We couldn't load your earnings. Please try again."
          isRetrying={failedQueries.some((query) => query.isFetching)}
          onRetry={() => failedQueries.forEach((query) => query.refetch())}
        />
      ) : (
        <>
          {summary && account !== undefined ? (
            <>
              <BalanceCard
                availableBalance={summary.availableBalance}
                hasPayoutAccount={!!account}
                onRequestPayout={() => setIsRequestingPayout(true)}
              />
              <EarningsStatCards summary={summary} />
              {!account && <AddPayoutAccountBanner onAdd={() => setIsAddingAccount(true)} />}
            </>
          ) : (
            <SkeletonGroup label="Loading earnings" className="flex flex-col gap-6">
              <Skeleton className="h-[126px] rounded-3xl" />
              <Skeleton className="h-[168px] rounded-3xl" />
            </SkeletonGroup>
          )}

          <EarningsTable
            earnings={earningsQuery.data}
            isFetching={earningsQuery.isFetching}
            isShowingAll={isShowingAll}
            onShowAll={handleShowAll}
            onPageChange={setPage}
            onView={setViewing}
          />
        </>
      )}

      <EarningDetailsDrawer earning={viewing} onClose={() => setViewing(null)} />
      {isAddingAccount && <AddPayoutAccountModal onClose={() => setIsAddingAccount(false)} />}
      {isRequestingPayout && account && summary && (
        <PayoutFlow
          account={account}
          amount={summary.availableBalance}
          onClose={() => setIsRequestingPayout(false)}
        />
      )}
    </div>
  );
}
