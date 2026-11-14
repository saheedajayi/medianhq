"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/services/api-client";
import {
  adminInvitesService,
  type AcceptAdminInvitePayload,
  type AdminInvite,
  type AdminInvitePreview,
  type CreateAdminInvitePayload,
} from "@/services/admin/invites";
import { authQueryKeys } from "@/services/auth/queries/query-keys";
import { adminSettingsQueryKeys } from "@/services/admin/settings/queries/query-keys";
import { adminInvitesQueryKeys } from "./query-keys";

export const useAdminInvites = () => {
  return useQuery<AdminInvite[], ApiError>({
    queryKey: adminInvitesQueryKeys.list(),
    queryFn: async () => (await adminInvitesService.getInvites()).data,
  });
};

/** Every change to an invite shows in the invites list and the audit log, so both reload */
const useInviteMutation = <TVariables, TData = unknown>(mutationFn: (variables: TVariables) => Promise<TData>) => {
  const queryClient = useQueryClient();
  return useMutation<TData, ApiError, TVariables>({
    mutationFn,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: adminInvitesQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: adminSettingsQueryKeys.auditLog() }),
      ]),
  });
};

export const useCreateAdminInvite = () =>
  useInviteMutation(async (payload: CreateAdminInvitePayload) => (await adminInvitesService.createInvite(payload)).data);

export const useResendAdminInvite = () =>
  useInviteMutation(async (inviteId: string) => (await adminInvitesService.resendInvite(inviteId)).data);

export const useRevokeAdminInvite = () =>
  useInviteMutation((inviteId: string) => adminInvitesService.revokeInvite(inviteId));

/** The invite couldn't be fetched (no answer, timeout or server error), as opposed to a bad link */
export const isInviteLoadFailure = (error: ApiError | null | undefined) =>
  !!error && (error.status === 0 || error.status >= 500);

export const useAdminInvitePreview = (token: string) => {
  return useQuery<AdminInvitePreview, ApiError>({
    queryKey: adminInvitesQueryKeys.preview(token),
    queryFn: async () => (await adminInvitesService.getInvitePreview(token)).data,
    enabled: !!token,
    // A bad or expired link (4xx) stays bad; a timeout or server error is worth two more tries
    retry: (failureCount, error) => isInviteLoadFailure(error) && failureCount < 2,
  });
};

/** Accepting signs the new admin in, so the current user is refreshed */
export const useAcceptAdminInvite = (token: string) => {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, AcceptAdminInvitePayload>({
    mutationFn: async (payload) => (await adminInvitesService.acceptInvite(token, payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authQueryKeys.me() }),
  });
};
