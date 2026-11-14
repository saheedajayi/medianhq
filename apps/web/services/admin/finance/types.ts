export type RevenuePeriod = "daily" | "weekly" | "monthly" | "quarterly" | "annually";
export type PayoutStatus = "PAID" | "PENDING" | "FAILED";
export type RefundStatus = "COMPLETED" | "PENDING" | "FAILED";

/** An amount with its change on the 7 days before; null when there is nothing to compare with */
export type MoneyStat = { amount: number; changePct: number | null };
export type CountStat = { count: number; changePct: number | null };

type Paged<T> = { items: T[]; total: number; page: number; pageSize: number };

export type RevenueBucket = {
  label: string;
  sessionRevenue: number;
  subscriptionRevenue: number;
  totalRevenue: number;
  growthPct: number | null;
};

export type FinanceRevenue = {
  period: RevenuePeriod;
  stats: {
    totalRevenue: MoneyStat;
    sessionsRevenue: MoneyStat;
    subscriptionRevenue: MoneyStat;
    averageDailyRevenue: MoneyStat;
  };
  /** Oldest first */
  series: RevenueBucket[];
  byProduct: { oneOnOne: number; group: number };
  insights: {
    sessionsChangePct: number | null;
    subscriptionsChangePct: number | null;
    topEarning: { label: string; amount: number } | null;
  };
  breakdown: RevenueBucket[];
};

export type FinancePayout = {
  id: string;
  mentor: { id: string; name: string; avatarUrl: string | null };
  bankCode: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  requestedAt: string;
};

export type PayoutsFilters = { status?: PayoutStatus; search?: string };

export type PayoutsPage = Paged<FinancePayout> & {
  stats: { totalPaidOut: MoneyStat; pendingBalance: MoneyStat; failedDisbursements: MoneyStat };
};

export type SessionCharge = {
  id: string;
  date: string;
  sessionId: string;
  mentorName: string;
  sessionFee: number;
  serviceCharge: number;
};

export type MentorCharge = {
  mentorId: string;
  mentorName: string;
  sessions: number;
  sessionRevenue: number;
  serviceCharge: number;
};

/** "all" asks for the expanded report */
export type ServiceReportFilters = { search?: string; view?: "all" };

export type SessionChargesPage = Paged<SessionCharge>;
export type MentorChargesPage = Paged<MentorCharge>;

export type FinanceRefund = {
  id: string;
  user: { id: string; name: string; avatarUrl: string | null; role: string };
  type: "SESSION";
  amount: number;
  reason: string;
  status: RefundStatus;
  requestedAt: string;
  completedAt: string | null;
};

export type RefundsFilters = { search?: string; status?: RefundStatus; range?: "7d" | "30d" | "90d" };

export type RefundsPage = Paged<FinanceRefund> & {
  stats: { total: CountStat; completed: CountStat; pending: CountStat; failed: CountStat };
};
