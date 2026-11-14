import { Clock } from "iconsax-react";
import { cn } from "@/lib/utils";
import { outlineButtonClass } from "../shared/shared";

interface ReviewSlaBannerProps {
  sort: "oldest" | "newest";
  onSortChange: (sort: "oldest" | "newest") => void;
}

/** States the review target above the queue, with the queue's sort order */
export function ReviewSlaBanner({ sort, onSortChange }: ReviewSlaBannerProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#FFCAB6] bg-[#FFF6F2] px-4 py-3.5">
      <div className="flex items-start gap-3">
        <Clock size="20" variant="Outline" color="#FF5514" className="mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-[#101828]">Human application review: 3–5 business days</p>
          <p className="mt-1 text-sm text-[#475467]">Application age excludes weekends.</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onSortChange(sort === "oldest" ? "newest" : "oldest")}
        className={cn(outlineButtonClass, "px-3.5 py-2")}
      >
        {sort === "oldest" ? "Oldest first" : "Newest first"}
      </button>
    </div>
  );
}
