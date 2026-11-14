"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/services/api-client";
import {
  adminSessionsService,
  type CompletedSessionsFilters,
  type CompletedSessionsPage,
  type LiveSessionsPage,
  type NoShowTrackerFilters,
  type NoShowTrackerPage,
  type RecordingsPage,
  type SessionsCalendar,
} from "@/services/admin/sessions";
import { adminSessionsQueryKeys } from "./query-keys";

// Sessions start and end on their own, so the live list is polled
const LIVE_REFRESH_MS = 30_000;

export const useLiveSessions = (page: number) => {
  return useQuery<LiveSessionsPage, ApiError>({
    queryKey: adminSessionsQueryKeys.live(page),
    queryFn: async () => {
      const response = await adminSessionsService.getLive(page);
      return response.data;
    },
    placeholderData: keepPreviousData,
    refetchInterval: LIVE_REFRESH_MS,
  });
};

export const useCompletedSessions = (filters: CompletedSessionsFilters, page: number) => {
  return useQuery<CompletedSessionsPage, ApiError>({
    queryKey: adminSessionsQueryKeys.completed(filters, page),
    queryFn: async () => {
      const response = await adminSessionsService.getCompleted(filters, page);
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
};

export const useSessionRecordings = (page: number) => {
  return useQuery<RecordingsPage, ApiError>({
    queryKey: adminSessionsQueryKeys.recordings(page),
    queryFn: async () => {
      const response = await adminSessionsService.getRecordings(page);
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
};

export const useNoShowTracker = (filters: NoShowTrackerFilters, page: number) => {
  return useQuery<NoShowTrackerPage, ApiError>({
    queryKey: adminSessionsQueryKeys.noShows(filters, page),
    queryFn: async () => {
      const response = await adminSessionsService.getNoShowTracker(filters, page);
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
};

export const useSessionsCalendar = (month: string) => {
  return useQuery<SessionsCalendar, ApiError>({
    queryKey: adminSessionsQueryKeys.calendar(month),
    queryFn: async () => {
      const response = await adminSessionsService.getCalendar(month);
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
};
