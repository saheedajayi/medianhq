import { apiClient } from "@/services/api-client";
import type {
  ContentFlag,
  ModerationFlagsFilters,
  ModerationFlagsPage,
  ModerationHistoryPage,
  ReviewerAction,
} from "./types";

const MODERATION_PATH = "/admin/moderation";

export const adminModerationService = {
  getFlags(filters: ModerationFlagsFilters, page: number) {
    return apiClient.get<ModerationFlagsPage>(`${MODERATION_PATH}/flags`, { params: { ...filters, page } });
  },
  /** Every flag matching the filters, not just one page */
  exportFlags(filters: ModerationFlagsFilters) {
    return apiClient.get<ContentFlag[]>(`${MODERATION_PATH}/flags/export`, { params: filters });
  },
  getHistory(page: number) {
    return apiClient.get<ModerationHistoryPage>(`${MODERATION_PATH}/history`, { params: { page } });
  },
  takeAction(flagId: string, action: ReviewerAction) {
    return apiClient.patch<ContentFlag>(`${MODERATION_PATH}/flags/${encodeURIComponent(flagId)}/action`, { action });
  },
};

export type {
  ContentFlag,
  FlagContentType,
  FlagPerson,
  FlagStatus,
  ModerationFlagsFilters,
  ModerationFlagsPage,
  ModerationHistoryEntry,
  ModerationHistoryPage,
  ReviewerAction,
} from "./types";
