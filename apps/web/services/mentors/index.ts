import { apiClient } from "@/services/api-client";
import type {
  CreateMentorProfilePayload,
  ExploreMentorsParams,
  MentorMatch,
  MentorProfileMutationResponse,
  UpdateMentorProfilePayload,
} from "./types";

const MENTORS_PATH = "/mentors";

export const mentorsService = {
  apply(payload: CreateMentorProfilePayload) {
    // Applying makes several sequential DB writes (profile, role, fresh auth cookies),
    // so allow more than the default 15s on slow connections
    return apiClient.post<MentorProfileMutationResponse>(
      `${MENTORS_PATH}/apply`,
      payload,
      { timeout: 60_000 }
    );
  },
  updateProfile(payload: UpdateMentorProfilePayload) {
    return apiClient.patch<MentorProfileMutationResponse>(
      `${MENTORS_PATH}/me/profile`,
      payload
    );
  },
  getMatches() {
    return apiClient.get<MentorMatch[]>(`${MENTORS_PATH}/matches`);
  },
  explore(params?: ExploreMentorsParams) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          query.append(key, String(val));
        }
      });
    }
    const qs = query.toString();
    // The API client unwraps the envelope, so this resolves to the mentors list itself
    return apiClient.get<any[]>(`${MENTORS_PATH}${qs ? `?${qs}` : ""}`);
  },
  getFeatured(limit = 6) {
    return apiClient.get<any[]>(`${MENTORS_PATH}/featured?limit=${limit}`);
  },
  getById(id: string) {
    return apiClient.get<any>(`${MENTORS_PATH}/${id}`);
  },
};

export type {
  CreateMentorProfilePayload,
  ExploreMentorsParams,
  MentorMatch,
  MentorProfileMutationResponse,
  UpdateMentorProfilePayload,
} from "./types";
