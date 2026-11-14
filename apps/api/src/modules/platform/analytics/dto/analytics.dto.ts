/** Events the web app reports itself; searches and profile views are logged by the API */
export const BEACON_EVENT_TYPES = ['PAGE_VIEW', 'BOOK_CLICK'] as const;
export type BeaconEventType = (typeof BEACON_EVENT_TYPES)[number];

/** The beacon body, as it arrives */
export interface AnalyticsBeaconDto {
  type?: unknown;
  path?: unknown;
  mentorId?: unknown;
}

/** The mentor search filters worth counting, by the name the admin page shows */
export const SEARCH_FILTER_NAMES = {
  category: 'Category',
  priceType: 'Price',
  minRating: 'Rating',
  location: 'Location',
} as const;
