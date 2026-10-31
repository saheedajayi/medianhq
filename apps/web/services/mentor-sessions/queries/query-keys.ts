export const mentorSessionsQueryKeys = {
  all: ["mentor-sessions"] as const,
  list: () => [...mentorSessionsQueryKeys.all, "list"] as const,
  stats: (id: string) => [...mentorSessionsQueryKeys.all, "stats", id] as const,
  availability: () => [...mentorSessionsQueryKeys.all, "availability"] as const,
  create: () => [...mentorSessionsQueryKeys.all, "create"] as const,
  update: () => [...mentorSessionsQueryKeys.all, "update"] as const,
  remove: () => [...mentorSessionsQueryKeys.all, "remove"] as const,
  saveAvailability: () => [...mentorSessionsQueryKeys.all, "save-availability"] as const,
};
