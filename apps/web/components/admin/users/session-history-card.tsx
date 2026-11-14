import Link from "next/link";
import type { AdminUserDetail, AdminUserSession } from "@/services/admin/users";
import { cn } from "@/lib/utils";
import { formatCount, formatDateTime, formatMoney } from "../shared/format";
import { cardClass, cardTitleClass, linkClass } from "../shared/shared";

// The only two states shown here: the latest finished session and the next one booked
const STATUS_LABEL: Record<string, string> = { COMPLETED: "Completed", CONFIRMED: "Upcoming" };
const sessionChipClass = "rounded-full bg-[#F9FAFB] px-2.5 py-1 text-xs font-medium text-[#344054]";

interface SessionHistoryCardProps {
  sessions: AdminUserDetail["sessions"];
}

export function SessionHistoryCard({ sessions }: SessionHistoryCardProps) {
  return (
    <section className={cn(cardClass, "p-5")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={cardTitleClass}>Session history</h2>
        <span className="text-xs text-[#667085]">
          {formatCount(sessions.completed)} completed · {formatCount(sessions.upcoming)} upcoming
        </span>
      </div>

      {sessions.items.length === 0 ? (
        <p className="mt-4 text-sm text-[#667085]">No completed or upcoming sessions.</p>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {sessions.items.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </section>
  );
}

function SessionCard({ session }: { session: AdminUserSession }) {
  return (
    <article className="rounded-2xl border border-[#EAECF0] p-4">
      <p className="flex flex-wrap gap-2">
        <span className={sessionChipClass}>{session.durationMinutes} mins</span>
        <span className={sessionChipClass}>{STATUS_LABEL[session.status] ?? session.status}</span>
      </p>
      <h3 className="mt-4 text-base font-semibold text-[#101828]">{session.title}</h3>
      <p className="mt-1.5 break-words text-sm text-[#475467]">
        {session.withName} · {session.id}
      </p>
      <p className="mt-4 text-sm text-[#475467]">
        {formatDateTime(session.startsAt)} · {formatMoney(session.amount, session.currency)}
      </p>
      <Link href={`/admin/bookings/${session.id}`} className={cn(linkClass, "mt-3 inline-block")}>
        View record
      </Link>
    </article>
  );
}
