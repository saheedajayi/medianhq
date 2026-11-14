import Link from "next/link";
import { Skeleton } from "@/components/ui/base/skeleton";
import type { AdminUserRow } from "@/services/admin/users";
import { cn } from "@/lib/utils";
import { formatDay, formatMoment } from "../shared/format";
import { UserAvatar, checkboxClass, linkClass, tableCellClass, tableHeadClass } from "../shared/shared";
import { UserStatusBadge } from "./user-status-badge";
import { USER_ROLE } from "./user-utils";

const COLUMNS = ["User", "Role", "Status", "Country", "Joined", "Trust Score", "Last active"];
// The checkbox and View columns sit either side of the named ones
const COLUMN_COUNT = COLUMNS.length + 2;
const SKELETON_ROWS = 8;

interface UsersTableProps {
  /** Undefined while the first page loads */
  users?: AdminUserRow[];
  /** Dims the rows while another page or filter loads */
  isRefreshing: boolean;
  isSelected: (userId: string) => boolean;
  isPageSelected: boolean;
  onToggle: (user: AdminUserRow) => void;
  onTogglePage: () => void;
}

export function UsersTable({
  users,
  isRefreshing,
  isSelected,
  isPageSelected,
  onToggle,
  onTogglePage,
}: UsersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse text-sm">
        <thead className="bg-[#F9FAFB]">
          <tr>
            <th className="w-12 py-3.5 pl-4 text-left">
              <input
                type="checkbox"
                aria-label="Select all users on this page"
                checked={isPageSelected}
                onChange={onTogglePage}
                className={checkboxClass}
              />
            </th>
            {COLUMNS.map((column) => (
              <th key={column} scope="col" className={tableHeadClass}>
                {column}
              </th>
            ))}
            <th className="w-20">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>

        <tbody className={cn("divide-y divide-[#EAECF0]", isRefreshing && "opacity-60")}>
          {!users &&
            Array.from({ length: SKELETON_ROWS }).map((_, index) => (
              <tr key={index}>
                <td colSpan={COLUMN_COUNT} className="px-4 py-4">
                  <Skeleton className="h-9 w-full" />
                </td>
              </tr>
            ))}

          {users?.length === 0 && (
            <tr>
              <td colSpan={COLUMN_COUNT} className="px-4 py-16 text-center text-sm text-[#667085]">
                No users match these filters.
              </td>
            </tr>
          )}

          {users?.map((user) => (
            <tr key={user.id} className={cn(isSelected(user.id) && "bg-[#FFF9F6]")}>
              <td className="py-4 pl-4 align-middle">
                <input
                  type="checkbox"
                  aria-label={`Select ${user.name}`}
                  checked={isSelected(user.id)}
                  onChange={() => onToggle(user)}
                  className={checkboxClass}
                />
              </td>
              <td className={tableCellClass}>
                <div className="flex items-center gap-3">
                  <UserAvatar name={user.name} avatarUrl={user.avatarUrl} />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[#101828]">{user.name}</p>
                    <p className="truncate text-xs text-[#667085]">{user.email}</p>
                  </div>
                </div>
              </td>
              <td className={cn(tableCellClass, "text-[#344054]")}>{USER_ROLE[user.role]}</td>
              <td className={tableCellClass}>
                <UserStatusBadge status={user.status} />
              </td>
              <td className={cn(tableCellClass, "text-[#344054]")}>{user.country ?? "—"}</td>
              <td className={cn(tableCellClass, "whitespace-nowrap text-xs text-[#667085]")}>
                {formatDay(user.joinedAt)}
              </td>
              <td className={cn(tableCellClass, "whitespace-nowrap font-semibold text-[#101828]")}>
                {user.trustScore === null ? "—" : `${user.trustScore} / 100`}
              </td>
              <td className={cn(tableCellClass, "whitespace-nowrap text-xs text-[#667085]")}>
                {user.lastActiveAt ? formatMoment(user.lastActiveAt) : "—"}
              </td>
              <td className={tableCellClass}>
                <Link href={`/admin/users/${user.id}`} className={linkClass}>
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
