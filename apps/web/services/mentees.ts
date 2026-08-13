import { apiClient } from "./api-client";

const MENTEES_PATH = "/mentees";

export type CreateMenteeProfilePayload = {
  gender?: string;
  location?: string;
  bio?: string;
  avatarUrl?: string;
  goals?: string[];
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
