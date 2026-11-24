import type { MentorLink, MentorReview, MentorTimelineItem } from "@/components/mentors/types";

/** A mentee's profile as a mentor sees it */
export interface MenteeDetailProfile {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  sessionCount: number;
  rating: number;
  reviewCount: number;
  avatarUrl: string;
  links: MentorLink[];
  bio: string;
  expertise: string[];
  experience: MentorTimelineItem[];
  /** Feedback from mentors after their sessions */
  reviews: MentorReview[];
}
