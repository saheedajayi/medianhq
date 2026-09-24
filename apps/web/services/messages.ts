import { apiClient } from "./api-client";

const MESSAGES_PATH = "/messages";

export interface ConversationParticipant {
  id: string;
  name: string;
  avatar: string | null;
  role: string | null;
  isOnline?: boolean;
}

export interface ConversationSummary {
  id: string;
  participant: ConversationParticipant | null;
  lastMessage: {
    content: string;
    createdAt: string;
    senderId?: string;
  } | null;
  unreadCount: number;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
}

export interface SendMessagePayload {
  recipientId: string;
  content: string;
}

export interface EditMessagePayload {
  content: string;
}

export interface ReportMessagePayload {
  messageId: string;
  reason: string;
  note?: string;
}

export const messagesService = {
  /** List all conversations for the current user */
  listConversations() {
    return apiClient
      .get<ConversationSummary[]>(`${MESSAGES_PATH}/conversations`)
      .then((r) => r.data);
  },

  /** Get all messages in a conversation */
  getMessages(conversationId: string) {
    return apiClient
      .get<Message[]>(`${MESSAGES_PATH}/${conversationId}`)
      .then((r) => r.data);
  },

  /** Send a new message to a recipient (creates conversation if none exists) */
  sendMessage(payload: SendMessagePayload) {
    return apiClient
      .post<Message>(MESSAGES_PATH, payload)
      .then((r) => r.data);
  },

  /** Edit an existing message */
  editMessage(messageId: string, payload: EditMessagePayload) {
    return apiClient
      .patch<Message>(`${MESSAGES_PATH}/message/${messageId}`, payload)
      .then((r) => r.data);
  },

  /** Delete a message */
  deleteMessage(messageId: string) {
    return apiClient
      .delete<{ success: boolean }>(`${MESSAGES_PATH}/message/${messageId}`)
      .then((r) => r.data);
  },

  /** Mark all messages in a conversation as read */
  markConversationRead(conversationId: string) {
    return apiClient
      .post<{ success: boolean }>(`${MESSAGES_PATH}/${conversationId}/read`, {})
      .then((r) => r.data);
  },

  /** Report a message */
  reportMessage(payload: ReportMessagePayload) {
    return apiClient
      .post<{ success: boolean }>(`${MESSAGES_PATH}/report`, payload)
      .then((r) => r.data);
  },
};
