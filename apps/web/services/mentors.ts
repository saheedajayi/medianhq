import { apiClient } from "./api-client";

const MENTORS_PATH = "/mentors";

export type CreateMentorProfilePayload = {
  currentRole?: string;
  company?: string;
  industry: string;
  experience: string;
  location: string;
  bio?: string;
  cvUrl?: string;
};

export type MentorMatch = {
  id: string | number;
  name: string;
  role: string;
  sessions: string;
  match: string;
  image: string;
};

export const mentorsService = {
  apply(payload: CreateMentorProfilePayload) {
    return apiClient.post<{ profile: any }>(
      `${MENTORS_PATH}/apply`,
      payload
    );
  },
  getMatches() {
    return apiClient.get<MentorMatch[]>(`${MENTORS_PATH}/matches`);
  },
};
