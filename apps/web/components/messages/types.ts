import type { ConversationSummary } from "@/services/messages";

export interface ExtendedConversation extends ConversationSummary {
  sessionBadge?: string;
  isTyping?: boolean;
  statusIcon?: "read" | "delivered" | "none";
}
