import { Location, Messages2, Star1 } from "iconsax-react";
import type { AdminUserDetail } from "@/services/admin/users";
import { cn } from "@/lib/utils";
import { formatCount } from "../shared/format";
import { UserAvatar, cardClass } from "../shared/shared";

interface UserProfileCardProps {
  user: AdminUserDetail;
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  const completedSessions = user.sessions.completed;

  return (
    <section className={cn(cardClass, "flex flex-col items-center px-6 py-10 text-center")}>
      <UserAvatar name={user.name} avatarUrl={user.avatarUrl} className="size-28 text-3xl" />
      <h2 className="mt-4 text-lg font-semibold text-[#101828]">{user.name}</h2>
      {user.headline && <p className="mt-1 text-sm text-[#475467]">{user.headline}</p>}

      <p className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-[#475467]">
        {user.city && (
          <span className="flex items-center gap-1">
            <Location size="14" variant="Outline" color="#475467" />
            {user.city}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Messages2 size="14" variant="Outline" color="#475467" />
          {formatCount(completedSessions)} {completedSessions === 1 ? "session" : "sessions"}
        </span>
        {user.rating.average !== null && (
          <span className="flex items-center gap-1">
            <Star1 size="14" variant="Bold" color="#FF5514" />
            {user.rating.average.toFixed(1)} ({user.rating.count})
          </span>
        )}
      </p>

      {user.bio && <p className="mt-5 line-clamp-4 text-[15px] leading-relaxed text-[#475467]">{user.bio}</p>}
    </section>
  );
}
