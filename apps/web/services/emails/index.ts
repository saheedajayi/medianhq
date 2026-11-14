import { apiClient } from "@/services/api-client";
import type { UnsubscribePayload, UnsubscribeResponse } from "./types";

export const emailsService = {
  /** Turns off tips and onboarding emails, using the signed link from the email */
  unsubscribe(payload: UnsubscribePayload) {
    return apiClient.post<UnsubscribeResponse>("/emails/unsubscribe", payload);
  },
};

export type { UnsubscribePayload, UnsubscribeResponse } from "./types";
