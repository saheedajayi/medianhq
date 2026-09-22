export type BookingTab = "upcoming" | "pending" | "past" | "cancelled";

export type BookingStatus =
  | "confirmed"
  | "unconfirmed"
  | "awaiting_confirmation"
  | "completed"
  | "cancelled"
  | "no_show";

export interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Booking {
  id: string;
  title: string;
  mentorName: string;
  mentorRole: string;
  mentorAvatar: string;
  linkedinUrl?: string;
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
  rating?: number;
  review?: string;
  actionItems?: ActionItem[];
  sessionNotes?: string;
  hasMenteeReviewed?: boolean;
  cancelledBy?: string;
  cancellationNotice?: string;
  cancellationReason?: string;
  refundAmount?: string;
  absentee?: string;
  isNoShow?: boolean;
}

export type MeetingFlowState =
  | "none"
  | "lobby"
  | "recording_consent"
  | "live_room"
  | "review"
  | "completed";

export type RecordingOption = "do_not_record" | "record";
