export type ApplicationStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

export const REVIEW_CHECKLIST_ITEMS = [
  'credibility',
  'seniority',
  'conduct',
  'conflictOfInterest',
] as const;

export type ReviewChecklistItem = (typeof REVIEW_CHECKLIST_ITEMS)[number];
export type ReviewChecklist = Record<ReviewChecklistItem, boolean>;

/** Query string for the application queue, as it arrives */
export interface AdminApplicationsQueryDto {
  status?: string;
  search?: string;
  expertise?: string;
  submitted?: string;
  reviewer?: string;
  sort?: string;
  page?: number | string;
}

/** The queue filters once checked */
export interface AdminApplicationsFilters {
  status: ApplicationStatus;
  search?: string;
  expertise?: string;
  submitted?: '7d' | '30d' | '90d';
  /** An admin's user ID, or "unassigned" */
  reviewer?: string;
  sort: 'oldest' | 'newest';
}

export interface AssignReviewerDto {
  applicationIds?: unknown;
  /** Null or missing clears the reviewer */
  reviewerId?: unknown;
}

/** Either part can be left out to keep what is already saved */
export interface SaveApplicationReviewDto {
  checklist?: unknown;
  note?: unknown;
}

export interface RejectApplicationDto {
  /** Feedback included in the applicant's email */
  reason?: string;
}
