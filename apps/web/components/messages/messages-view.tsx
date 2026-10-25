"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Message } from "@/services/messages";
import {
  useContact,
  useConversationMessages,
  useConversations,
  useDeleteMessage,
  useEditMessage,
  useMarkConversationRead,
  useMarkDelivered,
  useSendMessage,
} from "@/services/messages/queries/messages.queries";
import { messagesQueryKeys } from "@/services/messages/queries/query-keys";
import type { ExtendedConversation } from "./types";
import { useCurrentUser } from "@/services/auth/queries/auth.queries";
import { useMessagesRealtime } from "./use-messages-realtime";
import { NoMessagesState } from "./no-messages-state";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { ReportModal } from "./report-modal";
import { ConversationSidebar } from "./conversation-sidebar";
import { ChatHeader } from "./chat-header";
import { ChatMessageBubble } from "./chat-message-bubble";
import { ChatInputBar } from "./chat-input-bar";
import { ChatThreadSkeleton, MessagesSkeleton } from "./messages-skeleton";
import { TEMP_MESSAGE_PREFIX, getMessageStatus } from "./message-status";

/** A chat opened from a booking that has no messages yet; the first message creates it */
const DRAFT_PREFIX = "new:";
const isDraftId = (id: string | null) => !!id?.startsWith(DRAFT_PREFIX);

/** Ticks for the list: only when the last message is yours */
function lastMessageStatus(
  lastMessage: ExtendedConversation["lastMessage"],
  currentUserId: string
): ExtendedConversation["statusIcon"] {
  if (!lastMessage || lastMessage.senderId !== currentUserId) return "none";
  return getMessageStatus({
    id: "saved",
    isRead: !!lastMessage.isRead,
    deliveredAt: lastMessage.deliveredAt ?? null,
  });
}

export function MessagesView() {
  const { data: user } = useCurrentUser();
  const currentUserId = user?.id ?? "current-user";
  const isMentor = user?.role === "MENTOR";
  const queryClient = useQueryClient();

  // ?with=<userId> opens (or starts) the chat with that person, e.g. from a booking
  const searchParams = useSearchParams();
  const withUserId = searchParams.get("with");
  const { data: contact, error: contactError } = useContact(withUserId);

  const [conversations, setConversations] = useState<ExtendedConversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);

  const { data: apiConversations, isLoading: isLoadingConversations } = useConversations();
  const { data: threadMessages, isLoading: isLoadingThread } = useConversationMessages(
    isDraftId(selectedConvId) ? null : selectedConvId
  );
  const { mutate: markConversationRead } = useMarkConversationRead();
  const { mutate: markDelivered } = useMarkDelivered();
  const sendMessageMutation = useSendMessage();
  const deleteMessageMutation = useDeleteMessage();
  const editMessageMutation = useEditMessage();

  // In-memory messages cache to provide instant (0ms) conversation switching
  const [messagesCache, setMessagesCache] = useState<Record<string, Message[]>>({});
  const [messages, setMessages] = useState<Message[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [inputContent, setInputContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Options popovers & modals
  const [activeOptionsMsgId, setActiveOptionsMsgId] = useState<string | null>(
    null
  );
  const [reportModalMsgId, setReportModalMsgId] = useState<string | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Mobile state: false = show conversation list, true = show chat view
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  /** Applies a change to a conversation's messages in both the open thread and the cache */
  const updateThread = (conversationId: string, update: (list: Message[]) => Message[]) => {
    setMessagesCache((cache) => ({
      ...cache,
      [conversationId]: update(cache[conversationId] ?? []),
    }));
    if (selectedConvId === conversationId) {
      setMessages(update);
    }
  };

  /** Receipts only touch your own messages: the ones the other person received or read */
  const applyReceipt = (conversationId: string, change: Partial<Message>) => {
    updateThread(conversationId, (list) =>
      list.map((m) =>
        m.senderId === currentUserId && !m.id.startsWith(TEMP_MESSAGE_PREFIX)
          ? { ...m, ...change, deliveredAt: m.deliveredAt ?? change.deliveredAt ?? null }
          : m
      )
    );
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== conversationId || !c.lastMessage) return c;
        const lastMessage = {
          ...c.lastMessage,
          isRead: change.isRead ?? c.lastMessage.isRead,
          deliveredAt: c.lastMessage.deliveredAt ?? change.deliveredAt ?? null,
        };
        return { ...c, lastMessage, statusIcon: lastMessageStatus(lastMessage, currentUserId) };
      })
    );
  };

  // LiveKit real-time event listener for messages, edits, deletions and receipts
  useMessagesRealtime({
    onNewMessage: (incoming) => {
      const isKnown = conversations.some((c) => c.id === incoming.conversationId);
      // Someone started a new chat with us: reload the list to show it
      if (!isKnown) {
        void queryClient.invalidateQueries({ queryKey: messagesQueryKeys.conversations() });
      }

      updateThread(incoming.conversationId, (list) =>
        list.some((m) => m.id === incoming.id) ? list : [...list, incoming]
      );

      // Receipts back to the sender: read if the chat is open, otherwise delivered
      if (selectedConvId === incoming.conversationId) {
        markConversationRead(incoming.conversationId);
      } else {
        markDelivered(incoming.conversationId);
      }

      setConversations((prev) =>
        prev.map((c) =>
          c.id === incoming.conversationId
            ? {
                ...c,
                lastMessage: {
                  content: incoming.content,
                  createdAt: incoming.createdAt,
                  senderId: incoming.senderId,
                },
                statusIcon: "none",
                unreadCount:
                  selectedConvId === incoming.conversationId
                    ? c.unreadCount
                    : (c.unreadCount || 0) + 1,
              }
            : c
        )
      );
    },
    onEditMessage: (edited) => {
      if (!edited.conversationId) return;
      updateThread(edited.conversationId, (list) =>
        list.map((m) => (m.id === edited.id ? { ...m, ...edited } : m))
      );
    },
    onDeleteMessage: (messageId, conversationId) => {
      if (!conversationId) return;
      updateThread(conversationId, (list) => list.filter((m) => m.id !== messageId));
    },
    onMessagesDelivered: (conversationId, deliveredAt) =>
      applyReceipt(conversationId, { deliveredAt }),
    onMessagesRead: (conversationId) =>
      applyReceipt(conversationId, { isRead: true, deliveredAt: new Date().toISOString() }),
  });

  // Load conversations from API, keeping any draft chat that hasn't been sent yet
  useEffect(() => {
    if (!Array.isArray(apiConversations)) return;
    const mapped: ExtendedConversation[] = apiConversations.map((c) => ({
      ...c,
      statusIcon: lastMessageStatus(c.lastMessage, currentUserId),
    }));
    setConversations((prev) => [...prev.filter((c) => isDraftId(c.id)), ...mapped]);
    setSelectedConvId((current) =>
      current && (isDraftId(current) || mapped.some((c) => c.id === current))
        ? current
        : mapped[0]?.id ?? null
    );
  }, [apiConversations, currentUserId]);

  // Opening a chat from a booking: select the existing one, or start a draft
  useEffect(() => {
    if (!contact || !withUserId) return;
    if (contact.conversationId) {
      setSelectedConvId(contact.conversationId);
    } else {
      const draftId = `${DRAFT_PREFIX}${contact.participant.id}`;
      setConversations((prev) =>
        prev.some((c) => c.id === draftId)
          ? prev
          : [
              {
                id: draftId,
                participant: contact.participant,
                lastMessage: null,
                unreadCount: 0,
                updatedAt: new Date().toISOString(),
                statusIcon: "none",
              },
              ...prev,
            ]
      );
      setSelectedConvId(draftId);
    }
    setMobileChatOpen(true);
  }, [contact, withUserId]);

  useEffect(() => {
    if (contactError) {
      toast.error("Couldn't open this chat", {
        description: contactError.message || "Please try again from the booking.",
      });
    }
  }, [contactError]);

  // On switching conversations: reset message options and mark the conversation as read
  useEffect(() => {
    setActiveOptionsMsgId(null);
    if (selectedConvId && !isDraftId(selectedConvId)) {
      markConversationRead(selectedConvId);
      setConversations((prev) =>
        prev.map((c) => (c.id === selectedConvId ? { ...c, unreadCount: 0 } : c))
      );
    }
  }, [selectedConvId, markConversationRead]);

  // Immediately display from cache (0ms latency)
  useEffect(() => {
    if (!selectedConvId) {
      setMessages([]);
      return;
    }
    setMessages(messagesCache[selectedConvId] ?? []);
  }, [selectedConvId, messagesCache]);

  // Fresh messages from the API replace the cached copy for that conversation
  useEffect(() => {
    if (!selectedConvId || !Array.isArray(threadMessages) || threadMessages.length === 0) {
      return;
    }
    setMessagesCache((prev) => ({ ...prev, [selectedConvId]: threadMessages }));
  }, [selectedConvId, threadMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Current active conversation
  const selectedConv =
    conversations.find((c) => c.id === selectedConvId) ?? null;

  // Handle select conversation - instant synchronous UI response
  const handleSelectConv = (id: string) => {
    setSelectedConvId(id);
    setMessages(messagesCache[id] ?? []);
    setActiveOptionsMsgId(null);
    setMobileChatOpen(true);
  };

  // Send message: shown straight away with a clock, swapped for the saved message once sent
  const handleSendMessage = async () => {
    const trimmed = inputContent.trim();
    const recipientId = selectedConv?.participant?.id;
    if (!trimmed || !selectedConvId || !recipientId) return;

    const threadId = selectedConvId;
    const tempId = `${TEMP_MESSAGE_PREFIX}${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      conversationId: threadId,
      senderId: currentUserId,
      content: trimmed,
      isRead: false,
      deliveredAt: null,
      createdAt: new Date().toISOString(),
    };

    setInputContent("");
    setIsSending(true);
    updateThread(threadId, (list) => [...list, optimistic]);

    try {
      const saved = await sendMessageMutation.mutateAsync({ recipientId, content: trimmed });
      const savedMessage: Message = { ...saved, createdAt: String(saved.createdAt) };
      const realId = savedMessage.conversationId;

      if (isDraftId(threadId)) {
        // The first message created the conversation: move the draft over to it
        setMessagesCache((cache) => {
          const { [threadId]: draftMessages = [], ...rest } = cache;
          return {
            ...rest,
            [realId]: draftMessages.map((m) => (m.id === tempId ? savedMessage : m)),
          };
        });
        setConversations((prev) =>
          prev.map((c) =>
            c.id === threadId
              ? {
                  ...c,
                  id: realId,
                  lastMessage: {
                    content: savedMessage.content,
                    createdAt: savedMessage.createdAt,
                    senderId: currentUserId,
                    isRead: false,
                    deliveredAt: null,
                  },
                  statusIcon: "sent",
                }
              : c
          )
        );
        setSelectedConvId(realId);
        // Drop ?with= so a refresh opens the real chat rather than a new draft
        window.history.replaceState(null, "", window.location.pathname);
      } else {
        updateThread(threadId, (list) => list.map((m) => (m.id === tempId ? savedMessage : m)));
        setConversations((prev) =>
          prev.map((c) =>
            c.id === threadId
              ? {
                  ...c,
                  lastMessage: {
                    content: savedMessage.content,
                    createdAt: savedMessage.createdAt,
                    senderId: currentUserId,
                    isRead: false,
                    deliveredAt: null,
                  },
                  statusIcon: "sent",
                }
              : c
          )
        );
      }
    } catch (err) {
      updateThread(threadId, (list) => list.filter((m) => m.id !== tempId));
      setInputContent(trimmed);
      toast.error("Message not sent", {
        description: (err as { message?: string })?.message || "Please try again.",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Delete message
  const handleDeleteMessage = async (msgId: string) => {
    if (!selectedConvId) return;
    const threadId = selectedConvId;
    const previous = messages;
    updateThread(threadId, (list) => list.filter((m) => m.id !== msgId));
    setActiveOptionsMsgId(null);
    try {
      await deleteMessageMutation.mutateAsync(msgId);
    } catch (err) {
      updateThread(threadId, () => previous);
      toast.error("Couldn't delete the message", {
        description: (err as { message?: string })?.message || "Please try again.",
      });
    }
  };

  // Start editing message
  const handleStartEdit = (msg: Message) => {
    setEditingMsgId(msg.id);
    setEditContent(msg.content);
    setActiveOptionsMsgId(null);
  };

  // Save edit
  const handleSaveEdit = async (msgId: string) => {
    if (!editContent.trim() || !selectedConvId) return;
    const threadId = selectedConvId;
    const newContent = editContent.trim();
    const previous = messages;
    updateThread(threadId, (list) =>
      list.map((m) => (m.id === msgId ? { ...m, content: newContent, isEdited: true } : m))
    );
    setEditingMsgId(null);
    try {
      await editMessageMutation.mutateAsync({ messageId: msgId, content: newContent });
    } catch (err) {
      updateThread(threadId, () => previous);
      toast.error("Couldn't edit the message", {
        description: (err as { message?: string })?.message || "Please try again.",
      });
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full">
      {/* ── Page Header (Figma: Messages / Your conversation history with mentors) ── */}
      <div className="shrink-0 mb-4 sm:mb-5">
        {mobileChatOpen && (
          <div className="flex items-center gap-2 lg:hidden mb-2">
            <button
              type="button"
              onClick={() => setMobileChatOpen(false)}
              className="flex items-center gap-1.5 text-sm font-semibold text-[#101828] hover:text-[#FF5514] transition-colors"
            >
              <ChevronLeft size={18} />
              <span>Back to messages</span>
            </button>
          </div>
        )}

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#101828]">
            Messages
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-[#667085]">
            {isMentor ? "Your conversation history with mentees" : "Your conversation history with mentors"}
          </p>
        </div>
      </div>

      {/* ── Main Single Card Container (Figma design: Unified curved white container with border) ── */}
      {isLoadingConversations ? (
        <MessagesSkeleton />
      ) : conversations.length === 0 ? (
        /* Entirely Empty State (Mentee - No Messages.png) */
        <div className="flex flex-1 items-center justify-center rounded-[20px] sm:rounded-[24px] border border-[#EAECF0] bg-white p-8">
          <NoMessagesState />
        </div>
      ) : (
        <div className="flex flex-1 min-h-0 rounded-[20px] sm:rounded-[24px] border border-[#EAECF0] bg-white overflow-hidden">
          {/* ── Left Column: Conversation Sidebar ── */}
          <ConversationSidebar
            conversations={conversations}
            selectedConvId={selectedConvId}
            onSelectConv={handleSelectConv}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            className={mobileChatOpen ? "hidden lg:flex" : "flex"}
          />

          {/* ── Right Column: Chat View / No Message Open ── */}
          <div
            className={`flex flex-1 flex-col h-full min-w-0 bg-white ${
              mobileChatOpen ? "flex" : "hidden lg:flex"
            }`}
          >
            {selectedConv ? (
              <div className="flex flex-col flex-1 h-full min-h-0">
                {/* ── Chat Header ── */}
                <ChatHeader
                  participant={selectedConv.participant}
                  sessionBadge={selectedConv.sessionBadge}
                />

                {/* ── Message Thread ── */}
                <div
                  onClick={() => setActiveOptionsMsgId(null)}
                  className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6"
                >
                  {isLoadingThread && messages.length === 0 && <ChatThreadSkeleton />}
                  {messages.map((msg) => {
                    const isCurrentUser = msg.senderId === currentUserId;
                    const showOptions = activeOptionsMsgId === msg.id;

                    return (
                      <ChatMessageBubble
                        key={msg.id}
                        message={msg}
                        isCurrentUser={isCurrentUser}
                        participantAvatar={selectedConv.participant?.avatar}
                        isEditing={editingMsgId === msg.id}
                        editContent={editContent}
                        onEditContentChange={setEditContent}
                        onSaveEdit={handleSaveEdit}
                        onCancelEdit={() => setEditingMsgId(null)}
                        showOptions={showOptions}
                        onToggleOptions={(e) => {
                          e.stopPropagation();
                          setActiveOptionsMsgId(showOptions ? null : msg.id);
                        }}
                        onStartEdit={handleStartEdit}
                        onDelete={handleDeleteMessage}
                        onReport={(id) => {
                          setActiveOptionsMsgId(null);
                          setReportModalMsgId(id);
                        }}
                      />
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* ── Message Input Bar ── */}
                <ChatInputBar
                  value={inputContent}
                  onChange={setInputContent}
                  onSend={handleSendMessage}
                  isSending={isSending}
                />
              </div>
            ) : (
              /* No Conversation Selected Placeholder */
              <div className="flex flex-1 items-center justify-center">
                <NoMessagesState />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Report Message Modal ── */}
      <ReportModal
        isOpen={!!reportModalMsgId}
        messageId={reportModalMsgId ?? ""}
        onClose={() => setReportModalMsgId(null)}
      />

      {/* ── Mobile Bottom Navigation Bar ── */}
      <MobileBottomNav />
    </div>
  );
}
