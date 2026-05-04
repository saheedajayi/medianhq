import { apiClient } from "@/services/api-client";
import type { WaitlistPayload, WaitlistResponse } from "./types";

const WAITLIST_PATH = "/waitlist";

export const waitlistService = {
  create(payload: WaitlistPayload) {
    return apiClient.post<WaitlistResponse>(WAITLIST_PATH, payload);
  },
};

export type {
  WaitlistAudience,
  WaitlistAudienceTab,
  WaitlistFieldErrors,
  WaitlistPayload,
  WaitlistResponse,
  WaitlistSubmitState,
} from "./types";
