export const industries = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Energy",
  "Media",
  "Operations",
  "Entrepreneurship"
] as const;

export const sessionDurations = [30, 45, 60] as const;

export enum UserRole {
  Mentee = "MENTEE",
  Mentor = "MENTOR",
  Admin = "ADMIN"
}

export enum MentorStatus {
  Draft = "DRAFT",
  PendingReview = "PENDING_REVIEW",
  Approved = "APPROVED",
  Rejected = "REJECTED"
}

export enum BookingStatus {
  PendingPayment = "PENDING_PAYMENT",
  Confirmed = "CONFIRMED",
  Completed = "COMPLETED",
  Cancelled = "CANCELLED"
}

export enum WaitlistAudience {
  Mentee = "MENTEE",
  Mentor = "MENTOR"
}

export type Industry = (typeof industries)[number];

export type MentorCard = {
  id: string;
  name: string;
  headline: string;
  industry: Industry;
  yearsOfExperience: number;
  pricePerSession: number;
  currency: "NGN" | "USD";
  rating: number | null;
};
