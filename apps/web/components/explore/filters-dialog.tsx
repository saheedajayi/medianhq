"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/base/dialog";
import { ExploreFilterState } from "./types";

interface FiltersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ExploreFilterState;
  onApplyFilters: (newFilters: Partial<ExploreFilterState>) => void;
  onResetFilters: () => void;
}

export function FiltersDialog({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}: FiltersDialogProps) {
  const [priceType, setPriceType] = useState<"all" | "free" | "paid">(
    filters.priceType || "all"
  );
  const [minRating, setMinRating] = useState<number | undefined>(
    filters.minRating
  );
  const [location, setLocation] = useState<string>(filters.location || "");

  const handleApply = () => {
    onApplyFilters({
      priceType,
      minRating,
      location: location.trim() || undefined,
    });
    onClose();
  };

  const handleReset = () => {
    setPriceType("all");
    setMinRating(undefined);
    setLocation("");
    onResetFilters();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <DialogHeader className="pb-3 border-b border-[#EAECF0]">
          <DialogTitle className="text-lg font-bold text-[#101828]">
            Filter Mentors
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-4">
          {/* Price Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
              Session Pricing
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["all", "free", "paid"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPriceType(type)}
                  className={`rounded-xl border py-2 text-xs font-medium capitalize transition-colors ${
                    priceType === type
                      ? "border-[#FF5500] bg-[#FFF0EB] text-[#FF5500] font-semibold"
                      : "border-[#EAECF0] bg-white text-[#475467] hover:bg-[#F9FAFB]"
                  }`}
                >
                  {type === "all" ? "All Prices" : type}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
              Minimum Rating
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Any", value: undefined },
                { label: "★ 4.5+", value: 4.5 },
                { label: "★ 4.8+", value: 4.8 },
                { label: "★ 5.0", value: 5.0 },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setMinRating(item.value)}
                  className={`rounded-xl border py-2 text-xs font-medium transition-colors ${
                    minRating === item.value
                      ? "border-[#FF5500] bg-[#FFF0EB] text-[#FF5500] font-semibold"
                      : "border-[#EAECF0] bg-white text-[#475467] hover:bg-[#F9FAFB]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. London, Lagos, San Francisco"
              className="h-10 w-full rounded-xl border border-[#EAECF0] bg-[#F9FAFB] px-3.5 text-sm text-[#101828] placeholder-[#98A2B3] outline-hidden focus:border-[#FF5500] focus:bg-white focus:ring-2 focus:ring-[#FF5500]/20"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between border-t border-[#EAECF0] pt-4">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-medium text-[#667085] hover:text-[#101828]"
          >
            Reset all
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-full bg-[#FF5500] px-5 py-2 text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-[#E04B00]"
          >
            Apply Filters
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
