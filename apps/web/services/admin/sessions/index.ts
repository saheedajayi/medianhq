import { apiClient } from "@/services/api-client";
import type {
  AdminSession,
  CompletedSessionsFilters,
  CompletedSessionsPage,
  LiveSessionsPage,
  NoShowTrackerFilters,
  NoShowTrackerPage,
  RecordingsPage,
  SessionsCalendar,
} from "./types";

const SESSIONS_PATH = "/admin/sessions";

export const adminSessionsService = {
  getLive(page: number) {
    return apiClient.get<LiveSessionsPage>(`${SESSIONS_PATH}/live`, { params: { page } });
  },
  getCompleted(filters: CompletedSessionsFilters, page: number) {
    return apiClient.get<CompletedSessionsPage>(`${SESSIONS_PATH}/completed`, { params: { ...filters, page } });
  },
  /** Every completed session matching the filters, not just one page */
  exportCompleted(filters: CompletedSessionsFilters) {
    return apiClient.get<AdminSession[]>(`${SESSIONS_PATH}/completed/export`, { params: filters });
  },
  getRecordings(page: number) {
    return apiClient.get<RecordingsPage>(`${SESSIONS_PATH}/recordings`, { params: { page } });
  },
  getNoShowTracker(filters: NoShowTrackerFilters, page: number) {
    return apiClient.get<NoShowTrackerPage>(`${SESSIONS_PATH}/no-shows`, { params: { ...filters, page } });
  },
  /** The month is YYYY-MM */
  getCalendar(month: string) {
    return apiClient.get<SessionsCalendar>(`${SESSIONS_PATH}/calendar`, { params: { month } });
  },
};

export type {
  AdminRecording,
  AdminSession,
  AdminSessionPerson,
  CalendarSession,
  CompletedSessionsFilters,
  CompletedSessionsPage,
  LiveSessionsPage,
  NoShowRisk,
  NoShowStatus,
  NoShowTrackerFilters,
  NoShowTrackerPage,
  NoShowTrackerRow,
  RecordingConsent,
  RecordingsPage,
  SessionsCalendar,
} from "./types";
