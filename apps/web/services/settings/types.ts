export const NOTIFICATION_TYPES = [
  { value: "bookingUpdates", label: "Booking updates" },
  { value: "cancellations", label: "Cancellations" },
  { value: "sessionReminders", label: "Session reminders" },
  { value: "messages", label: "New messages" },
  { value: "actionItems", label: "Action items" },
  { value: "community", label: "Community activity" },
  { value: "achievements", label: "Achievements" },
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number]["value"];
export type NotificationChannel = "email" | "inApp";
export type NotificationPreferences = Partial<
  Record<NotificationType, Partial<Record<NotificationChannel, boolean>>>
>;

export interface MySettings {
  settings: {
    timezone: string;
    notificationPreferences: NotificationPreferences;
  };
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    menteeProfile?: {
      gender?: string | null;
      location?: string | null;
      bio?: string | null;
      avatarUrl?: string | null;
    } | null;
  };
}

export interface UpdateSettingsPayload {
  timezone?: string;
  notificationPreferences?: NotificationPreferences;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  gender?: string;
  location?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface CareerDates {
  startMonth: number;
  startYear: number;
  endMonth: number | null;
  endYear: number | null;
  isCurrent: boolean;
  skills: string[];
  tools: string[];
}

export interface WorkExperiencePayload extends CareerDates {
  role: string;
  company: string;
  industry: string | null;
  contribution: string | null;
}

export interface EducationPayload extends CareerDates {
  fieldOfStudy: string;
  school: string;
  learnings: string | null;
}

export type WorkExperience = WorkExperiencePayload & { id: string };
export type Education = EducationPayload & { id: string };

export interface CareerInfo {
  experiences: WorkExperience[];
  educations: Education[];
}

export interface SocialLink {
  id: string;
  kind: "LINKEDIN" | "X" | "WEBSITE" | "CUSTOM";
  title: string | null;
  url: string;
}

export interface SocialLinksPayload {
  linkedinUrl: string;
  twitterUrl: string;
  websiteUrl: string;
  links: { title: string; url: string }[];
}
