import { apiClient } from "@/services/api-client";
import type {
  WaitlistPayload,
  WaitlistResponse,
  WaitlistStatsResponse,
} from "./types";

const WAITLIST_PATH = "/waitlist";

export const waitlistService = {
  create(payload: WaitlistPayload) {
    return apiClient.post<WaitlistResponse>(WAITLIST_PATH, payload);
  },
  getStats() {
    return apiClient.get<WaitlistStatsResponse>(`${WAITLIST_PATH}/stats`);
  },
};

export type {
  WaitlistAudience,
  WaitlistAudienceTab,
  WaitlistFieldErrors,
  WaitlistPayload,
  WaitlistResponse,
  WaitlistStatsResponse,
  WaitlistSubmitState,
} from "./types";
