export type NoShowRisk = 'HIGH' | 'MEDIUM' | 'LOW';
export type NoShowStatus = 'ALERT' | 'WARNING' | 'CLEAR';

export interface SessionPerson {
  id: string;
  name: string;
  avatarUrl: string | null;
  /** Job title for a mentor, current role for a mentee */
  role: string | null;
  country: string | null;
}

export interface AdminSessionItem {
  id: string;
  /** The session's title, which is what the designs call its type */
  type: string;
  startsAt: Date;
  durationMinutes: number;
  status: string;
  mentor: SessionPerson;
  mentee: SessionPerson;
  rating: number | null;
}

/** Query strings as they arrive */
export interface LiveSessionsQueryDto {
  page?: number | string;
}

export interface CompletedSessionsQueryDto {
  search?: string;
  range?: string;
  mentorId?: string;
  menteeId?: string;
  rating?: string;
  type?: string;
  page?: number | string;
}

export interface CompletedSessionsFilters {
  search?: string;
  range?: '7d' | '30d' | '90d';
  mentorId?: string;
  menteeId?: string;
  /** A minimum star rating, or "unrated" */
  rating?: '5' | '4' | '3' | 'unrated';
  type?: string;
}

export interface NoShowTrackerQueryDto {
  search?: string;
  consecutive?: string;
  mentorType?: string;
  status?: string;
  range?: string;
  page?: number | string;
}

export interface RecordingsQueryDto {
  page?: number | string;
}

export interface SessionsCalendarQueryDto {
  /** YYYY-MM; the current month when missing or malformed */
  month?: string;
}
