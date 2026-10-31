"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/services/api-client";
import { authQueryKeys } from "@/services/auth/queries/query-keys";
import {
  settingsService,
  type CareerInfo,
  type EducationPayload,
  type MySettings,
  type NotificationPreferences,
  type SocialLink,
  type SocialLinksPayload,
  type UpdateProfilePayload,
  type UpdateSettingsPayload,
  type WorkExperiencePayload,
} from "@/services/settings";
import { settingsQueryKeys } from "./query-keys";

export const useMySettings = () => {
  return useQuery<MySettings, ApiError>({
    queryKey: settingsQueryKeys.mine(),
    queryFn: async () => (await settingsService.getMine()).data,
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, UpdateSettingsPayload>({
    mutationFn: (payload) => settingsService.update(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingsQueryKeys.mine() }),
  });
};

/** Flips the toggle straight away and puts it back if saving fails */
export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  const key = settingsQueryKeys.mine();

  return useMutation<unknown, ApiError, NotificationPreferences, { previous?: MySettings }>({
    mutationFn: (notificationPreferences) => settingsService.update({ notificationPreferences }),
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<MySettings>(key);
      if (previous) {
        const merged = { ...previous.settings.notificationPreferences };
        (Object.keys(updates) as (keyof NotificationPreferences)[]).forEach((type) => {
          merged[type] = { ...merged[type], ...updates[type] };
        });
        queryClient.setQueryData<MySettings>(key, {
          ...previous,
          settings: { ...previous.settings, notificationPreferences: merged },
        });
      }
      return { previous };
    },
    onError: (_error, _updates, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, UpdateProfilePayload>({
    mutationFn: (payload) => settingsService.updateProfile(payload),
    onSuccess: () => {
      // The name and photo also show in the greeting and sidebar
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.mine() });
      queryClient.invalidateQueries({ queryKey: authQueryKeys.me() });
    },
  });
};

export const useCareerInfo = () => {
  return useQuery<CareerInfo, ApiError>({
    queryKey: settingsQueryKeys.career(),
    queryFn: async () => (await settingsService.getCareer()).data,
  });
};

const useCareerMutation = <TPayload,>(mutationFn: (payload: TPayload) => Promise<unknown>) => {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, TPayload>({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingsQueryKeys.career() }),
  });
};

export const useSaveExperience = () =>
  useCareerMutation(({ id, ...payload }: WorkExperiencePayload & { id?: string }) =>
    settingsService.saveExperience(payload, id)
  );
export const useDeleteExperience = () =>
  useCareerMutation((id: string) => settingsService.deleteExperience(id));
export const useSaveEducation = () =>
  useCareerMutation(({ id, ...payload }: EducationPayload & { id?: string }) =>
    settingsService.saveEducation(payload, id)
  );
export const useDeleteEducation = () =>
  useCareerMutation((id: string) => settingsService.deleteEducation(id));

export const useSocialLinks = () => {
  return useQuery<SocialLink[], ApiError>({
    queryKey: settingsQueryKeys.socials(),
    queryFn: async () => (await settingsService.getSocials()).data,
  });
};

export const useSaveSocialLinks = () => {
  const queryClient = useQueryClient();
  return useMutation<SocialLink[], ApiError, SocialLinksPayload>({
    mutationFn: async (payload) => (await settingsService.saveSocials(payload)).data,
    onSuccess: (links) => queryClient.setQueryData(settingsQueryKeys.socials(), links),
  });
};
