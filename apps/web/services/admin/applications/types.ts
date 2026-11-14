export type AdminApplicationStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED";
export type AdminChecklistItem = "credibility" | "seniority" | "conduct" | "conflictOfInterest";

export type AdminApplicationsFilters = {
  status: AdminApplicationStatus;
  search?: string;
  expertise?: string;
  submitted?: "7d" | "30d" | "90d";
  /** An admin's user ID, or "unassigned" */
  reviewer?: string;
  sort: "oldest" | "newest";
};

export type AdminApplicationRow = {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  jobTitle: string | null;
  company: string | null;
  expertise: string;
  status: AdminApplicationStatus;
  submittedAt: string;
  /** Weekdays since submission, up to the decision if there is one */
  ageBusinessDays: number;
  reviewTarget: string;
  reviewer: { id: string; name: string } | null;
  checksDone: number;
  checksTotal: number;
  note: string | null;
  noteAt: string | null;
  noteBy: string | null;
};

export type AdminApplicationsPage = {
  items: AdminApplicationRow[];
  total: number;
  page: number;
  pageSize: number;
  counts: { pending: number; approved: number; rejected: number };
  nearingTarget: number;
  expertise: string[];
  reviewers: { id: string; name: string }[];
};

export type AdminDecisionEmail = { subject: string; paragraphs: string[] };

export type AdminApplicationDetail = AdminApplicationRow & {
  location: string | null;
  experience: string;
  skills: string[];
  bio: string | null;
  motivation: string | null;
  linkedinUrl: string | null;
  cvUrl: string | null;
  decidedAt: string | null;
  checklist: Record<AdminChecklistItem, boolean>;
  auditTrail: { id: string; action: string; adminName: string | null; detail: string | null; at: string }[];
  emailPreview: { accept: AdminDecisionEmail; reject: AdminDecisionEmail };
};
