export const usersQueryKeys = {
  all: ["users"] as const,
  updateRole: () => [...usersQueryKeys.all, "update-role"] as const,
};
