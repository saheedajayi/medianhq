export interface MentorTimelineItem {
  role: string;
  company: string;
  period: string;
}

export interface MentorReview {
  id: string;
  authorName: string;
  authorAvatar?: string;
  date: string;
  rating: number;
  comment: string;
}

export interface SessionPackage {
  id: string;
  title: string;
  durationMinutes: number;
  price: string; // "Free" or "₦20,000"
  numericPrice: number; // 0 or 20000
  description: string;
}

export interface AvailableDateSlot {
  dateString: string; // "2026-06-07"
  dayOfWeek: string; // "SUN"
  dayNumber: string; // "07"
  month: string; // "Jun"
  slotsCount: number;
  times: string[]; // ["3:00PM", "3:30PM", "4:00PM", "4:30PM"]
}

export interface GroupSessionEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  imageUrl: string;
  spotsLeft: number;
}

export interface MentorDetailProfile {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  sessionCount: number;
  rating: number;
  reviewCount: number;
  avatarUrl: string;
  socials: {
    website?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  bio: string;
  expertise: string[];
  experience: MentorTimelineItem[];
  reviews: MentorReview[];
  packages: SessionPackage[];
  availableDates: AvailableDateSlot[];
  groupSessions: GroupSessionEvent[];
}
