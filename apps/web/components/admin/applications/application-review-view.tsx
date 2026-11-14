"use client";

import Link from "next/link";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { Skeleton, SkeletonGroup } from "@/components/ui/base/skeleton";
import { useAdminApplication } from "@/services/admin/applications/queries/applications.queries";
import { outlineButtonClass } from "../shared/shared";
import { ApplicantCard } from "./applicant-card";
import { ExpertiseCard, MotivationCard } from "./application-answers";
import { ApplicationStatusBar } from "./application-status-bar";
import { APPLICATION_STATUS } from "./application-utils";
import { AuditTrailCard } from "./audit-trail-card";
import { DecisionCard } from "./decision-card";
import { DecisionEmailCard } from "./decision-email-card";
import { ReviewChecklistCard } from "./review-checklist-card";
import { ReviewerNotesCard } from "./reviewer-notes-card";

const columnsClass = "grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]";

interface ApplicationReviewViewProps {
  applicationId: string;
}

export function ApplicationReviewView({ applicationId }: ApplicationReviewViewProps) {
  const { data: application, error, isFetching, refetch } = useAdminApplication(applicationId);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#101828]">Review mentor application</h1>
          <p className="mt-1.5 break-words text-sm text-[#667085]">
            Applications
            {application &&
              ` / ${APPLICATION_STATUS[application.status].label} / ${application.name} · ${application.id}`}
          </p>
        </div>
        <Link href="/admin/applications" className={outlineButtonClass}>
          Back to queue
        </Link>
      </header>

      {application ? (
        <>
          <ApplicationStatusBar application={application} />

          <div className={columnsClass}>
            <div className="flex min-w-0 flex-col gap-5">
              <ApplicantCard application={application} />
              <ExpertiseCard application={application} />
              <MotivationCard application={application} />
              <AuditTrailCard application={application} />
            </div>

            <div className="flex min-w-0 flex-col gap-5">
              <ReviewChecklistCard application={application} />
              {/* Remounts when the saved note changes, so the draft starts from it */}
              <ReviewerNotesCard key={application.noteAt ?? "unsaved"} application={application} />
              <DecisionEmailCard application={application} />
              {application.status === "PENDING_REVIEW" && <DecisionCard application={application} />}
            </div>
          </div>
        </>
      ) : error?.status === 404 ? (
        <p className="rounded-2xl border border-[#EAECF0] px-6 py-16 text-center text-sm text-[#667085]">
          This application doesn&apos;t exist or hasn&apos;t been submitted.
        </p>
      ) : error ? (
        <DashboardErrorState onRetry={() => refetch()} isRetrying={isFetching} />
      ) : (
        <SkeletonGroup label="Loading application" className={columnsClass}>
          <Skeleton className="h-[560px] w-full rounded-2xl" />
          <Skeleton className="h-[560px] w-full rounded-2xl" />
        </SkeletonGroup>
      )}
    </div>
  );
}
