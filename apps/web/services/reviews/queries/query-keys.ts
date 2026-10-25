export const reviewsQueryKeys = {
  all: ["reviews"] as const,
  byMentor: (mentorId: string) => [...reviewsQueryKeys.all, "mentor", mentorId] as const,
  create: () => [...reviewsQueryKeys.all, "create"] as const,
};
