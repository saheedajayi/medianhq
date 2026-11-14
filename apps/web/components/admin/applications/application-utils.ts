import type { AdminApplicationRow, AdminApplicationStatus } from "@/services/admin/applications";
import { downloadCsv } from "@/lib/csv";

export const APPLICATION_STATUS: Record<AdminApplicationStatus, { label: string; className: string }> = {
  PENDING_REVIEW: { label: "Pending", className: "bg-[#FFFAEB] text-[#B54708]" },
  APPROVED: { label: "Approved", className: "bg-[#ECFDF3] text-[#067647]" },
  REJECTED: { label: "Rejected", className: "bg-[#FEF3F2] text-[#B42318]" },
};

/** "Senior Finance Manager · Paystack", with whichever parts exist */
export const formatRole = (application: Pick<AdminApplicationRow, "jobTitle" | "company">, separator = " · ") =>
  [application.jobTitle, application.company].filter(Boolean).join(separator);

/** "4 days", or "4 business days" in full */
export const formatAge = (days: number, unit = "") =>
  `${days} ${unit && `${unit} `}${days === 1 ? "day" : "days"}`;

/** Where the review stands, from what the reviewer has saved so far */
export function getReviewProgress(application: AdminApplicationRow) {
  if (application.checksDone === application.checksTotal) return "Checklist complete";
  if (application.checksDone > 0) return `Checklist ${application.checksDone} of ${application.checksTotal}`;
  if (application.note) return "Note saved";
  return application.reviewer ? "Awaiting reviewer notes" : "Not reviewed";
}

export function exportApplications(filename: string, applications: AdminApplicationRow[]) {
  downloadCsv(filename, [
    [
      "Application ID",
      "Applicant",
      "Email",
      "Role",
      "Company",
      "Expertise",
      "Status",
      "Submitted",
      "Reviewer",
      "Review",
      "Age (business days)",
    ],
    ...applications.map((application) => [
      application.id,
      application.name,
      application.email,
      application.jobTitle,
      application.company,
      application.expertise,
      APPLICATION_STATUS[application.status].label,
      application.submittedAt,
      application.reviewer?.name ?? "Unassigned",
      getReviewProgress(application),
      application.ageBusinessDays,
    ]),
  ]);
}
