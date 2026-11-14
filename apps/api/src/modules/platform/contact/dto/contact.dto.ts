/** What the Contact Us form asks the message to be about */
export const CONTACT_SUBJECTS = [
  'General enquiry',
  'Finding a mentor',
  'Becoming a mentor',
  'Payments and refunds',
  'Partnerships',
  'Report a problem',
] as const;
export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];

/** The Contact Us form, as it arrives */
export interface ContactMessageDto {
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
}
