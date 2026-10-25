import { apiClient } from "@/services/api-client";
import type {
  ContactResponse,
  ConversationSummary,
  EditMessagePayload,
  Message,
  RealtimeTokenResponse,
  ReportMessagePayload,
  SendMessagePayload,
} from "./types";

const MESSAGES_PATH = "/messages";

export const messagesService = {
  /** Get LiveKit realtime token for current user's inbox room */
  getLiveKitToken() {
    return apiClient.get<RealtimeTokenResponse>(`${MESSAGES_PATH}/token`);
  },

  /** List all conversations for the current user */
  listConversations() {
    return apiClient.get<ConversationSummary[]>(`${MESSAGES_PATH}/conversations`);
  },

  /** Get all messages in a conversation */
  getMessages(conversationId: string) {
    return apiClient.get<Message[]>(`${MESSAGES_PATH}/${conversationId}`);
  },

  /** Send a new message to a recipient (creates conversation if none exists) */
  sendMessage(payload: SendMessagePayload) {
    return apiClient.post<Message>(MESSAGES_PATH, payload);
  },

  /** Edit an existing message */
  editMessage(messageId: string, payload: EditMessagePayload) {
    return apiClient.patch<Message>(`${MESSAGES_PATH}/message/${messageId}`, payload);
  },

  /** Delete a message */
  deleteMessage(messageId: string) {
    return apiClient.delete<{ success: boolean }>(`${MESSAGES_PATH}/message/${messageId}`);
  },

  /** Open a chat with someone from a booking: their existing conversation, or their details for a new one */
  getContact(userId: string) {
    return apiClient.get<ContactResponse>(`${MESSAGES_PATH}/contacts/${userId}`);
  },

  /** Tell the sender their messages reached this device (second grey tick) */
  markDelivered(conversationId: string) {
    return apiClient.post<{ success: boolean }>(`${MESSAGES_PATH}/${conversationId}/delivered`, {});
  },

  /** Mark all messages in a conversation as read */
  markConversationRead(conversationId: string) {
    return apiClient.post<{ success: boolean }>(`${MESSAGES_PATH}/${conversationId}/read`, {});
  },

  /** Report a message */
  reportMessage(payload: ReportMessagePayload) {
    return apiClient.post<{ success: boolean }>(`${MESSAGES_PATH}/report`, payload);
  },
};

export type {
  ContactResponse,
  ConversationParticipant,
  ConversationSummary,
  EditMessagePayload,
  EditMessageVariables,
  Message,
  MessageStatus,
  RealtimeTokenResponse,
  ReportMessagePayload,
  SendMessagePayload,
} from "./types";
