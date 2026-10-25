import type { ConversationSummary, MessageStatus } from "@/services/messages";

export interface ExtendedConversation extends ConversationSummary {
  sessionBadge?: string;
  isTyping?: boolean;
  /** Ticks for the last message when you sent it; "none" when it came from them */
  statusIcon?: MessageStatus | "none";
}
