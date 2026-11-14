import { apiClient } from "@/services/api-client";
import type {
  AdminSession,
  CompletedSessionsFilters,
  CompletedSessionsPage,
  LiveSessionsPage,
  NoShowTrackerFilters,
  NoShowTrackerPage,
  RecordingPlayback,
  RecordingsFilters,
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
  getRecordings(filters: RecordingsFilters, page: number) {
    return apiClient.get<RecordingsPage>(`${SESSIONS_PATH}/recordings`, { params: { ...filters, page } });
  },
  /** Every call is recorded in the audit log against the mentor and the mentee */
  getRecordingPlayback(recordingId: string) {
    return apiClient.get<RecordingPlayback>(`${SESSIONS_PATH}/recordings/${recordingId}/playback`);
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
  RecordingPlayback,
  RecordingsFilters,
  RecordingsPage,
  SessionsCalendar,
} from "./types";
