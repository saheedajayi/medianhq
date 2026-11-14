import { apiClient } from "@/services/api-client";
import type {
  AdminApplicationDetail,
  AdminApplicationRow,
  AdminApplicationsFilters,
  AdminApplicationsPage,
  AdminChecklistItem,
} from "./types";

const APPLICATIONS_PATH = "/admin/applications";
const applicationPath = (applicationId: string) => `${APPLICATIONS_PATH}/${encodeURIComponent(applicationId)}`;

export const adminApplicationsService = {
  getApplications(filters: AdminApplicationsFilters, page: number) {
    return apiClient.get<AdminApplicationsPage>(APPLICATIONS_PATH, { params: { ...filters, page } });
  },
  /** Every application matching the filters, not just one page */
  exportApplications(filters: AdminApplicationsFilters) {
    return apiClient.get<AdminApplicationRow[]>(`${APPLICATIONS_PATH}/export`, { params: filters });
  },
  getApplication(applicationId: string) {
    return apiClient.get<AdminApplicationDetail>(applicationPath(applicationId));
  },
  /** A null reviewer clears the assignment */
  assignReviewer(applicationIds: string[], reviewerId: string | null) {
    return apiClient.patch(`${APPLICATIONS_PATH}/reviewer`, { applicationIds, reviewerId });
  },
  saveReview(applicationId: string, review: { checklist?: Record<AdminChecklistItem, boolean>; note?: string }) {
    return apiClient.patch(`${applicationPath(applicationId)}/review`, review);
  },
  approve(applicationId: string) {
    return apiClient.patch(`${applicationPath(applicationId)}/approve`);
  },
  reject(applicationId: string, reason?: string) {
    return apiClient.patch(`${applicationPath(applicationId)}/reject`, { reason });
  },
};

export type {
  AdminApplicationDetail,
  AdminApplicationRow,
  AdminApplicationsFilters,
  AdminApplicationsPage,
  AdminApplicationStatus,
  AdminChecklistItem,
  AdminDecisionEmail,
} from "./types";
