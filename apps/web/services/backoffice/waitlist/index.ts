import { apiClient } from "@/services/api-client";
import type { WaitlistDashboard } from "./types";

const WAITLIST_PATH = "/backoffice/waitlist";
export const WAITLIST_PAGE_SIZE = 20;

export const backofficeWaitlistService = {
  /** The backoffice has no user accounts; the access key it was opened with is the credential */
  async getDashboard(page: number, accessKey: string, signal?: AbortSignal) {
    try {
      const response = await apiClient.get<WaitlistDashboard>(WAITLIST_PATH, {
        params: { page, limit: WAITLIST_PAGE_SIZE },
        headers: { "x-backoffice-key": accessKey },
        signal,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        (error as { message?: string })?.message || "Unable to load waitlist data.",
      );
    }
  },
};

export type {
  WaitlistAudience,
  WaitlistDashboard,
  WaitlistEntry,
  WaitlistPagination,
} from "./types";
