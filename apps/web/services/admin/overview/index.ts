import { apiClient } from "@/services/api-client";
import type { AdminOverview, AdminOverviewRange } from "./types";

const OVERVIEW_PATH = "/admin/overview";

export const adminOverviewService = {
  getOverview(range: AdminOverviewRange) {
    return apiClient.get<AdminOverview>(OVERVIEW_PATH, { params: { range } });
  },
};

export type {
  AdminHealthStatus,
  AdminOverview,
  AdminOverviewActivityDay,
  AdminOverviewAlert,
  AdminOverviewRange,
} from "./types";
