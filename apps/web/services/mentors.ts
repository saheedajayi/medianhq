import { apiClient } from "./api-client";

const MENTORS_PATH = "/mentors";

export type CreateMentorProfilePayload = {
  currentRole?: string;
  company?: string;
  industry: string;
  experience: string;
  /** Answer to "Why do you want to mentor?" (private, for application review) */
  motivation: string;
  cvUrl?: string;
};

export type UpdateMentorProfilePayload = {
  gender?: string;
  location?: string;
  bio?: string;
  avatarUrl?: string;
};

export type MentorMatch = {
  id: string | number;
  name: string;
  role: string;
  sessions: string;
  match: string;
  image: string;
};

export type ExploreMentorsParams = {
  search?: string;
  category?: string;
  priceType?: "all" | "free" | "paid";
  minRating?: number;
  location?: string;
  sortBy?: "relevance" | "rating" | "sessions" | "name";
  page?: number;
  limit?: number;
};

export const mentorsService = {
  apply(payload: CreateMentorProfilePayload) {
    // Applying makes several sequential DB writes (profile, role, fresh auth cookies),
    // so allow more than the default 15s on slow connections
    return apiClient.post<{ profile: any }>(
      `${MENTORS_PATH}/apply`,
      payload,
      { timeout: 60_000 }
    );
  },
  updateProfile(payload: UpdateMentorProfilePayload) {
    return apiClient.patch<{ profile: any }>(`${MENTORS_PATH}/me/profile`, payload);
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
    return apiClient.get<{ data: any[]; pagination: any }>(
      `${MENTORS_PATH}${qs ? `?${qs}` : ""}`
    );
  },
  getFeatured(limit = 6) {
    return apiClient.get<any[]>(`${MENTORS_PATH}/featured?limit=${limit}`);
  },
  getById(id: string) {
    return apiClient.get<any>(`${MENTORS_PATH}/${id}`);
  },
};
