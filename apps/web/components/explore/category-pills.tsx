"use client";

import { ExploreCategory } from "./types";

interface CategoryPillsProps {
  activeCategory: ExploreCategory;
  onSelectCategory: (category: ExploreCategory) => void;
}

const categories: ExploreCategory[] = [
  "All",
  "Tech",
  "Finance",
  "Business",
  "Consulting",
];

export function CategoryPills({
  activeCategory,
  onSelectCategory,
}: CategoryPillsProps) {
  return (
    <div className="flex overflow-x-auto pb-1 scrollbar-none">
      <div className="inline-flex h-11 items-center gap-1 rounded-full border border-[#EAECF0]/70 bg-[#F7F8FB] p-1">
        {categories.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory(category)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-white font-semibold text-[#FF5500] shadow-2xs"
                  : "text-[#475467] hover:text-[#101828]"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}
