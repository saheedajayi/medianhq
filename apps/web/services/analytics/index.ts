import { apiClient } from "@/services/api-client";
import type { AnalyticsBeacon } from "./types";
import { getVisitorId, VISITOR_HEADER } from "./visitor-id";

// Lets the API count signed-out visitors' searches and profile views once each.
// Registered when the app's providers load the page view tracker.
apiClient.interceptors.request.use((config) => {
  const visitorId = getVisitorId();
  if (visitorId) config.headers.set(VISITOR_HEADER, visitorId);
  return config;
});

export const analyticsService = {
  /** Fire and forget: analytics never gets in the way of what the person is doing */
  track(event: AnalyticsBeacon) {
    void apiClient.post("/analytics/events", event).catch(() => undefined);
  },
};

export { getVisitorId, VISITOR_HEADER } from "./visitor-id";
export type { AnalyticsBeacon } from "./types";
