"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/services/api-client";
import {
  adminUsersService,
  type AdminUserDetail,
  type AdminUserEmail,
  type AdminUsersFilters,
  type AdminUsersPage,
} from "@/services/admin/users";
import { adminUsersQueryKeys } from "./query-keys";

export const useAdminUsers = (filters: AdminUsersFilters, page: number) => {
  return useQuery<AdminUsersPage, ApiError>({
    queryKey: adminUsersQueryKeys.list(filters, page),
    queryFn: async () => {
      const response = await adminUsersService.getUsers(filters, page);
      return response.data;
    },
    // Keeps the table in place while the next page or filter loads
    placeholderData: keepPreviousData,
  });
};

export const useAdminUser = (userId: string) => {
  return useQuery<AdminUserDetail, ApiError>({
    queryKey: adminUsersQueryKeys.detail(userId),
    queryFn: async () => {
      const response = await adminUsersService.getUser(userId);
      return response.data;
    },
    // A missing user won't appear on a retry
    retry: (failureCount, error) => error.status !== 404 && failureCount < 2,
  });
};

/** Account changes show in the directory and the details page, so both reload */
const useUserMutation = <TVariables,>(mutationFn: (variables: TVariables) => Promise<unknown>) => {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, TVariables>({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminUsersQueryKeys.all }),
  });
};

export const useEmailUser = (userId: string) =>
  useUserMutation((email: AdminUserEmail) => adminUsersService.emailUser(userId, email));

export const useSuspendUser = (userId: string) =>
  useUserMutation((reason: string) => adminUsersService.suspendUser(userId, reason));

export const useReinstateUser = (userId: string) =>
  useUserMutation<void>(() => adminUsersService.reinstateUser(userId));

export const useSetUserFlag = (userId: string) =>
  useUserMutation((flagged: boolean) => adminUsersService.setUserFlag(userId, flagged));
