import { apiClient } from "@/services/api-client";
import type {
  CreateMenteeProfilePayload,
  MenteeProfileResponse,
  MenteePublicProfile,
} from "./types";

const MENTEES_PATH = "/mentees";

export const menteesService = {
  createProfile(payload: CreateMenteeProfilePayload) {
    return apiClient.post<MenteeProfileResponse>(`${MENTEES_PATH}/profile`, payload);
  },
  getById(id: string) {
    return apiClient.get<MenteePublicProfile>(`${MENTEES_PATH}/${encodeURIComponent(id)}`);
  },
};

export type {
  CreateMenteeProfilePayload,
  MenteeProfileResponse,
  MenteePublicProfile,
} from "./types";
