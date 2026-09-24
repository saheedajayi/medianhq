"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { messagesService, type Message } from "@/services/messages";
import {
  mockConversations,
  mockMessagesByConversation,
  type ExtendedConversation,
} from "./mock-messages";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useMessagesRealtime } from "./use-messages-realtime";
import { NoMessagesState } from "./no-messages-state";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { ReportModal } from "./report-modal";
import { ConversationSidebar } from "./conversation-sidebar";
import { ChatHeader } from "./chat-header";
import { ChatMessageBubble } from "./chat-message-bubble";
import { ChatInputBar } from "./chat-input-bar";

export function MessagesView() {
  const { data: user } = useCurrentUser();
  const currentUserId = user?.id ?? "current-user";

  const [conversations, setConversations] =
    useState<ExtendedConversation[]>(mockConversations);
  const [selectedConvId, setSelectedConvId] = useState<string | null>("conv-1");

  // In-memory messages cache to provide instant (0ms) conversation switching
  const [messagesCache, setMessagesCache] = useState<Record<string, Message[]>>(
    () => ({
      ...mockMessagesByConversation,
    })
  );

  // Initialized directly with first conversation's messages so there is zero initial delay
  const [messages, setMessages] = useState<Message[]>(
    () => mockMessagesByConversation["conv-1"] ?? []
  );

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

  // LiveKit real-time event listener for instant incoming messages, edits, and deletions
  useMessagesRealtime({
    onNewMessage: (incoming) => {
      // 1. Update cache
      setMessagesCache((cache) => {
        const list = cache[incoming.conversationId] ?? [];
        if (list.some((m) => m.id === incoming.id)) return cache;
        return {
          ...cache,
          [incoming.conversationId]: [...list, incoming],
        };
      });

      // 2. If viewing the conversation, append immediately to thread
      if (selectedConvId === incoming.conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === incoming.id)) return prev;
          return [...prev, incoming];
        });
      }

      // 3. Update conversation last message & unread badge
      setConversations((prev) =>
        prev.map((c) =>
          c.id === incoming.conversationId
            ? {
                ...c,
                lastMessage: {
                  content: incoming.content,
                  createdAt: incoming.createdAt,
                },
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
      setMessages((prev) =>
        prev.map((m) => (m.id === edited.id ? { ...m, ...edited } : m))
      );
      if (edited.conversationId) {
        setMessagesCache((cache) => {
          const list = cache[edited.conversationId] ?? [];
          return {
            ...cache,
            [edited.conversationId]: list.map((m) =>
              m.id === edited.id ? { ...m, ...edited } : m
            ),
          };
        });
      }
    },
    onDeleteMessage: (messageId, conversationId) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      if (conversationId) {
        setMessagesCache((cache) => {
          const list = cache[conversationId] ?? [];
          return {
            ...cache,
            [conversationId]: list.filter((m) => m.id !== messageId),
          };
        });
      }
    },
  });

  // Load conversations from API or fallback to mock
  useEffect(() => {
    let isMounted = true;
    messagesService
      .listConversations()
      .then((data) => {
        if (!isMounted || !Array.isArray(data) || data.length === 0) return;
        // Merge with mock design details if needed
        const mapped = data.map((c, i) => ({
          ...c,
          sessionBadge:
            mockConversations[i % mockConversations.length]?.sessionBadge,
          isTyping: mockConversations[i % mockConversations.length]?.isTyping,
          statusIcon:
            mockConversations[i % mockConversations.length]?.statusIcon ?? "read",
        }));
        setConversations(mapped);
      })
      .catch(() => {
        // Keep mock data for preview
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Synchronously update messages on conversation selection and background-revalidate real IDs
  useEffect(() => {
    if (!selectedConvId) {
      setMessages([]);
      return;
    }

    // Immediately display from cache or mock data (0ms latency)
    const existing =
      messagesCache[selectedConvId] ??
      mockMessagesByConversation[selectedConvId] ??
      [];
    setMessages(existing);
    setActiveOptionsMsgId(null);

    // If it's a preview conversation (e.g. conv-1, conv-2), don't fire redundant API requests that 404
    if (selectedConvId.startsWith("conv-")) {
      return;
    }

    // For real database conversation IDs, fetch in the background and update cache seamlessly
    let isMounted = true;
    messagesService
      .getMessages(selectedConvId)
      .then((res) => {
        if (!isMounted || !Array.isArray(res) || res.length === 0) return;
        setMessages(res);
        setMessagesCache((prev) => ({ ...prev, [selectedConvId]: res }));
      })
      .catch(() => {
        // Gracefully keep cached messages
      });

    // Mark as read in background
    messagesService.markConversationRead(selectedConvId).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [selectedConvId, messagesCache]);

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
    const existing =
      messagesCache[id] ?? mockMessagesByConversation[id] ?? [];
    setMessages(existing);
    setActiveOptionsMsgId(null);
    setMobileChatOpen(true);
  };

  // Send message
  const handleSendMessage = async () => {
    const trimmed = inputContent.trim();
    if (!trimmed || !selectedConvId) return;

    setInputContent("");
    setIsSending(true);

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId: selectedConvId,
      senderId: currentUserId,
      content: trimmed,
      isRead: false,
      createdAt: "Today 17:45",
    };

    setMessages((prev) => {
      const updated = [...prev, newMsg];
      setMessagesCache((cache) => ({ ...cache, [selectedConvId]: updated }));
      return updated;
    });

    try {
      const recipientId = selectedConv?.participant?.id ?? "";
      await messagesService.sendMessage({
        recipientId,
        content: trimmed,
      });
    } catch {
      // Keep optimistic message in local state
    } finally {
      setIsSending(false);
    }
  };

  // Delete message
  const handleDeleteMessage = async (msgId: string) => {
    setMessages((prev) => {
      const updated = prev.filter((m) => m.id !== msgId);
      if (selectedConvId) {
        setMessagesCache((cache) => ({ ...cache, [selectedConvId]: updated }));
      }
      return updated;
    });
    setActiveOptionsMsgId(null);
    try {
      await messagesService.deleteMessage(msgId);
    } catch {
      // Ignored in preview
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
    if (!editContent.trim()) return;
    const newContent = editContent.trim();
    setMessages((prev) => {
      const updated = prev.map((m) =>
        m.id === msgId ? { ...m, content: newContent, isEdited: true } : m
      );
      if (selectedConvId) {
        setMessagesCache((cache) => ({ ...cache, [selectedConvId]: updated }));
      }
      return updated;
    });
    setEditingMsgId(null);
    try {
      await messagesService.editMessage(msgId, { content: newContent });
    } catch {
      // Ignored in preview
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
            Your conversation history with mentors
          </p>
        </div>
      </div>

      {/* ── Main Single Card Container (Figma design: Unified curved white container with border) ── */}
      {conversations.length === 0 ? (
        /* Entirely Empty State (Mentee - No Messages.png) */
        <div className="flex flex-1 items-center justify-center rounded-[20px] sm:rounded-[24px] border border-[#EAECF0] bg-white p-8">
          <NoMessagesState />
        </div>
      ) : (
        <div className="flex flex-1 min-h-0 rounded-[20px] sm:rounded-[24px] border border-[#EAECF0] bg-white overflow-hidden shadow-2xs">
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
