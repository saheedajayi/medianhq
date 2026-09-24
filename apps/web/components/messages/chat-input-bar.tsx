"use client";

import { AngledPaperPlaneIcon } from "./icons";

export interface ChatInputBarProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  isSending: boolean;
}

export function ChatInputBar({
  value,
  onChange,
  onSend,
  isSending,
}: ChatInputBarProps) {
  return (
    <div className="shrink-0 p-4 sm:p-6 pt-2">
      <div className="flex items-center gap-2 rounded-full bg-[#F3F4F6] px-5 py-2.5 sm:py-3 transition-all">
        <input
          type="text"
          placeholder="Type your message here"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          className="flex-1 bg-transparent text-sm text-[#101828] placeholder-[#98A2B3] focus:outline-none"
        />

        {/* Orange Send Button: Shown only when user types content */}
        {value.trim().length > 0 && (
          <button
            type="button"
            onClick={onSend}
            disabled={isSending}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#FF5514] text-white shadow-2xs transition-transform hover:bg-[#E04B12] active:scale-95 disabled:opacity-50"
            aria-label="Send message"
          >
            <AngledPaperPlaneIcon className="size-4 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}
