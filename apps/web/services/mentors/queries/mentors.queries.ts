"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/services/api-client";
import {
  mentorsService,
  type CreateMentorProfilePayload,
  type ExploreMentorsParams,
  type MentorMatch,
  type MentorProfileMutationResponse,
  type UpdateMentorProfilePayload,
} from "@/services/mentors";
import { mentorsQueryKeys } from "./query-keys";

export const useExploreMentors = (params?: ExploreMentorsParams) => {
  return useQuery<any[], ApiError>({
    queryKey: mentorsQueryKeys.explore(params),
    queryFn: async () => {
      const response = await mentorsService.explore(params);
      return response.data;
    },
  });
};

export const useFeaturedMentors = (
  limit = 6,
  options?: { enabled?: boolean }
) => {
  return useQuery<any[], ApiError>({
    queryKey: mentorsQueryKeys.featured(limit),
    queryFn: async () => {
      const response = await mentorsService.getFeatured(limit);
      return response.data;
    },
    enabled: options?.enabled,
  });
};

export const useMentorMatches = () => {
  return useQuery<MentorMatch[], ApiError>({
    queryKey: mentorsQueryKeys.matches(),
    queryFn: async () => {
      const response = await mentorsService.getMatches();
      return response.data;
    },
  });
};

export const useMentor = (id: string) => {
  return useQuery<any, ApiError>({
    queryKey: mentorsQueryKeys.detail(id),
    queryFn: async () => {
      const response = await mentorsService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useApplyMentor = () => {
  return useMutation<
    MentorProfileMutationResponse,
    ApiError,
    CreateMentorProfilePayload
  >({
    mutationKey: mentorsQueryKeys.apply(),
    mutationFn: async (payload) => {
      const response = await mentorsService.apply(payload);
      return response.data;
    },
  });
};

export const useUpdateMentorProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<
    MentorProfileMutationResponse,
    ApiError,
    UpdateMentorProfilePayload
  >({
    mutationKey: mentorsQueryKeys.updateProfile(),
    mutationFn: async (payload) => {
      const response = await mentorsService.updateProfile(payload);
      return response.data;
    },
    onSuccess: () => {
      // Profile changes show up in explore, featured and detail views
      queryClient.invalidateQueries({ queryKey: mentorsQueryKeys.all });
    },
  });
};
