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
    isRead?: boolean;
    deliveredAt?: string | null;
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
  /** When the recipient's app received it; null until then */
  deliveredAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
}

/** Sent, delivered and read, like WhatsApp; "sending" while the request is in flight */
export type MessageStatus = "sending" | "sent" | "delivered" | "read";

/** Someone to chat with from a booking: their conversation if one exists yet */
export interface ContactResponse {
  conversationId: string | null;
  participant: ConversationParticipant;
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

export interface EditMessageVariables {
  messageId: string;
  content: string;
}

export interface RealtimeTokenResponse {
  token: string;
  roomName: string;
  serverUrl: string;
}
