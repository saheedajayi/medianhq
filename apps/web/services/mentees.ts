import { apiClient } from "./api-client";

const MENTEES_PATH = "/mentees";

export type CreateMenteeProfilePayload = {
  goals: string[];
  goalDescription?: string;
  currentRole?: string;
  industry?: string;
  timeframe?: string;
};

export const menteesService = {
  createProfile(payload: CreateMenteeProfilePayload) {
    return apiClient.post<{ profile: any }>(
      `${MENTEES_PATH}/profile`,
      payload
    );
  },
};
