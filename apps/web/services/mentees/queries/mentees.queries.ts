"use client";

import { useMutation } from "@tanstack/react-query";

import type { ApiError } from "@/services/api-client";
import {
  menteesService,
  type CreateMenteeProfilePayload,
  type MenteeProfileResponse,
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
