export interface CreateBookingPayload {
  mentorId: string;
  /** The mentor's session being booked; omitted for their standard 1:1 */
  mentorSessionId?: string;
  /** Must be one of the slots from the mentor's availability */
  startsAt: string;
  notes?: string;
  goals?: string[];
}

export interface CancelBookingPayload {
  id: string;
  reason?: string;
}

export interface RescheduleBookingPayload {
  id: string;
  startsAt: string;
  reason?: string;
}

export interface BookingMutationResponse {
  success: boolean;
  booking: any;
}

export interface RoomTokenResponse {
  token: string;
  roomName: string;
  serverUrl: string;
}

export interface BookingActionItem {
  id: string;
  text: string;
  completed: boolean;
}

/** The mentor's review of the mentee after a session */
export interface MenteeFeedback {
  rating: number;
  comment?: string;
  actionItems: BookingActionItem[];
  followUpNotes?: string;
}

export interface BookingResponse {
  id: string;
  title: string;
  /** The other person in the booking: the mentor for a mentee, the mentee for a mentor */
  participantId: string;
  participantName: string;
  participantRole: string;
  participantAvatar: string;
  /** The mentor's user ID, for looking up their open slots */
  mentorId: string;
  /** Which of the mentor's sessions was booked; null for their standard 1:1 */
  mentorSessionId?: string | null;
  /** The mentee's goals from their profile */
  goals?: string[];
  linkedinUrl?: string;
  startsAt: string;
  timeFormatted: string;
  relativeDate: string;
  fullDateTime: string;
  duration: string;
  durationMinutes: number;
  price: string;
  status: string;
  statusLabel?: string;
  tab: "upcoming" | "pending" | "past" | "cancelled";
  note?: string;
  meetingUrl?: string;
  /** When the mentor's 24 hours to accept run out (pending requests only) */
  respondBy?: string;
  /** When the mentee made the booking */
  requestedAt?: string;
  isReadyToJoin?: boolean;
  /** The mentee's review of the session */
  rating?: number;
  review?: string;
  hasMenteeReviewed?: boolean;
  feedback?: MenteeFeedback | null;
  hasMentorReviewed?: boolean;
  actionItems?: BookingActionItem[];
  sessionNotes?: string;
  cancelledBy?: string;
  cancellationNotice?: string;
  cancellationReason?: string;
  refundAmount?: string;
  absentee?: string;
  isNoShow?: boolean;
  /** Mentor view only: what they earn from this booking after Median's fee */
  payout?: string;
  earnings?: { gross: string; platformFee: string; net: string };
  isMentee?: boolean;
}

export interface DeclineBookingPayload {
  id: string;
  reason?: string;
}

export interface MenteeFeedbackPayload {
  bookingId: string;
  rating: number;
  comment?: string;
  actionItems: BookingActionItem[];
  followUpNotes?: string;
}

export interface AvailableDay {
  /** Mentor-local date, e.g. "2026-10-27" */
  date: string;
  dayOfWeek: number;
  /** ISO timestamps of each bookable start time */
  slots: string[];
}
