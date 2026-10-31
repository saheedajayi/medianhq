export type CreateReviewDto = {
  bookingId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  npsScore?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
};
