export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  hasConflict?: boolean;
}

export interface DaySchedule {
  dayOfWeek: number; // 1 = Monday, 7 = Sunday
  name: string;
  isActive: boolean;
  slots: TimeSlot[];
}

export interface DateOverride {
  id: string;
  dateStr: string; // e.g. "Thu, May 16, 2024" or "2024-05-16"
  startTime: string; // e.g. "5:00 AM"
  endTime: string; // e.g. "10:00 PM"
}

export interface ConflictDetails {
  title: string;
  timeRange: string;
  source: string;
}

export interface AvailabilitySettings {
  startDate: string;
  endDate: string;
  timezone: string;
  bufferBefore: string;
  bufferAfter: string;
  sessionStartTimes: string;
  minimumNotice: string;
  googleCalendarConnected: boolean;
  googleCalendarEmail?: string;
  outlookConnected: boolean;
}
