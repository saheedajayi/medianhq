import { apiClient } from "./api-client";

const REVIEWS_PATH = "/reviews";

export interface CreateReviewPayload {
  bookingId: string;
  rating: number;
  comment?: string;
  npsScore?: number;
}

export const reviewsService = {
  create(payload: CreateReviewPayload) {
    return apiClient
      .post<{ success: boolean; review: any }>(REVIEWS_PATH, payload)
      .then((r) => r.data);
  },
  findByMentor(mentorId: string) {
    return apiClient
      .get<{ count: number; avgRating: number; reviews: any[] }>(
        `${REVIEWS_PATH}/mentor/${mentorId}`
      )
      .then((r) => r.data);
  },
};
