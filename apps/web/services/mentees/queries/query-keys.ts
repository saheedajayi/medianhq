export const menteesQueryKeys = {
  all: ["mentees"] as const,
  detail: (id: string) => [...menteesQueryKeys.all, "detail", id] as const,
  createProfile: () => [...menteesQueryKeys.all, "create-profile"] as const,
};
