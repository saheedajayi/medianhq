"use client";

import Image from "next/image";
import { MoreVertical, Edit2, Trash2, Flag } from "lucide-react";
import type { Message } from "@/services/messages";

export interface ChatMessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  participantAvatar?: string | null;
  isEditing: boolean;
  editContent: string;
  onEditContentChange: (val: string) => void;
  onSaveEdit: (msgId: string) => void;
  onCancelEdit: () => void;
  showOptions: boolean;
  onToggleOptions: (e: React.MouseEvent) => void;
  onStartEdit: (msg: Message) => void;
  onDelete: (msgId: string) => void;
  onReport: (msgId: string) => void;
}

export function ChatMessageBubble({
  message,
  isCurrentUser,
  participantAvatar,
  isEditing,
  editContent,
  onEditContentChange,
  onSaveEdit,
  onCancelEdit,
  showOptions,
  onToggleOptions,
  onStartEdit,
  onDelete,
  onReport,
}: ChatMessageBubbleProps) {
  return (
    <div
      className={`flex flex-col ${
        isCurrentUser ? "items-end" : "items-start"
      } group relative`}
    >
      {/* Message Content Bubble */}
      <div className="relative max-w-[620px]">
        {isEditing ? (
          <div className="flex flex-col gap-2 rounded-2xl rounded-tr-none border border-[#FF5514] bg-white p-3 shadow-md">
            <textarea
              value={editContent}
              onChange={(e) => onEditContentChange(e.target.value)}
              className="w-full resize-none text-sm text-[#101828] focus:outline-none"
              rows={3}
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onCancelEdit}
                className="rounded-lg px-3 py-1 text-xs text-[#667085] hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onSaveEdit(message.id)}
                className="rounded-lg bg-[#FF5514] px-3 py-1 text-xs font-medium text-white hover:bg-[#E04B12]"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={onToggleOptions}
            className={`p-4 text-sm leading-relaxed cursor-pointer select-text transition-all ${
              isCurrentUser
                ? "rounded-2xl rounded-tr-none bg-[#FFF9F6] text-[#1F2937] border border-[#FEEBE2]"
                : "rounded-2xl rounded-tl-none bg-[#F9FAFB] text-[#1F2937] border border-[#F0F2F5]"
            }`}
          >
            {message.content}
          </div>
        )}

        {/* Hover 3-dots trigger button */}
        <button
          type="button"
          onClick={onToggleOptions}
          className={`absolute top-2 ${
            isCurrentUser ? "-left-7" : "-right-7"
          } opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[#98A2B3] hover:text-[#101828]`}
          aria-label="Message options"
        >
          <MoreVertical size={15} />
        </button>
      </div>

      {/* Mentor Avatar + Timestamp below message */}
      <div
        className={`mt-1 flex items-center gap-1.5 text-xs text-[#98A2B3] ${
          isCurrentUser ? "justify-end" : "justify-start"
        }`}
      >
        {!isCurrentUser && (
          <div className="relative size-5 shrink-0 rounded-full overflow-hidden">
            <Image
              src={participantAvatar || "/mentors/mentor-1.png"}
              alt="Mentor"
              fill
              className="object-cover"
            />
          </div>
        )}
        <span>{message.createdAt || "Today 17:45"}</span>
      </div>

      {/* ── Context Menu Popover (Mentee - Message options.png) ── */}
      {showOptions && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`z-20 mt-1.5 rounded-xl border border-[#EAECF0] bg-white p-1 shadow-md animate-in fade-in zoom-in-95 duration-150 min-w-[130px] ${
            isCurrentUser ? "self-end" : "self-start"
          }`}
        >
          {isCurrentUser ? (
            <>
              <button
                type="button"
                onClick={() => onStartEdit(message)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-[#344054] hover:bg-[#F9FAFB] transition-colors"
              >
                <Edit2 size={14} className="text-[#667085]" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(message.id)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-[#EA3829] hover:bg-[#FEF3F2] transition-colors"
              >
                <Trash2 size={14} className="text-[#EA3829]" />
                <span>Delete</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onReport(message.id)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-[#EA3829] hover:bg-[#FEF3F2] transition-colors"
            >
              <Flag size={14} className="text-[#EA3829]" />
              <span>Report</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
