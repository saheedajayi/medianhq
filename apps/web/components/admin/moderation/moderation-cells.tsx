import type { FlagContentType, FlagStatus } from "@/services/admin/moderation";
import { cn } from "@/lib/utils";
import { formatClock, formatLongDate } from "../shared/format";
import { UserAvatar } from "../shared/shared";
import { CONTENT_TYPE, FLAG_STATUS, smallChipClass } from "./moderation-utils";

interface ContentTypeChipProps {
  type: FlagContentType;
  className?: string;
}

export function ContentTypeChip({ type, className }: ContentTypeChipProps) {
  return <span className={cn(smallChipClass, CONTENT_TYPE[type].className, className)}>{CONTENT_TYPE[type].label}</span>;
}

interface FlagStatusChipProps {
  status: FlagStatus;
  className?: string;
}

export function FlagStatusChip({ status, className }: FlagStatusChipProps) {
  return <span className={cn(smallChipClass, FLAG_STATUS[status].className, className)}>{FLAG_STATUS[status].label}</span>;
}

interface ModerationPersonProps {
  person: { name: string; avatarUrl: string | null; role: string };
}

export function ModerationPerson({ person }: ModerationPersonProps) {
  return (
    <div className="flex items-center gap-2">
      <UserAvatar name={person.name} avatarUrl={person.avatarUrl} className="size-7 text-[10px]" />
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-[#101828]">{person.name}</p>
        <p className="text-[10px] text-[#667085]">{person.role}</p>
      </div>
    </div>
  );
}

interface FlagDateProps {
  iso: string;
}

/** The date over the time, as the moderation tables show it */
export function FlagDate({ iso }: FlagDateProps) {
  return (
    <div className="whitespace-nowrap text-[#101828]">
      <p>{formatLongDate(iso)}</p>
      <p className="text-[#475467]">{formatClock(iso)}</p>
    </div>
  );
}
