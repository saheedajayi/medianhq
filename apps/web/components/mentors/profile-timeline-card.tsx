import type { MentorTimelineItem } from "./types";

interface ProfileTimelineCardProps {
  title: string;
  items: MentorTimelineItem[];
}

/** A dated list, newest first: someone's roles or their education, with what they did in each */
export function ProfileTimelineCard({ title, items }: ProfileTimelineCardProps) {
  return (
    <div className="rounded-[20px] border border-[#F2F2F7] bg-white p-6">
      <h2 className="text-lg font-semibold text-[#101828]">{title}</h2>
      <div className="mt-4 flex flex-col">
        {items.map((item, index) => (
          <div key={`${item.role}-${index}`} className="flex items-stretch gap-2">
            {/* Bullet, with a line running down to the next entry */}
            <div className="flex flex-col items-center pt-1.5">
              <div className="size-3 shrink-0 rounded-full bg-[#EAECF0]" />
              {index < items.length - 1 && <div className="w-px flex-1 bg-[#F2F4F7]" />}
            </div>

            <div className={index < items.length - 1 ? "min-w-0 flex-1 pb-4" : "min-w-0 flex-1"}>
              <p className="text-base font-medium leading-6 tracking-[-0.02em]">
                <span className="text-[#182230]">{item.role}</span>
                {item.company && <span className="ml-2 text-[#475467]">@ {item.company}</span>}
              </p>
              {item.period && (
                <p className="text-xs leading-[18px] tracking-[-0.01em] text-[#667085]">{item.period}</p>
              )}
              {item.description && (
                <p className="mt-2 whitespace-pre-line text-sm leading-5 tracking-[-0.01em] text-[#344054]">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
