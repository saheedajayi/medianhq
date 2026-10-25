import { apiClient } from "@/services/api-client";
import type {
  CreateReviewPayload,
  CreateReviewResponse,
  MentorReviewsResponse,
} from "./types";

const REVIEWS_PATH = "/reviews";

export const reviewsService = {
  create(payload: CreateReviewPayload) {
    return apiClient.post<CreateReviewResponse>(REVIEWS_PATH, payload);
  },
  findByMentor(mentorId: string) {
    return apiClient.get<MentorReviewsResponse>(`${REVIEWS_PATH}/mentor/${mentorId}`);
  },
};

export type {
  CreateReviewPayload,
  CreateReviewResponse,
  MentorReviewsResponse,
} from "./types";
