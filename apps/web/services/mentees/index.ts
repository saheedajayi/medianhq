import { apiClient } from "@/services/api-client";
import type { CreateMenteeProfilePayload, MenteeProfileResponse } from "./types";

const MENTEES_PATH = "/mentees";

export const menteesService = {
  createProfile(payload: CreateMenteeProfilePayload) {
    return apiClient.post<MenteeProfileResponse>(`${MENTEES_PATH}/profile`, payload);
  },
};

export type { CreateMenteeProfilePayload, MenteeProfileResponse } from "./types";
