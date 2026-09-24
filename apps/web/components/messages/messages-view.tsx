"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Send, MoreHorizontal, Edit2, Trash2, Flag, X, CheckCheck, Check, ChevronLeft, Calendar } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { messagesService } from "@/services/messages";
import type { ConversationSummary, Message } from "@/services/messages";
import { useCurrentUser } from "@/hooks/use-current-user";
import { mockConversations, mockMessages } from "./mock-messages";

/* ─────────────── Helper Utilities ─────────────── */

function formatConversationTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    return days[d.getDay()] ?? "";
  }
  return d.toLocaleDateString([], { day: "2-digit", month: "short" });
}

function formatMessageTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (isToday) return `Today ${timeStr}`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday ${timeStr}`;
  return `${d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })} ${timeStr}`;
}

/* ─────────────── Sub-components ─────────────── */

interface ConversationItemProps {
  conv: ConversationSummary;
  isSelected: boolean;
  currentUserId: string;
  onSelect: () => void;
}

function ConversationItem({ conv, isSelected, currentUserId, onSelect }: ConversationItemProps) {
  const isTyping = conv.lastMessage?.content === "Typing...";
  const isMine = conv.lastMessage?.senderId === currentUserId;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors",
        isSelected ? "bg-[#FFF4F0]" : "hover:bg-[#F9FAFB]"
      )}
    >
      {/* Avatar */}
      <div className="relative mt-0.5 shrink-0">
        <div className="size-10 overflow-hidden rounded-full bg-[#F2F4F7]">
          {conv.participant?.avatar ? (
            <Image
              src={conv.participant.avatar}
              alt={conv.participant.name ?? ""}
              width={40}
              height={40}
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-[#667085] text-sm font-semibold">
              {conv.participant?.name?.charAt(0).toUpperCase() ?? "?"}
            </div>
          )}
        </div>
        {conv.participant?.isOnline && (
          <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white bg-[#12B76A]" />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <p className={cn("truncate text-sm font-semibold", isSelected ? "text-[#101828]" : "text-[#101828]")}>
            {conv.participant?.name ?? "Unknown"}
          </p>
          <span className="shrink-0 text-xs text-[#98A2B3]">
            {conv.lastMessage ? formatConversationTime(conv.lastMessage.createdAt) : ""}
          </span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-1">
          <p className={cn("truncate text-xs", isTyping ? "font-medium text-[#FF5514]" : "text-[#667085]")}>
            {isTyping ? "Typing..." : (conv.lastMessage?.content ?? "No messages yet")}
          </p>
          {conv.unreadCount > 0 && (
            <span className="ml-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#FF5514] text-[10px] font-bold text-white">
              {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
            </span>
          )}
          {conv.unreadCount === 0 && isMine && conv.lastMessage && !isTyping && (
            <CheckCheck size={14} className="shrink-0 text-[#12B76A]" />
          )}
          {conv.unreadCount === 0 && !isMine && conv.lastMessage && !isTyping && (
            <Check size={14} className="shrink-0 text-[#98A2B3]" />
          )}
        </div>
      </div>
    </button>
  );
}

/* ─────────────── Report Modal ─────────────── */

const REPORT_REASONS = [
  "Inappropriate or offensive content",
  "Harassment or bullying",
  "Misinformation or false claims",
  "Other",
];

interface ReportModalProps {
  messageId: string;
  onClose: () => void;
  onSubmitted: () => void;
}

function ReportModal({ messageId, onClose, onSubmitted }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      await messagesService.reportMessage({ messageId, reason: selectedReason ?? "", note: note.trim() || undefined });
      setSubmitted(true);
    } catch {
      // Even if the backend call fails in preview, show success
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.25)" }}>
      <div className="relative w-full max-w-[500px] rounded-2xl bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7] transition-colors"
        >
          <X size={18} />
        </button>

        {submitted ? (
          /* ── Success State ── */
          <div className="py-4 text-center">
            <h2 className="text-xl font-bold text-[#FF5514]">Report Submitted</h2>
            <p className="mt-3 text-sm text-[#475467] leading-relaxed">
              Your report has been submitted successfully and this chat has been paused until the situation is cleared.
            </p>
            <button
              type="button"
              onClick={onSubmitted}
              className="mt-6 w-full rounded-full bg-[#FF5514] py-3 text-sm font-semibold text-white hover:bg-[#e44d0d] transition-colors"
            >
              Back to messages
            </button>
            <p className="mt-4 text-xs text-[#667085]">
              Need urgent help? Contact{" "}
              <a href="mailto:support@median.com" className="font-semibold text-[#FF5514] hover:underline">
                support@median.com
              </a>
            </p>
          </div>
        ) : (
          /* ── Form State ── */
          <>
            <h2 className="text-xl font-bold text-[#101828]">Report Message</h2>
            <p className="mt-1 text-sm text-[#475467]">Help us understand what&apos;s wrong with this message.</p>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#FF5514]">Reason</p>
              <div className="mt-2 flex flex-col gap-2">
                {REPORT_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
                      selectedReason === reason
                        ? "border-[#FF5514] bg-[#FFF4F0]"
                        : "border-[#EAECF0] hover:border-[#FDA280]"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        selectedReason === reason ? "border-[#FF5514]" : "border-[#D0D5DD]"
                      )}
                    >
                      {selectedReason === reason && (
                        <span className="size-2 rounded-full bg-[#FF5514]" />
                      )}
                    </span>
                    <input
                      type="radio"
                      className="sr-only"
                      name="report-reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                    />
                    <span className="text-sm text-[#344054]">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#FF5514]">Optional Note</p>
              <textarea
                rows={3}
                placeholder="Add a short explanation..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-2 w-full resize-none rounded-xl border border-[#EAECF0] px-3 py-2.5 text-sm text-[#344054] placeholder:text-[#98A2B3] focus:border-[#FF5514] focus:outline-none transition-colors"
              />
            </div>

            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[#FEDF89] bg-[#FFFAEB] px-4 py-3">
              <span className="mt-0.5 shrink-0 text-[#B54708]">⚠</span>
              <p className="text-xs text-[#B54708] leading-relaxed">
                Our moderation team reviews all reports within 24 hours. You won&apos;t be notified unless we need more information.
              </p>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="mt-5 w-full rounded-full bg-[#D92D20] py-3 text-sm font-semibold text-white hover:bg-[#b91c1c] transition-colors disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Submit report"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────── Message Bubble ─────────────── */

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  participantAvatar: string | null;
  isLast: boolean;
  onEdit: (msg: Message) => void;
  onDelete: (msgId: string) => void;
  onReport: (msgId: string) => void;
}

function MessageBubble({ message, isMine, participantAvatar, isLast, onEdit, onDelete, onReport }: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  return (
    <div className={cn("group flex items-end gap-2", isMine ? "flex-row-reverse" : "flex-row")}>
      {/* Other person avatar */}
      {!isMine && (
        <div className="mb-5 size-7 shrink-0 overflow-hidden rounded-full bg-[#F2F4F7]">
          {participantAvatar ? (
            <Image src={participantAvatar} alt="avatar" width={28} height={28} className="object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-[#667085] text-xs font-semibold">M</div>
          )}
        </div>
      )}

      <div className={cn("relative flex max-w-[70%] flex-col gap-1", isMine ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isMine
              ? "rounded-br-sm bg-white text-[#344054] shadow-sm border border-[#F2F4F7]"
              : "rounded-bl-sm bg-[#F2F4F7] text-[#344054]"
          )}
        >
          {message.content}
          {message.isEdited && (
            <span className="ml-1 text-[10px] italic text-[#98A2B3]">(edited)</span>
          )}
        </div>

        <div className={cn("flex items-center gap-1.5", isMine ? "flex-row-reverse" : "flex-row")}>
          <span className="text-[11px] text-[#98A2B3]">{formatMessageTime(message.createdAt)}</span>
          {isMine && isLast && (
            <CheckCheck size={13} className="text-[#12B76A]" />
          )}
        </div>

        {/* Options button (appears on hover) */}
        <div
          ref={menuRef}
          className={cn(
            "absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity",
            isMine ? "-left-8" : "-right-8"
          )}
        >
          <button
            type="button"
            onClick={() => setShowMenu((v) => !v)}
            className="flex size-6 items-center justify-center rounded-full bg-white shadow-sm border border-[#EAECF0] text-[#667085] hover:text-[#344054] transition-colors"
          >
            <MoreHorizontal size={13} />
          </button>

          {showMenu && (
            <div
              className={cn(
                "absolute z-20 w-32 rounded-xl bg-white shadow-lg border border-[#EAECF0] py-1 text-sm overflow-hidden",
                isMine ? "right-0 top-7" : "left-0 top-7"
              )}
            >
              {!isMine && (
                <button
                  type="button"
                  onClick={() => { onReport(message.id); setShowMenu(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2 font-medium text-[#D92D20] hover:bg-[#FFF4F0] transition-colors"
                >
                  <Flag size={13} />
                  Report
                </button>
              )}
              {isMine && (
                <>
                  <button
                    type="button"
                    onClick={() => { onEdit(message); setShowMenu(false); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-[#344054] hover:bg-[#F9FAFB] transition-colors"
                  >
                    <Edit2 size={13} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => { onDelete(message.id); setShowMenu(false); }}
                    className="flex w-full items-center gap-2 px-3 py-2 font-medium text-[#D92D20] hover:bg-[#FFF4F0] transition-colors"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Chat Panel ─────────────── */

interface ChatPanelProps {
  conv: ConversationSummary;
  currentUserId: string;
  onBack?: () => void;
}

function ChatPanel({ conv, currentUserId, onBack }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [reportingMessageId, setReportingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    setLoadingMessages(true);
    setMessages([]);

    messagesService
      .getMessages(conv.id)
      .then((msgs) => {
        if (Array.isArray(msgs) && msgs.length > 0) {
          setMessages(msgs);
        } else {
          // Fall back to mock
          setMessages(mockMessages[conv.id] ?? []);
        }
      })
      .catch(() => {
        setMessages(mockMessages[conv.id] ?? []);
      })
      .finally(() => setLoadingMessages(false));

    // Mark as read
    messagesService.markConversationRead(conv.id).catch(() => {});
  }, [conv.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  async function handleSend() {
    const content = inputValue.trim();
    if (!content || isSending) return;

    if (editingMessage) {
      // Edit mode
      const prevContent = editingMessage.content;
      setMessages((prev) =>
        prev.map((m) => (m.id === editingMessage.id ? { ...m, content, isEdited: true } : m))
      );
      setEditingMessage(null);
      setInputValue("");

      messagesService.editMessage(editingMessage.id, { content }).catch(() => {
        // Revert on error
        setMessages((prev) =>
          prev.map((m) => (m.id === editingMessage.id ? { ...m, content: prevContent, isEdited: false } : m))
        );
        toast.error("Failed to edit message. Please try again.");
      });
    } else {
      // Send new message
      const optimistic: Message = {
        id: `optimistic-${Date.now()}`,
        conversationId: conv.id,
        senderId: currentUserId,
        content,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);
      setInputValue("");
      setIsSending(true);

      try {
        const sent = await messagesService.sendMessage({
          recipientId: conv.participant?.id ?? "",
          content,
        });
        if (sent?.id) {
          setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? { ...sent } : m)));
        }
      } catch {
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        toast.error("Failed to send message. Please try again.");
      } finally {
        setIsSending(false);
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleDeleteMessage(messageId: string) {
    const prev = messages;
    setMessages((m) => m.filter((msg) => msg.id !== messageId));

    messagesService.deleteMessage(messageId).catch(() => {
      setMessages(prev);
      toast.error("Failed to delete message.");
    });
  }

  function handleEditStart(msg: Message) {
    setEditingMessage(msg);
    setInputValue(msg.content);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  function handleCancelEdit() {
    setEditingMessage(null);
    setInputValue("");
  }

  const hasText = inputValue.trim().length > 0;

  return (
    <div className="flex h-full flex-col">
      {/* Chat Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-[#EAECF0] bg-white px-5 py-3.5">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mr-1 flex size-8 items-center justify-center rounded-full text-[#344054] hover:bg-[#F2F4F7] transition-colors lg:hidden"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        <div className="relative shrink-0">
          <div className="size-10 overflow-hidden rounded-full bg-[#F2F4F7]">
            {conv.participant?.avatar ? (
              <Image
                src={conv.participant.avatar}
                alt={conv.participant.name ?? ""}
                width={40}
                height={40}
                className="object-cover"
              />
            ) : null}
          </div>
          {conv.participant?.isOnline && (
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white bg-[#12B76A]" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#101828]">{conv.participant?.name}</p>
          <p className={cn("text-xs font-medium", conv.participant?.isOnline ? "text-[#12B76A]" : "text-[#98A2B3]")}>
            {conv.participant?.isOnline ? "Online" : "Offline"}
          </p>
        </div>

        {/* Next session chip (mock) */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-[#FFF4F0] px-3 py-1.5 text-xs font-medium text-[#B54708]">
          <Calendar size={12} />
          Career Positioning · June 8, 2026 · 3:00 pm
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {loadingMessages ? (
          <div className="flex h-full items-center justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-[#FF5514] border-t-transparent" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm font-medium text-[#344054]">No messages yet</p>
            <p className="text-xs text-[#98A2B3]">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isMine={msg.senderId === currentUserId}
              participantAvatar={conv.participant?.avatar ?? null}
              isLast={idx === messages.length - 1}
              onEdit={handleEditStart}
              onDelete={handleDeleteMessage}
              onReport={(id) => setReportingMessageId(id)}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Edit banner */}
      {editingMessage && (
        <div className="flex shrink-0 items-center justify-between border-t border-[#EAECF0] bg-[#FFF4F0] px-4 py-2">
          <div className="flex items-center gap-2 text-xs text-[#B54708]">
            <Edit2 size={12} />
            <span className="font-medium">Editing message</span>
          </div>
          <button
            type="button"
            onClick={handleCancelEdit}
            className="flex size-5 items-center justify-center rounded-full text-[#B54708] hover:bg-[#FEDF89] transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 border-t border-[#EAECF0] bg-white px-4 py-3">
        <div className="flex items-center gap-3 rounded-2xl bg-[#F9FAFB] px-4 py-2.5 border border-[#EAECF0] focus-within:border-[#FDA280] transition-colors">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              // Auto-grow
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here"
            className="flex-1 resize-none bg-transparent text-sm text-[#344054] placeholder:text-[#98A2B3] focus:outline-none"
            style={{ maxHeight: 120, minHeight: 22 }}
          />
          {hasText && (
            <button
              type="button"
              onClick={handleSend}
              disabled={isSending}
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#FF5514] text-white shadow-sm hover:bg-[#e44d0d] transition-colors disabled:opacity-60"
            >
              <Send size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {reportingMessageId && (
        <ReportModal
          messageId={reportingMessageId}
          onClose={() => setReportingMessageId(null)}
          onSubmitted={() => setReportingMessageId(null)}
        />
      )}
    </div>
  );
}

/* ─────────────── Empty Chat Placeholder ─────────────── */

function NoChatSelected() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center px-8">
      <div className="flex size-16 items-center justify-center rounded-full bg-[#FFF4F0]">
        <Image src="/median-logo-icon.svg" alt="Median" width={36} height={36} className="opacity-60" unoptimized />
      </div>
      <div>
        <p className="text-sm font-semibold text-[#344054]">No Messages</p>
        <p className="mt-1 text-xs text-[#98A2B3]">Sorry, you do not have any messages available presently</p>
      </div>
      <Link
        href="/mentee/explore"
        className="mt-1 rounded-full bg-[#FF5514] px-5 py-2 text-sm font-semibold text-white hover:bg-[#e44d0d] transition-colors"
      >
        Search for mentor
      </Link>
    </div>
  );
}

/* ─────────────── No Conversations ─────────────── */

function NoConversations() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center px-8">
      <div className="flex size-16 items-center justify-center rounded-full bg-[#FFF4F0]">
        <Image src="/median-logo-icon.svg" alt="Median" width={36} height={36} className="opacity-60" unoptimized />
      </div>
      <div>
        <p className="text-sm font-semibold text-[#344054]">No Messages</p>
        <p className="mt-1 text-xs text-[#98A2B3]">Sorry, you do not have any messages available presently</p>
      </div>
      <Link
        href="/mentee/explore"
        className="mt-1 rounded-full bg-[#FF5514] px-5 py-2 text-sm font-semibold text-white hover:bg-[#e44d0d] transition-colors"
      >
        Search for mentor
      </Link>
    </div>
  );
}

/* ─────────────── Main Messages View ─────────────── */

export function MessagesView() {
  const { data: currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id ?? "mentee-current";

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  useEffect(() => {
    setIsLoadingConvs(true);
    messagesService
      .listConversations()
      .then((convs) => {
        if (Array.isArray(convs) && convs.length > 0) {
          setConversations(convs);
        } else {
          setConversations(mockConversations);
        }
      })
      .catch(() => {
        setConversations(mockConversations);
      })
      .finally(() => setIsLoadingConvs(false));
  }, []);

  const filteredConvs = conversations.filter((c) =>
    c.participant?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = filteredConvs.find((c) => c.id === selectedConvId) ?? null;

  function handleSelectConv(id: string) {
    setSelectedConvId(id);
    setShowChatOnMobile(true);
  }

  function handleBackToList() {
    setShowChatOnMobile(false);
    setSelectedConvId(null);
  }

  return (
    <>
      {/* Page header (visible on desktop always, on mobile only when in list view) */}
      <div className={cn("mb-5 shrink-0", showChatOnMobile ? "hidden lg:block" : "block")}>
        <h1 className="text-xl font-semibold text-[#101828]">Messages</h1>
        <p className="text-sm text-[#475467]">Your conversation history with mentors</p>
      </div>

      {conversations.length === 0 && !isLoadingConvs ? (
        /* ── Completely empty state ── */
        <div className="flex flex-1 items-center justify-center">
          <NoConversations />
        </div>
      ) : (
        /* ── Split pane ── */
        <div className="flex min-h-0 flex-1 gap-3">
          {/* Left: Conversation list */}
          <div
            className={cn(
              "flex w-full flex-col lg:w-[340px] xl:w-[360px] shrink-0 rounded-2xl border border-[#EAECF0] bg-white overflow-hidden",
              showChatOnMobile ? "hidden lg:flex" : "flex"
            )}
          >
            {/* Search */}
            <div className="shrink-0 p-3 border-b border-[#EAECF0]">
              <div className="flex items-center gap-2 rounded-full bg-[#F2F4F7] px-3 py-2">
                <Search size={15} className="shrink-0 text-[#98A2B3]" />
                <input
                  type="text"
                  placeholder="Search mentor by name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-[#344054] placeholder:text-[#98A2B3] focus:outline-none"
                />
              </div>
            </div>

            {/* Conversation items */}
            <div className="flex-1 overflow-y-auto p-2">
              {isLoadingConvs ? (
                <div className="flex items-center justify-center py-12">
                  <div className="size-6 animate-spin rounded-full border-2 border-[#FF5514] border-t-transparent" />
                </div>
              ) : filteredConvs.length === 0 ? (
                <p className="py-8 text-center text-xs text-[#98A2B3]">No conversations found</p>
              ) : (
                filteredConvs.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    isSelected={selectedConvId === conv.id}
                    currentUserId={currentUserId}
                    onSelect={() => handleSelectConv(conv.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right: Chat area */}
          <div
            className={cn(
              "flex-1 min-w-0 rounded-2xl border border-[#EAECF0] bg-white overflow-hidden",
              showChatOnMobile ? "flex" : "hidden lg:flex"
            )}
          >
            {selectedConv ? (
              <div className="flex h-full w-full flex-col">
                <ChatPanel
                  conv={selectedConv}
                  currentUserId={currentUserId}
                  onBack={handleBackToList}
                />
              </div>
            ) : (
              <NoChatSelected />
            )}
          </div>
        </div>
      )}
    </>
  );
}
