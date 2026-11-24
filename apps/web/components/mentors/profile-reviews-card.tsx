import Image from "next/image";
import { Star } from "lucide-react";
import type { MentorReview } from "./types";

interface ProfileReviewsCardProps {
  rating: number;
  reviewCount: number;
  reviews: MentorReview[];
}

/** The Reviews tab: the overall score, then each review */
export function ProfileReviewsCard({ rating, reviewCount, reviews }: ProfileReviewsCardProps) {
  return (
    <div className="rounded-2xl border border-[#F2F2F7] bg-white p-6">
      {/* Header Score */}
      <div className="flex items-center justify-between border-b border-[#EAECF0] pb-4">
        <h2 className="text-base font-bold text-[#101828]">Reviews</h2>
        <div className="flex items-center gap-1.5">
          <Star className="size-4.5 fill-[#FDB022] text-[#FDB022]" />
          <span className="text-base font-bold text-[#101828]">
            {rating} ({reviewCount})
          </span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="flex flex-col divide-y divide-[#EAECF0]">
        {reviews.length === 0 && (
          <p className="py-8 text-center text-sm text-[#667085]">No reviews yet.</p>
        )}
        {reviews.map((review) => (
          <div key={review.id} className="flex flex-col gap-2.5 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative size-10 overflow-hidden rounded-full border border-[#EAECF0] bg-[#F2F4F7]">
                  <Image
                    src={review.authorAvatar || "/default-avatar.svg"}
                    alt={review.authorName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#101828]">{review.authorName}</span>
                  <span className="text-xs text-[#667085]">{review.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-0.5">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-[#FDB022] text-[#FDB022]" />
                ))}
              </div>
            </div>

            {review.comment && (
              <p className="text-sm leading-relaxed text-[#475467]">&ldquo;{review.comment}&rdquo;</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
