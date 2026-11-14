/** Events the web app reports; searches and profile views are logged by the API itself */
export type AnalyticsBeacon =
  | { type: "PAGE_VIEW"; path: string }
  | { type: "BOOK_CLICK"; mentorId: string; path?: string };
