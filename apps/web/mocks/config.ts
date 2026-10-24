/**
 * Master switch for preview/dummy data across the app.
 * Off unless NEXT_PUBLIC_USE_MOCK_DATA=true, so a build without the variable
 * (e.g. production) never shows dummy data.
 */
export const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

/**
 * Per-page switches. Set a page to `false` to show only real API data
 * (and its empty states) there, regardless of the master switch.
 */
export const MOCK_DATA_PAGES = {
  dashboard: false,
  explore: true,
  mentorProfile: true,
  bookings: false,
  messages: true,
} as const;

export type MockDataPage = keyof typeof MOCK_DATA_PAGES;

export function isMockDataEnabled(page: MockDataPage): boolean {
  return USE_MOCK_DATA && MOCK_DATA_PAGES[page];
}
