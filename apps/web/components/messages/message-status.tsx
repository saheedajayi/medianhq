import { Check, CheckCheck, Clock } from "lucide-react";
import type { Message, MessageStatus } from "@/services/messages";

/** Optimistic messages carry this id prefix until the server confirms them */
export const TEMP_MESSAGE_PREFIX = "temp-";

export function getMessageStatus(message: Pick<Message, "id" | "isRead" | "deliveredAt">): MessageStatus {
  if (message.id.startsWith(TEMP_MESSAGE_PREFIX)) return "sending";
  if (message.isRead) return "read";
  if (message.deliveredAt) return "delivered";
  return "sent";
}

const STATUS_LABELS: Record<MessageStatus, string> = {
  sending: "Sending",
  sent: "Sent",
  delivered: "Delivered",
  read: "Read",
};

/** WhatsApp-style ticks: one grey (sent), two grey (delivered), two green (read) */
export function MessageStatusIcon({ status, size = 15 }: { status: MessageStatus; size?: number }) {
  const label = STATUS_LABELS[status];
  if (status === "sending") {
    return <Clock size={size - 3} className="text-[#98A2B3]" aria-label={label} />;
  }
  if (status === "sent") {
    return <Check size={size} className="text-[#98A2B3]" aria-label={label} />;
  }
  return (
    <CheckCheck
      size={size}
      className={status === "read" ? "text-[#12B76A]" : "text-[#98A2B3]"}
      aria-label={label}
    />
  );
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function relativeDay(date: Date, now = new Date()) {
  if (isSameDay(date, now)) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) return "Yesterday";
  const daysAgo = (now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000);
  if (daysAgo < 7) return date.toLocaleDateString("en-GB", { weekday: "long" });
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function clockTime(date: Date) {
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

/** Under a message: "Today 17:45", "Yesterday 09:10", "Saturday 14:00", "12 Oct 14:00" */
export function formatMessageTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${relativeDay(date)} ${clockTime(date)}`;
}

/** In the conversation list: "17:45" today, otherwise "Yesterday", the weekday or the date */
export function formatListTime(value: string | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = relativeDay(date);
  return day === "Today" ? clockTime(date) : day;
}
