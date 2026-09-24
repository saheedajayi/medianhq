import Link from "next/link";
import { SpeechBubbleEmptyIcon } from "./icons";

interface NoMessagesStateProps {
  className?: string;
}

export function NoMessagesState({ className = "" }: NoMessagesStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-6 text-center ${className}`}>
      {/* Peach Circle with speech bubble icon */}
      <div className="flex size-14 items-center justify-center rounded-full bg-[#FFEFEA] shadow-2xs">
        <SpeechBubbleEmptyIcon className="size-6 text-[#FF5514]" />
      </div>

      <h3 className="mt-4 text-base font-semibold text-[#101828]">
        No Messages
      </h3>
      <p className="mt-1 max-w-[260px] text-sm text-[#667085] leading-relaxed">
        Sorry, you do not have any messages available presently
      </p>

      <Link
        href="/mentee/explore"
        className="mt-5 inline-flex items-center justify-center rounded-full bg-[#FF5514] px-7 py-2.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-[#E04B12]"
      >
        Search for mentor
      </Link>
    </div>
  );
}
