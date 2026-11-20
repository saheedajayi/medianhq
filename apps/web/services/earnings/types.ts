export type EarningStatus = "PENDING" | "PAID_OUT" | "DISPUTED" | "REFUNDED";

/** How a mentor sees a payout; the admin's review steps all read as processing */
export type PayoutStatus = "PROCESSING" | "COMPLETED" | "FAILED";

export interface MentorEarningsSummary {
  totalEarned: number;
  totalPaidOut: number;
  /** Requested and not yet paid */
  pendingPayout: number;
  availableBalance: number;
  /** Earned in the last 48 hours, so not yet withdrawable */
  pendingClearance: number;
  nextClearanceAt: string | null;
  heldOnDispute: number;
  projectedThisMonth: number;
  firstEarningAt: string | null;
  currency: string;
  recentPayouts: { id: string; amount: number; status: string; createdAt: string }[];
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SessionEarning {
  id: string;
  bookingId: string | null;
  sessionTitle: string;
  menteeName: string;
  date: string;
  grossAmount: number;
  netAmount: number;
  currency: string;
  status: EarningStatus;
}

export interface SessionEarningDetails extends SessionEarning {
  mentee: { name: string; avatarUrl: string | null; role: string | null };
  serviceCharge: number;
  completedAt: string;
  clearsAt: string;
  hasCleared: boolean;
  paidOutAt: string | null;
  /** Set while a payout that covers this earning is on its way */
  payoutRequestedAt: string | null;
  refundedAt: string | null;
}

export type EarningsView = "all";

export interface Bank {
  code: string;
  name: string;
}

export interface PayoutAccount {
  bankCode: string;
  bankName: string;
  accountName: string;
  accountLastFour: string;
}

export interface PayoutAccountInput {
  bankCode: string;
  accountNumber: string;
}

export interface ResolvedPayoutAccount {
  accountName: string;
  registeredName: string;
  isNameMatch: boolean;
}

export interface Payout {
  id: string;
  requestedAt: string;
  amount: number;
  currency: string;
  bankName: string;
  accountLastFour: string;
  reference: string;
  status: PayoutStatus;
}

export type RequestedPayout = Omit<Payout, "status">;

export interface PayoutStatement {
  id: string;
  reference: string;
  requestedAt: string;
  status: PayoutStatus;
  /** "October 2026" */
  period: string;
  currency: string;
  sessionsCompleted: number;
  grossEarnings: number;
  serviceCharge: number;
  netEarnings: number;
  paidOut: number;
  pendingClearance: number;
  heldOnDispute: number;
  sessions: { id: string; sessionTitle: string; menteeName: string; netAmount: number }[];
}
