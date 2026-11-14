"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/services/api-client";
import {
  adminApplicationsService,
  type AdminApplicationDetail,
  type AdminApplicationsFilters,
  type AdminApplicationsPage,
  type AdminChecklistItem,
} from "@/services/admin/applications";
import { adminApplicationsQueryKeys } from "./query-keys";

export const useAdminApplications = (filters: AdminApplicationsFilters, page: number) => {
  return useQuery<AdminApplicationsPage, ApiError>({
    queryKey: adminApplicationsQueryKeys.list(filters, page),
    queryFn: async () => {
      const response = await adminApplicationsService.getApplications(filters, page);
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
};

export const useAdminApplication = (applicationId: string) => {
  return useQuery<AdminApplicationDetail, ApiError>({
    queryKey: adminApplicationsQueryKeys.detail(applicationId),
    queryFn: async () => {
      const response = await adminApplicationsService.getApplication(applicationId);
      return response.data;
    },
    retry: (failureCount, error) => error.status !== 404 && failureCount < 2,
  });
};

/** Any change to an application shows in the queue and the review page, so both reload */
const useApplicationMutation = <TVariables,>(mutationFn: (variables: TVariables) => Promise<unknown>) => {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, TVariables>({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminApplicationsQueryKeys.all }),
  });
};

export const useAssignReviewer = () =>
  useApplicationMutation((input: { applicationIds: string[]; reviewerId: string | null }) =>
    adminApplicationsService.assignReviewer(input.applicationIds, input.reviewerId),
  );

export const useSaveApplicationReview = (applicationId: string) =>
  useApplicationMutation((review: { checklist?: Record<AdminChecklistItem, boolean>; note?: string }) =>
    adminApplicationsService.saveReview(applicationId, review),
  );

export const useApproveApplication = (applicationId: string) =>
  useApplicationMutation<void>(() => adminApplicationsService.approve(applicationId));

export const useRejectApplication = (applicationId: string) =>
  useApplicationMutation((reason?: string) => adminApplicationsService.reject(applicationId, reason));
