"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/services/api-client";
import {
  taxonomyService,
  type CreateRolePayload,
  type TaxonomyData,
} from "@/services/taxonomy";
import { taxonomyQueryKeys } from "./query-keys";

export const useIndustries = () => {
  return useQuery<TaxonomyData, ApiError>({
    queryKey: taxonomyQueryKeys.industries(),
    queryFn: async () => {
      const response = await taxonomyService.getIndustries();
      return response.data;
    },
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiError, CreateRolePayload>({
    mutationKey: taxonomyQueryKeys.createRole(),
    mutationFn: async ({ industryName, roleName }) => {
      const response = await taxonomyService.createRole(industryName, roleName);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxonomyQueryKeys.industries() });
    },
  });
};
