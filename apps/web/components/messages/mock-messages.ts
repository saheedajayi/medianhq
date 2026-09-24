import type { ConversationSummary, Message } from "@/services/messages";

export interface ExtendedConversation extends ConversationSummary {
  sessionBadge?: string;
  isTyping?: boolean;
  statusIcon?: "read" | "delivered" | "none";
}

export const mockConversations: ExtendedConversation[] = [
  {
    id: "conv-1",
    participant: {
      id: "mentor-1",
      name: "Mujeedah Ashiru",
      avatar: "/mentors/mentor-1.png",
      role: "Career Coach",
      isOnline: true,
    },
    lastMessage: {
      content: "Typing...",
      createdAt: new Date().toISOString(),
      senderId: "mentor-1",
    },
    isTyping: true,
    unreadCount: 5,
    sessionBadge: "Career Positioning · June 8, 2026 · 3:00 pm",
    statusIcon: "none",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "conv-2",
    participant: {
      id: "mentor-2",
      name: "AbduLlah Mumuni",
      avatar: "/mentors/mentor-2.png",
      role: "Product Manager",
      isOnline: true,
    },
    lastMessage: {
      content: "Typing...",
      createdAt: new Date().toISOString(),
      senderId: "mentor-2",
    },
    isTyping: true,
    unreadCount: 5,
    sessionBadge: "Product Strategy · June 9, 2026 · 4:00 pm",
    statusIcon: "none",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "conv-3",
    participant: {
      id: "mentor-3",
      name: "Hannah Oladejo",
      avatar: "/mentors/mentor-3.png",
      role: "UX Designer",
      isOnline: false,
    },
    lastMessage: {
      content: "Good day, I wanted to let you know that...",
      createdAt: "Yesterday",
      senderId: "current-user",
    },
    isTyping: false,
    unreadCount: 0,
    sessionBadge: "Portfolio Review · June 10, 2026 · 2:00 pm",
    statusIcon: "read",
    updatedAt: "Yesterday",
  },
  {
    id: "conv-4",
    participant: {
      id: "mentor-3",
      name: "Hannah Oladejo",
      avatar: "/mentors/mentor-3.png",
      role: "UX Designer",
      isOnline: false,
    },
    lastMessage: {
      content: "Good day, I wanted to let you know that...",
      createdAt: "Yesterday",
      senderId: "current-user",
    },
    isTyping: false,
    unreadCount: 0,
    statusIcon: "read",
    updatedAt: "Yesterday",
  },
  {
    id: "conv-5",
    participant: {
      id: "mentor-3",
      name: "Hannah Oladejo",
      avatar: "/mentors/mentor-3.png",
      role: "UX Designer",
      isOnline: false,
    },
    lastMessage: {
      content: "Good day, I wanted to let you know that...",
      createdAt: "Saturday",
      senderId: "current-user",
    },
    isTyping: false,
    unreadCount: 0,
    statusIcon: "delivered",
    updatedAt: "Saturday",
  },
  {
    id: "conv-6",
    participant: {
      id: "mentor-3",
      name: "Hannah Oladejo",
      avatar: "/mentors/mentor-3.png",
      role: "UX Designer",
      isOnline: false,
    },
    lastMessage: {
      content: "Good day, I wanted to let you know that...",
      createdAt: "Saturday",
      senderId: "current-user",
    },
    isTyping: false,
    unreadCount: 0,
    statusIcon: "delivered",
    updatedAt: "Saturday",
  },
  {
    id: "conv-7",
    participant: {
      id: "mentor-3",
      name: "Hannah Oladejo",
      avatar: "/mentors/mentor-3.png",
      role: "UX Designer",
      isOnline: false,
    },
    lastMessage: {
      content: "Good day, I wanted to let you know that...",
      createdAt: "Saturday",
      senderId: "current-user",
    },
    isTyping: false,
    unreadCount: 0,
    statusIcon: "delivered",
    updatedAt: "Saturday",
  },
];

export const mockMessagesByConversation: Record<string, Message[]> = {
  "conv-1": [
    {
      id: "msg-1-1",
      conversationId: "conv-1",
      senderId: "current-user",
      content:
        "I'm really looking forward to our kickoff meeting tomorrow. To make the most of our time, I've outlined a few goals for this quarter. I'd love to get your input on my current focus and discuss what metrics we should use to measure my progress.",
      isRead: true,
      createdAt: "Today 17:45",
    },
    {
      id: "msg-1-2",
      conversationId: "conv-1",
      senderId: "mentor-1",
      content:
        "Hi Abdullah, great to hear! Let's definitely look at your long-term goals and dial in exactly what areas need the most attention. I'll review your notes. Let's touch base on the best communication channels we should use going forward",
      isRead: true,
      createdAt: "Today 17:45",
    },
    {
      id: "msg-1-3",
      conversationId: "conv-1",
      senderId: "current-user",
      content:
        "I'm really looking forward to our kickoff meeting tomorrow. To make the most of our time, I've outlined a few goals for this quarter. I'd love to get your input on my current focus and discuss what metrics we should use to measure my progress.",
      isRead: true,
      createdAt: "Today 17:45",
    },
  ],
  "conv-2": [
    {
      id: "msg-2-1",
      conversationId: "conv-2",
      senderId: "current-user",
      content: "Hi AbduLlah, thanks for accepting the session request! Looking forward to reviewing the product roadmap with you.",
      isRead: true,
      createdAt: "Today 16:30",
    },
    {
      id: "msg-2-2",
      conversationId: "conv-2",
      senderId: "mentor-2",
      content: "Glad to connect! Please feel free to share the draft ahead of time so I can review it before our call.",
      isRead: true,
      createdAt: "Today 16:40",
    },
  ],
  "conv-3": [
    {
      id: "msg-3-1",
      conversationId: "conv-3",
      senderId: "current-user",
      content: "Good day, I wanted to let you know that I've updated the Figma file with the latest feedback from our design critique session.",
      isRead: true,
      createdAt: "Yesterday",
    },
  ],
};
