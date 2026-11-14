export const emailsQueryKeys = {
  all: ["emails"] as const,
  unsubscribe: () => [...emailsQueryKeys.all, "unsubscribe"] as const,
};
