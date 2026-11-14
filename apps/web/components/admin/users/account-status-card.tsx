import type { AdminUserDetail } from "@/services/admin/users";
import { cn } from "@/lib/utils";
import { formatDay, formatMoment } from "../shared/format";
import { DetailList, cardClass, cardTitleClass } from "../shared/shared";
import { UserStatusBadge } from "./user-status-badge";

interface AccountStatusCardProps {
  user: AdminUserDetail;
}

export function AccountStatusCard({ user }: AccountStatusCardProps) {
  return (
    <section className={cn(cardClass, "p-5")}>
      <div className="flex items-center justify-between gap-3">
        <h2 className={cardTitleClass}>Account status</h2>
        <UserStatusBadge status={user.status} />
      </div>

      <DetailList
        className="mt-5"
        items={[
          ["Email", user.email],
          ["Joined", formatDay(user.joinedAt, "long")],
          ["Location", user.location ?? "—"],
          ["User ID", user.id],
        ]}
      />

      <p className="mt-5 text-xs text-[#667085]">
        {user.lastActiveAt
          ? `Last active ${formatMoment(user.lastActiveAt).replace("Today,", "today at")} WAT`
          : "No recorded activity"}
      </p>
    </section>
  );
}
