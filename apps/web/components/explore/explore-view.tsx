"use client";

import { useMemo, useState } from "react";
import { mockExploreMentors } from "./mock-mentors";
import {
  ExploreCategory,
  ExploreFilterState,
  ExploreMentor,
  SortOption,
} from "./types";
import { ExploreHeader } from "./explore-header";
import { CategoryPills } from "./category-pills";
import { FeaturedMentorsSection } from "./featured-mentors-section";
import { MentorsGridSection } from "./mentors-grid-section";
import { FiltersDialog } from "./filters-dialog";
import { SearchX } from "lucide-react";

interface ExploreViewProps {
  initialMentors?: ExploreMentor[];
}

export function ExploreView({
  initialMentors = mockExploreMentors,
}: ExploreViewProps) {
  const [filters, setFilters] = useState<ExploreFilterState>({
    search: "",
    category: "All",
    sortBy: "relevance",
    priceType: "all",
    minRating: undefined,
    locations: undefined,
  });

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Count active non-default filters (excluding search and category)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.priceType && filters.priceType !== "all") count++;
    if (filters.minRating !== undefined) count++;
    if (filters.locations?.length) count++;
    return count;
  }, [filters]);

  // Filtered dataset
  const filteredMentors = useMemo(() => {
    let result = [...initialMentors];

    // 1. Search filter (name, role, company, bio, tags)
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q) ||
          m.company.toLowerCase().includes(q) ||
          m.bio.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // 2. Category filter
    if (filters.category !== "All") {
      result = result.filter((m) => m.category === filters.category);
    }

    // 3. Price type filter
    if (filters.priceType === "free") {
      result = result.filter((m) => m.price?.toLowerCase() === "free");
    } else if (filters.priceType === "paid") {
      result = result.filter((m) => m.price && m.price.toLowerCase() !== "free");
    }

    // 4. Rating filter
    if (filters.minRating !== undefined) {
      result = result.filter((m) => m.rating >= (filters.minRating ?? 0));
    }

    // 5. Location filter
    if (filters.locations?.length) {
      result = result.filter((m) => filters.locations!.some((location) => m.location.toLowerCase().includes(location.toLowerCase())));
    }

    // 6. Sorting
    switch (filters.sortBy) {
      case "rating":
        result.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
        break;
      case "sessions":
        result.sort((a, b) => b.sessionCount - a.sessionCount);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "relevance":
      default:
        // Featured mentors first, then by rating
        result.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return b.rating - a.rating;
        });
        break;
    }

    return result;
  }, [initialMentors, filters]);

  // Featured mentors for top carousel
  const featuredMentors = useMemo(() => {
    return initialMentors.filter((m) => m.isFeatured);
  }, [initialMentors]);

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      search: "",
      category: "All",
      sortBy: "relevance",
      priceType: "all",
      minRating: undefined,
      locations: undefined,
    });
  };

  return (
    <div className="relative flex flex-col gap-6 rounded-2xl border border-[#EAECF0] bg-white px-5 py-6 pb-12 sm:px-7 lg:px-8">
      {/* 1. Header: Page title and subtitle */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#101828] sm:text-3xl">
          Discover Mentors
        </h1>
        <p className="mt-1 text-sm text-[#667085] sm:text-base">
          Choose a mentor that makes you comfortable.
        </p>
      </div>

      {/* 2. Content Row: Search & Mentors on Left, Filters Sidebar on Right */}
      <div className="flex items-start gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          {/* Search bar and Filters button */}
          <ExploreHeader
            searchQuery={filters.search}
            onSearchChange={(search) => setFilters((prev) => ({ ...prev, search }))}
            onOpenFilters={() => setIsFiltersOpen(true)}
            activeFilterCount={activeFilterCount}
            isFiltersOpen={isFiltersOpen}
          />

          {/* Category Navigation Pills */}
          <CategoryPills
            activeCategory={filters.category}
            onSelectCategory={(category: ExploreCategory) =>
              setFilters((prev) => ({ ...prev, category }))
            }
          />

          {/* When no mentors match, show empty state message, OTHER MENTORS carousel, and fallback grid */}
          {filteredMentors.length === 0 ? (
            <div className="flex flex-col gap-8">
              {/* Empty search notice */}
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-[#FFF0EB] text-[#FF5500]">
                  <SearchX className="size-6" />
                </div>
                <h3 className="mt-3 text-lg font-semibold text-[#101828]">
                  No mentors found
                </h3>
                <p className="mt-1 max-w-sm text-sm text-[#667085]">
                  Try adjusting your filters or search terms<br />to find the right mentor for you.
                </p>
              </div>

              {/* OTHER MENTORS Carousel */}
              <FeaturedMentorsSection mentors={featuredMentors} title="OTHER MENTORS" />

              {/* Fallback All Mentors Grid */}
              <MentorsGridSection
                mentors={initialMentors}
                totalCount={initialMentors.length}
                sortBy={filters.sortBy}
                onSortChange={(sortBy: SortOption) =>
                  setFilters((prev) => ({ ...prev, sortBy }))
                }
                onResetFilters={handleResetFilters}
                isFiltersOpen={isFiltersOpen}
              />
            </div>
          ) : (
            <>
              {/* Featured Mentors Section (shown on "All" view without active text search) */}
              {filters.category === "All" && !filters.search.trim() && (
                <FeaturedMentorsSection mentors={featuredMentors} />
              )}

              {/* Mentors Grid Section */}
              <MentorsGridSection
                mentors={filteredMentors}
                totalCount={filteredMentors.length}
                sortBy={filters.sortBy}
                onSortChange={(sortBy: SortOption) =>
                  setFilters((prev) => ({ ...prev, sortBy }))
                }
                onResetFilters={handleResetFilters}
                isFiltersOpen={isFiltersOpen}
              />
            </>
          )}
        </div>

        {/* Filters panel */}
        <FiltersDialog
          isOpen={isFiltersOpen}
          onClose={() => setIsFiltersOpen(false)}
          filters={filters}
          onApplyFilters={(newFilters) =>
            setFilters((prev) => ({ ...prev, ...newFilters }))
          }
          onResetFilters={() =>
            setFilters((prev) => ({
              ...prev,
              priceType: "all",
              minRating: undefined,
              locations: undefined,
            }))
          }
        />
      </div>
    </div>
  );
}
