/**
 * Master switch for preview/dummy data across the app.
 * Set NEXT_PUBLIC_USE_MOCK_DATA=false to turn dummy data off everywhere.
 */
export const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

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
