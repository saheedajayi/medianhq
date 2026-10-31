export type CreateBookingDto = {
  mentorId: string;
  startsAt: string;
  durationMinutes: 30 | 45 | 60;
  notes?: string;
};
