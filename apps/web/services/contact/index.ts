import { apiClient } from "@/services/api-client";
import type { ContactMessagePayload, ContactMessageResponse } from "./types";

export const contactService = {
  send(payload: ContactMessagePayload) {
    return apiClient.post<ContactMessageResponse>("/contact", payload);
  },
};

export { CONTACT_SUBJECTS } from "./types";
export type { ContactMessagePayload, ContactMessageResponse, ContactSubject } from "./types";
