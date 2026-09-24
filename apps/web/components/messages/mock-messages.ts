import type { ConversationSummary, Message } from "@/services/messages";

export const mockConversations: ConversationSummary[] = [
  {
    id: "conv-1",
    participant: {
      id: "mentor-1",
      name: "Mujeedah Ashiru",
      avatar: "https://i.pravatar.cc/150?u=mentor-1",
      role: "Career Coach",
      isOnline: true,
    },
    lastMessage: {
      content: "Typing...",
      createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      senderId: "mentor-1",
    },
    unreadCount: 5,
    updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: "conv-2",
    participant: {
      id: "mentor-2",
      name: "AbduLlah Mumuni",
      avatar: "https://i.pravatar.cc/150?u=mentor-2",
      role: "Product Manager",
      isOnline: true,
    },
    lastMessage: {
      content: "Typing...",
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      senderId: "mentor-2",
    },
    unreadCount: 5,
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "conv-3",
    participant: {
      id: "mentor-3",
      name: "Hannah Oladejo",
      avatar: "https://i.pravatar.cc/150?u=mentor-3",
      role: "UX Designer",
      isOnline: false,
    },
    lastMessage: {
      content: "Good day, I wanted to let you know that...",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      senderId: "mentee-current",
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "conv-4",
    participant: {
      id: "mentor-3",
      name: "Hannah Oladejo",
      avatar: "https://i.pravatar.cc/150?u=mentor-3",
      role: "UX Designer",
      isOnline: false,
    },
    lastMessage: {
      content: "Good day, I wanted to let you know that...",
      createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
      senderId: "mentee-current",
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "conv-5",
    participant: {
      id: "mentor-3",
      name: "Hannah Oladejo",
      avatar: "https://i.pravatar.cc/150?u=mentor-3",
      role: "UX Designer",
      isOnline: false,
    },
    lastMessage: {
      content: "Good day, I wanted to let you know that...",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      senderId: "mentor-3",
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockMessages: Record<string, Message[]> = {
  "conv-1": [
    {
      id: "msg-1",
      conversationId: "conv-1",
      senderId: "mentee-current",
      content:
        "I'm really looking forward to our kickoff meeting tomorrow. To make the most of our time, I've outlined a few goals for this quarter. I'd love to get your input on my current focus and discuss what metrics we should use to measure my progress.",
      isRead: true,
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: "msg-2",
      conversationId: "conv-1",
      senderId: "mentor-1",
      content:
        "Hi Abdullah, great to hear! Let's definitely look at your long-term goals and dial in exactly what areas need the most attention. I'll review your notes. Let's touch base on the best communication channels we should use going forward",
      isRead: true,
      createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    },
    {
      id: "msg-3",
      conversationId: "conv-1",
      senderId: "mentee-current",
      content:
        "I'm really looking forward to our kickoff meeting tomorrow. To make the most of our time, I've outlined a few goals for this quarter. I'd love to get your input on my current focus and discuss what metrics we should use to measure my progress.",
      isRead: true,
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
  ],
};
