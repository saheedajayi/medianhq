"use client";

import { useEffect, useMemo, useState } from "react";
import { isMockDataEnabled, mockExploreMentors } from "@/mocks";
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
import { SearchNormal } from "iconsax-react";
import { mentorsService } from "@/services/mentors";
import { applyMentorFilters, countActiveFilters } from "./filter-options";

const USE_MOCKS = isMockDataEnabled("explore");

export function ExploreView() {
  const [mentors, setMentors] = useState<ExploreMentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    mentorsService
      .explore({ limit: 50 })
      .then((res: any) => {
        if (!isMounted) return;
        const apiMentors = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        // Preview data only fills in when there are no real mentors yet
        setMentors(apiMentors.length > 0 || !USE_MOCKS ? apiMentors : mockExploreMentors);
      })
      .catch((err) => {
        console.warn("Could not load mentors from backend API:", err);
        if (isMounted && USE_MOCKS) setMentors(mockExploreMentors);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const [filters, setFilters] = useState<ExploreFilterState>({
    search: "",
    category: "All",
    sortBy: "relevance",
  });

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Count active non-default filters (excluding search and category)
  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);

  // Filtered dataset
  const filteredMentors = useMemo(() => {
    let result = [...mentors];

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

    // 3. Filters panel (expertise, location, price, availability, session type, rating, experience, gender)
    result = applyMentorFilters(result, filters);

    // 4. Sorting
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
  }, [mentors, filters]);

  // Featured mentors for top carousel
  const featuredMentors = useMemo(() => {
    return mentors.filter((m) => m.isFeatured);
  }, [mentors]);

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      search: "",
      category: "All",
      sortBy: "relevance",
    });
  };

  return (
    <div className="relative w-full flex-1 flex flex-col gap-6 pb-12">
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
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[400px] animate-pulse rounded-[20px] border border-[#F2F2F7] bg-[#F7F8FB]"
                />
              ))}
            </div>
          ) : filteredMentors.length === 0 ? (
            <div className="flex flex-col gap-8">
              {/* Empty search notice */}
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-[#FFF4ED]">
                  <SearchNormal size="28" variant="Bulk" color="#FF5500" />
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
                mentors={mentors}
                totalCount={mentors.length}
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
              search: prev.search,
              category: prev.category,
              sortBy: prev.sortBy,
            }))
          }
        />
      </div>
    </div>
  );
}
