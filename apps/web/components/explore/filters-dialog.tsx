"use client";

import { useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { ExploreFilterState } from "./types";

interface FiltersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ExploreFilterState;
  onApplyFilters: (filters: Partial<ExploreFilterState>) => void;
  onResetFilters: () => void;
}

const locations = ["Lagos", "London", "New York", "Remote", "Accra", "Nairobi"];

export function FiltersDialog({ isOpen, onClose, filters, onApplyFilters, onResetFilters }: FiltersDialogProps) {
  const [selectedLocations, setSelectedLocations] = useState<string[]>(filters.locations || []);
  const [priceType, setPriceType] = useState(filters.priceType || "all");
  const [minRating, setMinRating] = useState(filters.minRating);
  const [openSection, setOpenSection] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedLocations(filters.locations || []);
      setPriceType(filters.priceType || "all");
      setMinRating(filters.minRating);
    }
  }, [isOpen, filters]);

  if (!isOpen) return null;

  const section = (name: string, content: React.ReactNode) => (
    <div className="border-b border-[#EAECF0]">
      <button type="button" onClick={() => setOpenSection(openSection === name ? null : name)} className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-[#344054]" aria-expanded={openSection === name}>
        {name}<ChevronDown className={`size-4 transition-transform ${openSection === name ? "rotate-180" : ""}`} />
      </button>
      {openSection === name && <div className="pb-4">{content}</div>}
    </div>
  );

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/25 lg:hidden"
        aria-label="Close filters"
        onClick={onClose}
      />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-[min(360px,100vw)] flex-col border-l border-[#E9EAF0] bg-white shadow-xl lg:sticky lg:top-6 lg:z-auto lg:h-auto lg:max-h-[calc(100vh-6rem)] lg:w-[360px] lg:shrink-0 lg:rounded-2xl lg:border lg:border-[#EAECF0] lg:shadow-xs"
        aria-label="Filters"
      >
        <div className="flex items-center justify-between border-b border-[#EAECF0] px-6 py-5">
          <h2 className="text-lg font-semibold text-[#101828]">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="flex size-8 items-center justify-center rounded-full bg-[#F7F8FB] text-[#344054] transition-colors hover:bg-[#EAECF0]"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6">
          {section("Expertise", <p className="text-xs text-[#667085]">Use the categories above to choose an area of expertise.</p>)}
          {section("Location", <div className="space-y-3 rounded-xl border border-[#EAECF0] p-3">{locations.map((item) => <label key={item} className="flex cursor-pointer items-center gap-2 text-sm text-[#344054]"><input type="checkbox" checked={selectedLocations.includes(item)} onChange={() => setSelectedLocations(selectedLocations.includes(item) ? selectedLocations.filter((location) => location !== item) : [...selectedLocations, item])} className="accent-[#FF5500]" />{item}</label>)}</div>)}
          {section("Price range", <div className="space-y-3">{([ ["all", "All prices"], ["free", "Free"], ["paid", "Paid"] ] as const).map(([value, label]) => <label key={value} className="flex cursor-pointer items-center gap-2 text-sm text-[#344054]"><input type="radio" name="priceType" checked={priceType === value} onChange={() => setPriceType(value)} className="accent-[#FF5500]" />{label}</label>)}</div>)}
          {section("Availability", <p className="text-xs text-[#667085]">Upcoming dates are shown on each mentor profile.</p>)}
          {section("Session type", <p className="text-xs text-[#667085]">View 1 on 1 and group sessions on each mentor profile.</p>)}
          {section("Rating", <div className="space-y-3">{([ [0, "Any rating"], [4.5, "4.5 and above"], [4.8, "4.8 and above"], [5, "5 stars"] ] as const).map(([value, label]) => <label key={value} className="flex cursor-pointer items-center gap-2 text-sm text-[#344054]"><input type="radio" name="rating" checked={(minRating || 0) === value} onChange={() => setMinRating(value || undefined)} className="accent-[#FF5500]" />{label}</label>)}</div>)}
          {section("Experience level", <p className="text-xs text-[#667085]">Experience levels are not available in this mentor directory yet.</p>)}
          {section("Gender", <p className="text-xs text-[#667085]">Gender preferences are not available in this mentor directory yet.</p>)}
        </div>
        <div className="flex items-center justify-between border-t border-[#EAECF0] px-6 py-4">
          <button
            type="button"
            onClick={() => {
              setSelectedLocations([]);
              setPriceType("all");
              setMinRating(undefined);
              onResetFilters();
            }}
            className="rounded-full border border-[#EAECF0] px-4 py-2 text-xs font-medium text-[#475467] transition-colors hover:bg-[#F9FAFB]"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={() => {
              onApplyFilters({
                locations: selectedLocations.length ? selectedLocations : undefined,
                priceType,
                minRating,
              });
              onClose();
            }}
            className="rounded-full bg-[#FF5500] px-5 py-2 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-[#E04B00]"
          >
            Show results
          </button>
        </div>
      </aside>
    </>
  );
}
