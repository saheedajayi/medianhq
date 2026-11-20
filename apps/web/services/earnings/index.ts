import { apiClient } from "@/services/api-client";
import type {
  Bank,
  EarningsView,
  MentorEarningsSummary,
  Page,
  Payout,
  PayoutAccount,
  PayoutAccountInput,
  PayoutStatement,
  RequestedPayout,
  ResolvedPayoutAccount,
  SessionEarning,
  SessionEarningDetails,
} from "./types";

const EARNINGS_PATH = "/earnings/mentor";

export const earningsService = {
  getMentorSummary() {
    return apiClient.get<MentorEarningsSummary>(`${EARNINGS_PATH}/summary`);
  },
  getEarnings(page: number, view?: EarningsView) {
    return apiClient.get<Page<SessionEarning>>(`${EARNINGS_PATH}/sessions`, { params: { page, view } });
  },
  getEarning(earningId: string) {
    return apiClient.get<SessionEarningDetails>(`${EARNINGS_PATH}/sessions/${encodeURIComponent(earningId)}`);
  },
  getBanks() {
    return apiClient.get<Bank[]>(`${EARNINGS_PATH}/banks`);
  },
  getPayoutAccount() {
    return apiClient.get<PayoutAccount | null>(`${EARNINGS_PATH}/payout-account`);
  },
  resolvePayoutAccount(input: PayoutAccountInput) {
    return apiClient.post<ResolvedPayoutAccount>(`${EARNINGS_PATH}/payout-account/resolve`, input);
  },
  savePayoutAccount(input: PayoutAccountInput) {
    return apiClient.put<PayoutAccount>(`${EARNINGS_PATH}/payout-account`, input);
  },
  getPayouts(page: number) {
    return apiClient.get<Page<Payout>>(`${EARNINGS_PATH}/payouts`, { params: { page } });
  },
  getPayoutStatement(payoutId: string) {
    return apiClient.get<PayoutStatement>(`${EARNINGS_PATH}/payouts/${encodeURIComponent(payoutId)}/statement`);
  },
  requestPayout(password: string) {
    return apiClient.post<RequestedPayout>(`${EARNINGS_PATH}/payout`, { password });
  },
};

export type {
  Bank,
  EarningStatus,
  EarningsView,
  MentorEarningsSummary,
  Page,
  Payout,
  PayoutAccount,
  PayoutAccountInput,
  PayoutStatement,
  PayoutStatus,
  RequestedPayout,
  ResolvedPayoutAccount,
  SessionEarning,
  SessionEarningDetails,
} from "./types";
