/**
 * All dummy/preview data lives in this folder, one file per domain.
 * Components must import mocks from "@/mocks" only, so removing this
 * folder (and its imports) is all it takes to pull the dummy data out.
 */
export { USE_MOCK_DATA, MOCK_DATA_PAGES, isMockDataEnabled } from "./config";
export type { MockDataPage } from "./config";
export { mockExploreMentors } from "./mentors";
export { defaultMentorProfile, mentorsDirectory } from "./mentor-profiles";
export { mockBookings } from "./bookings";
export { mockConversations, mockMessagesByConversation } from "./messages";
