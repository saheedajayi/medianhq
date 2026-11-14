import type { AdminUserStatus } from "@/services/admin/users";
import { cn } from "@/lib/utils";
import { badgeClass } from "../shared/shared";
import { USER_STATUS } from "./user-utils";

interface UserStatusBadgeProps {
  status: AdminUserStatus;
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  return <span className={cn(badgeClass, USER_STATUS[status].className)}>{USER_STATUS[status].label}</span>;
}
