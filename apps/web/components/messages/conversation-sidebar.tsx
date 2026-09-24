"use client";

import Image from "next/image";
import { Search, CheckCheck } from "lucide-react";
import type { ExtendedConversation } from "./mock-messages";

export interface ConversationSidebarProps {
  conversations: ExtendedConversation[];
  selectedConvId: string | null;
  onSelectConv: (id: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  className?: string;
}

export function ConversationSidebar({
  conversations,
  selectedConvId,
  onSelectConv,
  searchQuery,
  onSearchQueryChange,
  className = "",
}: ConversationSidebarProps) {
  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const name = c.participant?.name?.toLowerCase() ?? "";
    return name.includes(searchQuery.toLowerCase());
  });

  return (
    <div
      className={`flex flex-col shrink-0 w-full lg:w-[360px] xl:w-[380px] border-r border-[#F0F2F5] bg-white h-full ${className}`}
    >
      {/* Search Input Container */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-center gap-2.5 rounded-full bg-[#F3F4F6] px-4 py-2.5">
          <Search size={16} className="shrink-0 text-[#98A2B3]" />
          <input
            type="text"
            placeholder="Search mentor by name"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full bg-transparent text-sm text-[#101828] placeholder-[#98A2B3] focus:outline-none"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-3 pb-3 divide-y divide-transparent">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#98A2B3]">
            No mentors match your search
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isSelected = selectedConvId === conv.id;
            const isTyping = conv.isTyping;
            const isOnline = conv.participant?.isOnline ?? true;

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConv(conv.id)}
                className={`group flex items-center justify-between gap-3 rounded-2xl px-3.5 py-3 cursor-pointer transition-all ${
                  isSelected ? "bg-[#F9FAFB]" : "hover:bg-[#F9FAFB]/70"
                }`}
              >
                {/* Avatar with Online Dot */}
                <div className="relative size-11 sm:size-12 shrink-0 rounded-full">
                  <Image
                    src={conv.participant?.avatar || "/mentors/mentor-1.png"}
                    alt={conv.participant?.name || "Mentor"}
                    fill
                    className="rounded-full object-cover"
                  />
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 size-3 rounded-full bg-[#12B76A] ring-2 ring-white" />
                  )}
                </div>

                {/* Name & Last Message */}
                <div className="flex flex-1 min-w-0 flex-col">
                  <h4 className="text-sm font-semibold text-[#101828] truncate">
                    {conv.participant?.name}
                  </h4>
                  <div className="mt-0.5 text-xs truncate">
                    {isTyping ? (
                      <span className="font-medium text-[#12B76A]">
                        Typing...
                      </span>
                    ) : (
                      <span className="text-[#667085]">
                        {conv.lastMessage?.content || "No message yet"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Meta: Time & Badges/Checks */}
                <div className="flex flex-col items-end shrink-0 gap-1.5 self-center">
                  <span className="text-[11px] font-normal text-[#667085]">
                    {conv.updatedAt === "Yesterday" ||
                    conv.updatedAt === "Saturday"
                      ? conv.updatedAt
                      : "17:45"}
                  </span>

                  {/* Unread badge or checkmarks */}
                  {conv.unreadCount > 0 ? (
                    <div className="flex size-5 items-center justify-center rounded-full bg-[#FF5514] text-[11px] font-semibold text-white">
                      {conv.unreadCount}
                    </div>
                  ) : conv.statusIcon === "read" ? (
                    <CheckCheck size={16} className="text-[#12B76A]" />
                  ) : conv.statusIcon === "delivered" ? (
                    <CheckCheck size={16} className="text-[#D0D5DD]" />
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
