"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/services/api-client";
import {
  mentorSessionsService,
  type AvailabilityInput,
  type MentorSessionDto,
  type MentorSessionInput,
  type UpdateMentorSessionPayload,
} from "@/services/mentor-sessions";
import { mentorSessionsQueryKeys } from "./query-keys";

export const useMentorSessions = () => {
  return useQuery<MentorSessionDto[], ApiError>({
    queryKey: mentorSessionsQueryKeys.list(),
    queryFn: async () => {
      const response = await mentorSessionsService.list();
      return response.data || [];
    },
  });
};

export const useMentorAvailability = () => {
  return useQuery<AvailabilityInput[], ApiError>({
    queryKey: mentorSessionsQueryKeys.availability(),
    queryFn: async () => {
      const response = await mentorSessionsService.getAvailability();
      return response.data;
    },
  });
};

const useInvalidateSessionsList = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: mentorSessionsQueryKeys.list() });
};

export const useCreateMentorSession = () => {
  const invalidateList = useInvalidateSessionsList();

  return useMutation<MentorSessionDto, ApiError, MentorSessionInput>({
    mutationKey: mentorSessionsQueryKeys.create(),
    mutationFn: async (payload) => {
      const response = await mentorSessionsService.create(payload);
      return response.data;
    },
    onSuccess: invalidateList,
  });
};

export const useUpdateMentorSession = () => {
  const invalidateList = useInvalidateSessionsList();

  return useMutation<MentorSessionDto, ApiError, UpdateMentorSessionPayload>({
    mutationKey: mentorSessionsQueryKeys.update(),
    mutationFn: async ({ id, payload }) => {
      const response = await mentorSessionsService.update(id, payload);
      return response.data;
    },
    onSuccess: invalidateList,
  });
};

export const useDeleteMentorSession = () => {
  const invalidateList = useInvalidateSessionsList();

  return useMutation<{ id: string; deleted: boolean }, ApiError, string>({
    mutationKey: mentorSessionsQueryKeys.remove(),
    mutationFn: async (id) => {
      const response = await mentorSessionsService.remove(id);
      return response.data;
    },
    onSuccess: invalidateList,
  });
};

export const useSaveAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation<AvailabilityInput[], ApiError, AvailabilityInput[]>({
    mutationKey: mentorSessionsQueryKeys.saveAvailability(),
    mutationFn: async (payload) => {
      const response = await mentorSessionsService.saveAvailability(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentorSessionsQueryKeys.availability() });
    },
  });
};
