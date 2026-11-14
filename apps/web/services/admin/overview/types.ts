export type AdminOverviewRange = "7d" | "30d";

export type AdminHealthStatus = "OPERATIONAL" | "DEGRADED";

export type AdminOverviewAlert = {
  id: string;
  kind: "MENTOR_NO_SHOW" | "REFUND_FAILED" | "APPLICATIONS_WAITING" | "CONTENT_FLAGGED" | "PAYOUT_FAILED";
  severity: "URGENT" | "NEEDS_REVIEW";
  title: string;
  detail: string;
  occurredAt: string;
};

export type AdminOverviewActivityDay = {
  /** Lagos calendar day, YYYY-MM-DD */
  date: string;
  sessionsCompleted: number;
  newSignUps: number;
  churnedUsers: number;
};

export type AdminOverview = {
  generatedAt: string;
  stats: {
    monthlyActiveUsers: number;
    sessionsToday: { total: number; completed: number; inProgress: number };
    revenueToday: { amount: number; currency: string };
    mentors: { approved: number; withSessionsLast30Days: number };
    pendingApplications: { total: number; nearingReviewTarget: number };
  };
  activity: {
    rangeDays: number;
    days: AdminOverviewActivityDay[];
    totals: { sessionsCompleted: number; newSignUps: number; churnedUsers: number };
  };
  nps: {
    from: string;
    to: string;
    responses: number;
    /** Null when nobody answered this week */
    score: number | null;
    promotersPct: number;
    passivesPct: number;
    detractorsPct: number;
    changeFromPreviousWeek: number | null;
  };
  alerts: AdminOverviewAlert[];
  systemHealth: {
    status: AdminHealthStatus;
    checkedAt: string;
    note: string;
    items: { label: string; value: string; status: AdminHealthStatus; statusLabel: string }[];
  };
};
