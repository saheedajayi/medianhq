import type { AdminSessionPerson } from "@/services/admin/sessions";
import { cn } from "@/lib/utils";
import { UserAvatar } from "../shared/shared";
import { sessionTypeColor, squareChipClass } from "./session-utils";

interface SessionPersonCellProps {
  person: Pick<AdminSessionPerson, "name" | "avatarUrl" | "role"> & { country?: string | null };
}

/** A mentor or mentee in a table row: photo, name, then role and country */
export function SessionPersonCell({ person }: SessionPersonCellProps) {
  return (
    <div className="flex items-center gap-2.5">
      <UserAvatar name={person.name} avatarUrl={person.avatarUrl} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[#101828]">{person.name}</p>
        {person.role && <p className="truncate text-xs text-[#667085]">{person.role}</p>}
        {person.country && <p className="truncate text-xs text-[#667085]">{person.country}</p>}
      </div>
    </div>
  );
}

interface SessionTypeChipProps {
  type: string;
}

export function SessionTypeChip({ type }: SessionTypeChipProps) {
  return <span className={cn(squareChipClass, sessionTypeColor(type).chip)}>{type}</span>;
}
