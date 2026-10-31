export type ExploreCategory =
  | 'All'
  | 'Tech'
  | 'Finance'
  | 'Business'
  | 'Consulting';

export type SortOption = 'relevance' | 'rating' | 'sessions' | 'name';

export interface ExploreMentorsQueryDto {
  search?: string;
  category?: string;
  priceType?: 'all' | 'free' | 'paid';
  minRating?: number | string;
  location?: string;
  sortBy?: SortOption;
  page?: number | string;
  limit?: number | string;
}

export interface ExploreMentorItem {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  sessionCount: number;
  rating: number;
  reviewCount: number;
  bio: string;
  category: 'Tech' | 'Finance' | 'Business' | 'Consulting';
  tags: string[];
  avatarUrl: string;
  isFeatured: boolean;
  /** First open slot in the next two weeks; null when the mentor has none */
  nextAvailability: {
    relative: string;
    formattedDate: string;
  } | null;
  price: string;
  pricePerSession: number;
  currency: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  sessionTypes: Array<'one-on-one' | 'group'>;
  gender?: string;
}

export interface PaginatedExploreMentorsResponse {
  data: ExploreMentorItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
