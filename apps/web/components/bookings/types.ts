export type BookingTab = "upcoming" | "pending" | "past" | "cancelled";

/** Whose bookings page this is; copy and actions differ between the two sides */
export type ViewerRole = "mentee" | "mentor";

export type BookingStatus =
  | "confirmed"
  | "unconfirmed"
  | "awaiting_confirmation"
  | "completed"
  | "cancelled"
  | "declined"
  | "expired"
  | "no_show";

export interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Booking {
  id: string;
  title: string;
  /** The other person in the booking: the mentor for a mentee, the mentee for a mentor */
  participantId?: string;
  participantName: string;
  participantRole: string;
  participantAvatar: string;
  /** The mentor's user ID, for looking up open slots when rescheduling */
  mentorId?: string;
  /** Which of the mentor's sessions was booked; null for their standard 1:1 */
  mentorSessionId?: string | null;
  linkedinUrl?: string;
  startsAt?: string;
  timeFormatted: string;
  relativeDate: string;
  fullDateTime: string;
  duration: string;
  durationMinutes: number;
  price: string;
  status: BookingStatus;
  statusLabel?: string;
  tab: BookingTab;
  note?: string;
  goals?: string[];
  meetingUrl?: string;
  isReadyToJoin?: boolean;
  /** When the mentor's 24 hours to accept run out (pending requests only) */
  respondBy?: string;
  rating?: number;
  review?: string;
  actionItems?: ActionItem[];
  sessionNotes?: string;
  hasMenteeReviewed?: boolean;
  /** The mentor's review of the mentee; its action items and notes also fill actionItems/sessionNotes */
  feedback?: { rating: number; comment?: string; actionItems: ActionItem[]; followUpNotes?: string } | null;
  hasMentorReviewed?: boolean;
  /** Mentor view only: what they earn from this booking after Median's fee */
  payout?: string;
  earnings?: { gross: string; platformFee: string; net: string };
  cancelledBy?: string;
  cancellationNotice?: string;
  cancellationReason?: string;
  refundAmount?: string;
  absentee?: string;
  isNoShow?: boolean;
  /** LiveKit wss:// server URL — populated when "Join session" is clicked */
  livekitUrl?: string;
  /** Short-lived LiveKit JWT for this participant */
  livekitToken?: string;
}

export type MeetingFlowState =
  | "none"
  | "lobby"
  | "recording_consent"
  | "live_room"
  | "review"
  | "completed";

export type RecordingOption = "do_not_record" | "record";
