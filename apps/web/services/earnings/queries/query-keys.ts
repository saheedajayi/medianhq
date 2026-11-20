import type { EarningsView } from "@/services/earnings";

export const earningsQueryKeys = {
  all: ["earnings"] as const,
  mentorSummary: () => [...earningsQueryKeys.all, "mentor-summary"] as const,
  sessions: (page: number, view?: EarningsView) => [...earningsQueryKeys.all, "sessions", page, view ?? "page"] as const,
  session: (earningId: string) => [...earningsQueryKeys.all, "session", earningId] as const,
  // Kept apart from the rest, so saving an account or a payout doesn't reload the list of banks
  banks: () => ["banks"] as const,
  payoutAccount: () => [...earningsQueryKeys.all, "payout-account"] as const,
  payouts: (page: number) => [...earningsQueryKeys.all, "payouts", page] as const,
  payoutStatement: (payoutId: string) => [...earningsQueryKeys.all, "payout-statement", payoutId] as const,
};
