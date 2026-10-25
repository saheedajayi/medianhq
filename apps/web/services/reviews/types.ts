export interface CreateReviewPayload {
  bookingId: string;
  rating: number;
  comment?: string;
  npsScore?: number;
}

export interface CreateReviewResponse {
  success: boolean;
  review: any;
}

export interface MentorReviewsResponse {
  count: number;
  avgRating: number;
  reviews: any[];
}
