export type ExploreCategory = "All" | "Tech" | "Finance" | "Business" | "Consulting";

export type SortOption = "relevance" | "rating" | "sessions" | "name";

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
  nextAvailability: {
    relative: string; // e.g., "in 3 days"
    formattedDate: string; // e.g., "Wed, 12 August 11:30 AM"
  };
  price?: string;
}

export interface ExploreFilterState {
  search: string;
  category: ExploreCategory;
  sortBy: SortOption;
  priceType?: "all" | "free" | "paid";
  minRating?: number;
  locations?: string[];
}
