export const bookingsQueryKeys = {
  all: ["bookings"] as const,
  mine: () => [...bookingsQueryKeys.all, "mine"] as const,
  availability: (mentorId: string, durationMinutes?: number, excludeBookingId?: string) =>
    [...bookingsQueryKeys.all, "availability", mentorId, durationMinutes ?? null, excludeBookingId ?? null] as const,
  accept: () => [...bookingsQueryKeys.all, "accept"] as const,
  decline: () => [...bookingsQueryKeys.all, "decline"] as const,
  feedback: () => [...bookingsQueryKeys.all, "feedback"] as const,
  create: () => [...bookingsQueryKeys.all, "create"] as const,
  cancel: () => [...bookingsQueryKeys.all, "cancel"] as const,
  reschedule: () => [...bookingsQueryKeys.all, "reschedule"] as const,
  roomToken: () => [...bookingsQueryKeys.all, "room-token"] as const,
};
