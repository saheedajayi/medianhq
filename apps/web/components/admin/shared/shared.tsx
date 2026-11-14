import { cn } from "@/lib/utils";

export const cardClass = "rounded-2xl border border-[#EAECF0] bg-white";
export const cardTitleClass = "text-base font-semibold text-[#101828]";
export const chipClass = "rounded-full bg-[#F2F4F7] px-2.5 py-1 text-xs font-semibold text-[#344054]";
export const badgeClass = "inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold";
// The app's global anchor rule inherits colour, so link colours need to be forced
export const linkClass = "text-sm font-medium text-[#FF5514]! hover:underline";
export const textButtonClass = "text-sm font-medium text-[#FF5514] hover:underline disabled:opacity-50";
export const checkboxClass = "size-4 cursor-pointer rounded accent-[#FF5514]";

export const outlineButtonClass =
  "inline-flex items-center gap-2 rounded-full border border-[#EAECF0] bg-white px-4 py-2.5 text-sm font-medium text-[#101828]! transition-colors hover:bg-[#F9FAFB] disabled:opacity-50";

const pillButtonClass =
  "rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";
export const neutralPillClass = `${pillButtonClass} border-[#EAECF0] text-[#101828] hover:bg-[#F9FAFB]`;
export const primaryPillClass = `${pillButtonClass} border-[#FF5514] bg-[#FF5514] text-white! hover:bg-[#E84D12]`;
export const dangerPillClass = `${pillButtonClass} border-[#D92D20] text-[#B42318] hover:bg-[#FEF3F2]`;
export const dangerSolidPillClass = `${pillButtonClass} border-[#D92D20] bg-[#D92D20] text-white hover:bg-[#B42318]`;

export const tableHeadClass = "px-3 py-3.5 text-left text-xs font-semibold text-[#475467]";
export const tableCellClass = "px-3 py-4 align-middle";

export const textareaClass =
  "w-full rounded-xl border border-[#D0D5DD] px-3.5 py-2.5 text-sm text-[#101828] outline-none placeholder:text-[#98A2B3] focus:border-[#FF5514] disabled:bg-[#F9FAFB]";

interface UserAvatarProps {
  name: string;
  avatarUrl: string | null;
  className?: string;
}

/** The person's photo, or their initials when they have none */
export function UserAvatar({ name, avatarUrl, className }: UserAvatarProps) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F4EBE8] text-sm font-semibold text-[#5C3D33]",
        className,
      )}
    >
      {avatarUrl ? (
        // Avatars come from several hosts, so they skip the image optimiser
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className="size-full object-cover" />
      ) : (
        initials
      )}
    </span>
  );
}

interface DetailListProps {
  items: [label: string, value: string][];
  className?: string;
}

/** Small grey labels over bold values, used down the side of detail cards */
export function DetailList({ items, className }: DetailListProps) {
  return (
    <dl className={cn("flex flex-col gap-5", className)}>
      {items.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs text-[#667085]">{label}</dt>
          <dd className="mt-1.5 break-words text-sm font-semibold text-[#101828]">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
