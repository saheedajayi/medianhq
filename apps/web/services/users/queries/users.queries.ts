"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/services/api-client";
import { authQueryKeys } from "@/services/auth/queries/query-keys";
import {
  usersService,
  type UpdateRolePayload,
  type UpdateRoleResponse,
} from "@/services/users";
import { usersQueryKeys } from "./query-keys";

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateRoleResponse, ApiError, UpdateRolePayload>({
    mutationKey: usersQueryKeys.updateRole(),
    mutationFn: async (payload) => {
      const response = await usersService.updateRole(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.me() });
    },
  });
};
