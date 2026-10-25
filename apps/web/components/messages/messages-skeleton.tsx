import { Skeleton, SkeletonGroup } from "@/components/ui/base/skeleton";

const BUBBLES = [
  { mine: false, lines: ["w-56", "w-40"] },
  { mine: true, lines: ["w-60", "w-48", "w-32"] },
  { mine: false, lines: ["w-44"] },
  { mine: true, lines: ["w-52", "w-28"] },
];

/** Mirrors the inbox: conversation list on the left, open chat on the right */
export function MessagesSkeleton() {
  return (
    <SkeletonGroup
      label="Loading conversations"
      className="flex flex-1 min-h-0 overflow-hidden rounded-[20px] border border-[#EAECF0] bg-white sm:rounded-[24px]"
    >
      <div className="flex w-full shrink-0 flex-col border-r border-[#F0F2F5] lg:w-[360px] xl:w-[380px]">
        <div className="p-4 pb-3 sm:p-5">
          <Skeleton className="h-10 w-full rounded-full" />
        </div>
        <div className="space-y-1 px-2 sm:px-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 rounded-2xl px-3.5 py-3">
              <Skeleton className="size-11 shrink-0 rounded-full sm:size-12" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-full max-w-[200px]" />
              </div>
              <Skeleton className="h-2.5 w-9 self-start" />
            </div>
          ))}
        </div>
      </div>

      <div className="hidden flex-1 flex-col lg:flex">
        <div className="flex items-center gap-3 border-b border-[#F0F2F5] px-6 py-4">
          <Skeleton className="size-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-14" />
          </div>
        </div>
        <ChatThreadBubbles className="flex-1 p-7" />
        <div className="px-6 pb-6">
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </SkeletonGroup>
  );
}

function ChatThreadBubbles({ className }: { className?: string }) {
  return (
    <div className={`space-y-6 ${className ?? ""}`}>
      {BUBBLES.map((bubble, index) => (
        <div key={index} className={`flex flex-col ${bubble.mine ? "items-end" : "items-start"}`}>
          <div
            className={`max-w-[75%] space-y-2 rounded-2xl border p-4 ${
              bubble.mine
                ? "rounded-tr-none border-[#FEEBE2] bg-[#FFF9F6]"
                : "rounded-tl-none border-[#F0F2F5] bg-[#F9FAFB]"
            }`}
          >
            {bubble.lines.map((width, line) => (
              <Skeleton key={line} className={`h-3 max-w-full ${width}`} />
            ))}
          </div>
          <Skeleton className="mt-1.5 h-2.5 w-16" />
        </div>
      ))}
    </div>
  );
}

/** Placeholder bubbles while an open chat's messages load */
export function ChatThreadSkeleton() {
  return (
    <SkeletonGroup label="Loading messages">
      <ChatThreadBubbles />
    </SkeletonGroup>
  );
}
