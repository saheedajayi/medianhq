import { apiClient } from "@/services/api-client";
import type { MentorEarningsSummary } from "./types";

const EARNINGS_PATH = "/earnings";

export const earningsService = {
  getMentorSummary() {
    return apiClient.get<MentorEarningsSummary>(`${EARNINGS_PATH}/mentor/summary`);
  },
};

export type { MentorEarningsSummary } from "./types";
