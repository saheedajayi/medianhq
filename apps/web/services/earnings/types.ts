export interface MentorEarningsSummary {
  totalEarned: number;
  totalPaidOut: number;
  pendingPayout: number;
  availableBalance: number;
  currency: string;
  recentPayouts: { id: string; amount: number; status: string; createdAt: string }[];
}
