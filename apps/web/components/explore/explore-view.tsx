"use client";

import { useMemo, useState } from "react";
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
import { Global, SearchNormal } from "iconsax-react";
import { useExploreMentors } from "@/services/mentors/queries/mentors.queries";
import { applyMentorFilters, countActiveFilters } from "./filter-options";
import { ActiveFilterChips } from "./active-filter-chips";
import { MentorCardGridSkeleton } from "./mentor-card-skeleton";


export function ExploreView() {
  const { data: apiMentors, isLoading } = useExploreMentors({ limit: 50 });

  const mentors = useMemo<ExploreMentor[]>(
    () => (Array.isArray(apiMentors) ? (apiMentors as ExploreMentor[]) : []),
    [apiMentors]
  );

  const [filters, setFilters] = useState<ExploreFilterState>({
    search: "",
    category: "All",
    sortBy: "relevance",
  });

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Count active non-default filters (excluding search and category)
  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);
  const isFiltering =
    activeFilterCount > 0 || filters.category !== "All" || filters.search.trim() !== "";

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

  // Chips' "Clear all" only undoes the Filters dialog, keeping the tab, search and sort
  const handleClearPanelFilters = () => {
    setFilters((prev) => ({ search: prev.search, category: prev.category, sortBy: prev.sortBy }));
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

          <ActiveFilterChips
            filters={filters}
            onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
            onClearAll={handleClearPanelFilters}
          />

          {/* Loading, no mentors at all, no match, or results */}
          {isLoading ? (
            <MentorCardGridSkeleton className="gap-6" />
          ) : mentors.length === 0 ? (
            /* No mentors on Median yet: nothing to search or filter */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-[#FFF4ED]">
                <Global size="28" variant="Bulk" color="#FF5500" />
              </div>
              <h3 className="mt-3 text-lg font-semibold text-[#101828]">
                No mentors yet
              </h3>
              <p className="mt-1 max-w-sm text-sm text-[#667085]">
                Mentors will appear here as they join Median. Check back soon.
              </p>
            </div>
          ) : filteredMentors.length === 0 ? (
            <div className="flex flex-col gap-8">
              {/* No match for the current search, category or filters */}
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
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-4 rounded-full bg-[#FF5500] px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#E04B00]"
                >
                  Reset Filters
                </button>
              </div>

              {/* Suggestions so the page isn't a dead end (not a result list) */}
              <FeaturedMentorsSection mentors={featuredMentors} title="YOU MIGHT ALSO LIKE" />
            </div>
          ) : (
            <>
              {/* Featured mentors aren't filtered, so only show them when nothing is narrowing the list */}
              {!isFiltering && <FeaturedMentorsSection mentors={featuredMentors} />}

              {/* Mentors Grid Section */}
              <MentorsGridSection
                mentors={filteredMentors}
                totalCount={filteredMentors.length}
                outOf={isFiltering ? mentors.length : undefined}
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
