"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/services/api-client";
import {
  menteesService,
  type CreateMenteeProfilePayload,
  type MenteeProfileResponse,
  type MenteePublicProfile,
} from "@/services/mentees";
import { menteesQueryKeys } from "./query-keys";

export const useCreateMenteeProfile = () => {
  return useMutation<MenteeProfileResponse, ApiError, CreateMenteeProfilePayload>({
    mutationKey: menteesQueryKeys.createProfile(),
    mutationFn: async (payload) => {
      const response = await menteesService.createProfile(payload);
      return response.data;
    },
  });
};

export const useMenteeProfile = (id: string) => {
  return useQuery<MenteePublicProfile, ApiError>({
    queryKey: menteesQueryKeys.detail(id),
    queryFn: async () => {
      const response = await menteesService.getById(id);
      return response.data;
    },
    enabled: !!id,
    // Being refused or not found won't change on a retry
    retry: false,
  });
};
