"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/services/api-client";
import { mentorsQueryKeys } from "@/services/mentors/queries/query-keys";
import {
  reviewsService,
  type CreateReviewPayload,
  type CreateReviewResponse,
  type MentorReviewsResponse,
} from "@/services/reviews";
import { reviewsQueryKeys } from "./query-keys";

export const useMentorReviews = (mentorId: string) => {
  return useQuery<MentorReviewsResponse, ApiError>({
    queryKey: reviewsQueryKeys.byMentor(mentorId),
    queryFn: async () => {
      const response = await reviewsService.findByMentor(mentorId);
      return response.data;
    },
    enabled: !!mentorId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateReviewResponse, ApiError, CreateReviewPayload>({
    mutationKey: reviewsQueryKeys.create(),
    mutationFn: async (payload) => {
      const response = await reviewsService.create(payload);
      return response.data;
    },
    onSuccess: () => {
      // Bookings are left alone: the session view keeps local-only details
      // (like action items) on the reviewed booking, which a refetch would wipe
      queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: mentorsQueryKeys.all });
    },
  });
};
