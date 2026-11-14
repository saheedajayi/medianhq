"use client";

import Link from "next/link";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { Skeleton, SkeletonGroup } from "@/components/ui/base/skeleton";
import { useAdminUser } from "@/services/admin/users/queries/users.queries";
import { outlineButtonClass } from "../shared/shared";
import { AccountActionsCard } from "./account-actions-card";
import { AccountStatusCard } from "./account-status-card";
import { ActivityLogCard } from "./activity-log-card";
import { SessionHistoryCard } from "./session-history-card";
import { TrustScoreCard } from "./trust-score-card";
import { UserProfileCard } from "./user-profile-card";
import { UserReviewsCard } from "./user-reviews-card";

const columnsClass = "grid items-start gap-6 lg:grid-cols-[340px_minmax(0,1fr)]";
// Cancels the page padding so the breadcrumb bar runs edge to edge
const breadcrumbBarClass =
  "-mx-5 -mt-5 flex items-center gap-3 border-b border-[#EAECF0] px-5 py-4 text-sm sm:-mx-7 sm:-mt-7 sm:px-7 md:-mx-8 md:-mt-8 md:px-8";

interface UserDetailsViewProps {
  userId: string;
}

export function UserDetailsView({ userId }: UserDetailsViewProps) {
  const { data: user, error, isFetching, refetch } = useAdminUser(userId);

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Breadcrumb" className={breadcrumbBarClass}>
        <Link href="/admin/users" className="text-[#475467]! hover:text-[#101828]!">
          Users
        </Link>
        <span className="text-[#D0D5DD]">/</span>
        <span className="font-medium text-[#FF5514]">{user?.name ?? "User"}</span>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#101828]">User details</h1>
          <p className="mt-1.5 break-words text-sm text-[#667085]">
            Users{user && ` / ${user.name} / ${user.id}`}
          </p>
        </div>
        <Link href="/admin/users" className={outlineButtonClass}>
          Back to directory
        </Link>
      </header>

      {user ? (
        <div className={columnsClass}>
          <div className="flex flex-col gap-4">
            <UserProfileCard user={user} />
            <AccountStatusCard user={user} />
            {user.role === "MENTOR" && <TrustScoreCard trustScore={user.trustScoreDetail} />}
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <AccountActionsCard user={user} />
            <SessionHistoryCard sessions={user.sessions} />
            <UserReviewsCard reviews={user.reviews} />
            <ActivityLogCard userId={user.id} activity={user.activity} />
          </div>
        </div>
      ) : error?.status === 404 ? (
        <p className="rounded-2xl border border-[#EAECF0] px-6 py-16 text-center text-sm text-[#667085]">
          This user doesn&apos;t exist, or isn&apos;t a mentor or mentee.
        </p>
      ) : error ? (
        <DashboardErrorState onRetry={() => refetch()} isRetrying={isFetching} />
      ) : (
        <SkeletonGroup label="Loading user details" className={columnsClass}>
          <Skeleton className="h-[520px] w-full rounded-2xl" />
          <Skeleton className="h-[520px] w-full rounded-2xl" />
        </SkeletonGroup>
      )}
    </div>
  );
}
