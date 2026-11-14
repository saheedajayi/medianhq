/** The subjects the API accepts, in the order the form lists them */
export const CONTACT_SUBJECTS = [
  "General enquiry",
  "Finding a mentor",
  "Becoming a mentor",
  "Payments and refunds",
  "Partnerships",
  "Report a problem",
] as const;
export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];

export type ContactMessagePayload = {
  firstName: string;
  lastName: string;
  email: string;
  subject: ContactSubject;
  message: string;
};

export type ContactMessageResponse = { message: string };
