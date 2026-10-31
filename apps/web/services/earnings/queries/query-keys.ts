export const earningsQueryKeys = {
  all: ["earnings"] as const,
  mentorSummary: () => [...earningsQueryKeys.all, "mentor-summary"] as const,
};
