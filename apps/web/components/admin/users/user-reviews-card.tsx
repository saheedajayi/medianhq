import type { AdminUserDetail, AdminUserNote } from "@/services/admin/users";
import { cn } from "@/lib/utils";
import { formatCount, formatDay } from "../shared/format";
import { badgeClass, cardClass, cardTitleClass } from "../shared/shared";

interface UserReviewsCardProps {
  reviews: AdminUserDetail["reviews"];
}

/** The latest review written about the user beside the latest one they wrote */
export function UserReviewsCard({ reviews }: UserReviewsCardProps) {
  return (
    <section className={cn(cardClass, "p-5")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={cardTitleClass}>Reviews received &amp; given</h2>
        <span className="text-xs text-[#667085]">
          Received {formatCount(reviews.receivedCount)} · Given {formatCount(reviews.givenCount)}
        </span>
      </div>

      {reviews.received || reviews.given ? (
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          {reviews.received && <ReviewNote kind="Received" note={reviews.received} />}
          {reviews.given && <ReviewNote kind="Given" note={reviews.given} />}
        </div>
      ) : (
        <p className="mt-4 text-sm text-[#667085]">No reviews yet.</p>
      )}
    </section>
  );
}

function ReviewNote({ kind, note }: { kind: "Received" | "Given"; note: AdminUserNote }) {
  return (
    <div className="min-w-0">
      <span
        className={cn(
          badgeClass,
          kind === "Received" ? "bg-[#ECFDF3] text-[#067647]" : "bg-[#F2F4F7] text-[#344054]",
        )}
      >
        {kind} · {note.rating}/5
      </span>
      <p className="mt-2.5 text-sm leading-relaxed text-[#344054]">
        {note.comment ? `“${note.comment}”` : "No written comment."}
      </p>
      <p className="mt-2.5 break-words text-xs text-[#667085]">
        {note.fromName} → {note.toName} · {note.bookingId} · {formatDay(note.createdAt)}
      </p>
    </div>
  );
}
