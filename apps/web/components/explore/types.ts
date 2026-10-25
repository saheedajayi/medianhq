export type ExploreCategory = "All" | "Tech" | "Finance" | "Business" | "Consulting";

export type SortOption = "relevance" | "rating" | "sessions" | "name";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced" | "expert";

export type SessionType = "one-on-one" | "group";

export type AvailabilityOption = "now" | "this-week" | "this-month" | "weekends";

export type MentorGender = "male" | "female";

export interface ExploreMentor {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  sessionCount: number;
  rating: number;
  reviewCount: number;
  bio: string;
  category: "Tech" | "Finance" | "Business" | "Consulting";
  tags: string[];
  avatarUrl: string;
  isFeatured?: boolean;
  /** First open slot in the next two weeks; null when the mentor has none */
  nextAvailability: {
    relative: string; // e.g., "in 3 days"
    formattedDate: string; // e.g., "Wed, 12 August 11:30 AM"
  } | null;
  price?: string;
  pricePerSession?: number;
  experienceLevel?: ExperienceLevel;
  sessionTypes?: SessionType[];
  gender?: MentorGender;
}

export interface ExploreFilterState {
  search: string;
  category: ExploreCategory;
  sortBy: SortOption;
  expertise?: string[];
  locations?: string[];
  minPrice?: number;
  maxPrice?: number;
  availability?: AvailabilityOption[];
  sessionTypes?: SessionType[];
  minRating?: number;
  experienceLevels?: ExperienceLevel[];
  gender?: MentorGender;
}
