export const messagesQueryKeys = {
  all: ["messages"] as const,
  conversations: () => [...messagesQueryKeys.all, "conversations"] as const,
  contact: (userId: string) => [...messagesQueryKeys.all, "contact", userId] as const,
  delivered: () => [...messagesQueryKeys.all, "delivered"] as const,
  thread: (conversationId: string) =>
    [...messagesQueryKeys.all, "thread", conversationId] as const,
  realtimeToken: () => [...messagesQueryKeys.all, "realtime-token"] as const,
  send: () => [...messagesQueryKeys.all, "send"] as const,
  edit: () => [...messagesQueryKeys.all, "edit"] as const,
  remove: () => [...messagesQueryKeys.all, "remove"] as const,
  markRead: () => [...messagesQueryKeys.all, "mark-read"] as const,
  report: () => [...messagesQueryKeys.all, "report"] as const,
};
