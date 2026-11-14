export type NoShowRisk = "HIGH" | "MEDIUM" | "LOW";
export type NoShowStatus = "ALERT" | "WARNING" | "CLEAR";
export type RecordingConsent = "BOTH" | "MENTOR" | "MENTEE";

export type AdminSessionPerson = {
  id: string;
  name: string;
  avatarUrl: string | null;
  /** Job title for a mentor, current role for a mentee */
  role: string | null;
  country: string | null;
};

export type AdminSession = {
  id: string;
  /** The session's title, which the designs call its type */
  type: string;
  startsAt: string;
  durationMinutes: number;
  status: string;
  mentor: AdminSessionPerson;
  mentee: AdminSessionPerson;
  rating: number | null;
};

type Paged<T> = { items: T[]; total: number; page: number; pageSize: number };

export type LiveSessionsPage = Paged<AdminSession>;

export type CompletedSessionsFilters = {
  search?: string;
  range?: "7d" | "30d" | "90d";
  mentorId?: string;
  menteeId?: string;
  /** A minimum star rating, or "unrated" */
  rating?: "5" | "4" | "3" | "unrated";
  type?: string;
};

export type CompletedSessionsPage = Paged<AdminSession> & {
  mentors: { id: string; name: string }[];
  mentees: { id: string; name: string }[];
  types: string[];
};

export type AdminRecording = {
  id: string;
  sessionId: string;
  type: string;
  startsAt: string;
  durationMinutes: number;
  mentor: AdminSessionPerson;
  mentee: AdminSessionPerson;
  consent: RecordingConsent;
  recording: { format: string; sizeMb: number; recordedAt: string };
};

export type RecordingsPage = Paged<AdminRecording> & {
  stats: { total: number; totalChangePct: number; dualConsent: number; pendingDeletion: number };
};

export type NoShowTrackerFilters = {
  search?: string;
  consecutive?: "1" | "2+";
  mentorType?: string;
  status?: NoShowStatus;
  range: "7d" | "30d" | "90d";
};

export type NoShowTrackerRow = {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: string | null;
  mentorType: string;
  /** Mentor no-shows within the selected range */
  noShows: number;
  consecutiveMisses: number;
  status: NoShowStatus;
  lastMissAt: string | null;
};

export type NoShowTrackerPage = Paged<NoShowTrackerRow> & {
  range: NoShowTrackerFilters["range"];
  mentorTypes: string[];
  stats: {
    totalMentors: number;
    totalMentorsChangePct: number;
    withOneMiss: number;
    withConsecutiveMisses: number;
    totalNoShows: number;
    noShowPctOfScheduled: number;
  };
};

export type CalendarSession = AdminSession & { risk: NoShowRisk };

export type SessionsCalendar = {
  /** YYYY-MM */
  month: string;
  sessions: CalendarSession[];
};
