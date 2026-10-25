export const menteesQueryKeys = {
  all: ["mentees"] as const,
  createProfile: () => [...menteesQueryKeys.all, "create-profile"] as const,
};
