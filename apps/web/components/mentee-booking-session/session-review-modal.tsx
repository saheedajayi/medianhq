"use client";

import { useState } from "react";
import { Star, Plus, X, Check } from "lucide-react";
import { Booking, ActionItem } from "./types";

interface SessionReviewModalProps {
  booking: Booking;
  onClose: () => void;
  onSubmitReview: (reviewData: {
    rating: number;
    review: string;
    actionItems: ActionItem[];
  }) => void;
}

export function SessionReviewModal({
  booking,
  onClose,
  onSubmitReview,
}: SessionReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState(
    `${booking.mentorName} came prepared, asked thoughtful questions, and made strong progress. The CV summary is clearer and the impact metrics are now easier to scan.`
  );

  const [actionItems, setActionItems] = useState<ActionItem[]>([
    { id: "1", text: "Rewrite CV summary with impact metrics", completed: true },
    { id: "2", text: "Add two quantified project outcomes", completed: false },
    { id: "3", text: "Share updated CV by Sept 25", completed: false },
  ]);

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemText, setNewItemText] = useState("");

  const handleToggleItem = (id: string) => {
    setActionItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleAddActionItem = () => {
    if (!newItemText.trim()) return;
    setActionItems((prev) => [
      ...prev,
      { id: Date.now().toString(), text: newItemText.trim(), completed: false },
    ]);
    setNewItemText("");
    setIsAddingItem(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReview({
      rating,
      review: reviewText,
      actionItems,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/60 p-4 backdrop-blur-xs">
      <div className="relative max-h-[92vh] w-full max-w-[600px] overflow-y-auto rounded-[20px] bg-white p-7 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button matching SVG */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-6 top-6 flex size-8 items-center justify-center rounded-full bg-[#F7F8FB] text-[#101828] transition hover:bg-[#EAECF0]"
        >
          <X className="size-4 stroke-[2.5]" />
        </button>

        {/* Modal Title */}
        <h2 className="text-2xl font-bold tracking-tight text-[#4E0703]">
          Session Review
        </h2>
        <p className="mt-1 text-sm text-[#475467]">
          Your feedback helps {booking.mentorName} act on the next steps from today&apos;s session.
        </p>

        {/* Highlight Banner matching SVG (bg-[#F7F8FB]) */}
        <div className="mt-6 rounded-[12px] bg-[#F7F8FB] p-4">
          <p className="text-sm font-bold text-[#FF5514]">
            {booking.title} with {booking.mentorName}
          </p>
          <p className="mt-1 text-xs font-medium text-[#344054]">
            {booking.fullDateTime}
          </p>
        </div>

        <hr className="my-6 border-[#EAECF0]" />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div>
            <span className="block text-xs font-semibold text-[#344054]">
              How was the session?
            </span>
            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="transition hover:scale-110"
                    >
                      <Star
                        className={`size-5 transition-colors ${
                          isFilled
                            ? "fill-[#FDB022] text-[#FDB022]"
                            : "fill-transparent text-[#FDB022]"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="ml-1 text-xs font-medium text-[#667085]">
                {rating} of 5 stars
              </span>
            </div>
          </div>

          {/* Feedback Textarea */}
          <div>
            <label htmlFor="review-text" className="block text-xs font-semibold text-[#344054]">
              Write a review for {booking.mentorName}
            </label>
            <textarea
              id="review-text"
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="mt-2 w-full resize-none rounded-[8px] border border-[#D0D5DD] p-3.5 text-xs leading-relaxed text-[#344054] placeholder:text-[#98A2B3] focus:border-[#FF5514] focus:outline-none focus:ring-1 focus:ring-[#FF5514]"
              placeholder="Share what went well and key takeaways..."
            />
          </div>

          {/* Structured Action Items matching Mentee - Session Review.svg */}
          <div>
            <span className="block text-xs font-semibold text-[#344054]">
              Structured action items
            </span>

            {/* Individual action item cards with 10px vertical gap */}
            <div className="mt-2.5 space-y-2.5">
              {actionItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleItem(item.id)}
                  className="flex cursor-pointer items-center gap-3 rounded-[8px] border border-[#D0D5DD] bg-white px-3.5 py-2.5 transition hover:border-[#98A2B3] hover:bg-[#F9FAFB]/50"
                >
                  <div
                    className={`flex size-[18px] shrink-0 items-center justify-center rounded-[4px] transition ${
                      item.completed
                        ? "bg-[#FF5514] text-white"
                        : "border-[1.5px] border-[#D0D5DD] bg-white"
                    }`}
                  >
                    {item.completed && <Check className="size-3 stroke-[3]" />}
                  </div>
                  <span className="text-xs font-normal text-[#101828]">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Add action items button or input form */}
            {isAddingItem ? (
              <div className="mt-2.5 flex items-center gap-2">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Type new action item..."
                  className="flex-1 rounded-[8px] border border-[#D0D5DD] px-3 py-2 text-xs text-[#101828] focus:border-[#FF5514] focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddActionItem();
                    }
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddActionItem}
                  className="rounded-full bg-[#FF5514] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#E04406]"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingItem(false);
                    setNewItemText("");
                  }}
                  className="rounded-full border border-[#D0D5DD] bg-white px-3 py-2 text-xs font-medium text-[#667085] hover:bg-[#F2F4F7]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingItem(true)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF5514] hover:underline"
              >
                <Plus className="size-4 stroke-[2.5]" />
                Add action items
              </button>
            )}
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full rounded-full bg-[#FF5514] py-3.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#E04406] active:scale-[0.99]"
          >
            Submit review
          </button>
        </form>
      </div>
    </div>
  );
}
