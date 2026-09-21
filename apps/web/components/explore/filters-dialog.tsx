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
  const [location, setLocation] = useState(filters.location || "");
  const [priceType, setPriceType] = useState(filters.priceType || "all");
  const [minRating, setMinRating] = useState(filters.minRating);
  const [openSection, setOpenSection] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLocation(filters.location || "");
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
      <button type="button" className="fixed inset-0 z-40 bg-black/25 lg:hidden" aria-label="Close filters" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-[min(360px,100vw)] flex-col border-l border-[#E9EAF0] bg-white shadow-xl lg:absolute lg:inset-y-0 lg:right-0 lg:z-10 lg:w-[360px] lg:rounded-r-2xl lg:shadow-sm" aria-label="Filters">
        <div className="flex items-center justify-between border-b border-[#EAECF0] px-6 py-6">
          <h2 className="text-lg font-semibold text-[#101828]">Filters</h2>
          <button type="button" onClick={onClose} aria-label="Close filters" className="rounded-full p-1 text-[#344054] hover:bg-[#F7F8FB]"><X className="size-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6">
          {section("Expertise", <p className="text-xs text-[#667085]">Use the categories above to choose an area of expertise.</p>)}
          {section("Location", <div className="space-y-3 rounded-xl border border-[#EAECF0] p-3">{locations.map((item) => <label key={item} className="flex cursor-pointer items-center gap-2 text-sm text-[#344054]"><input type="checkbox" checked={location === item} onChange={() => setLocation(location === item ? "" : item)} className="accent-[#FF5500]" />{item}</label>)}<input value={locations.includes(location) ? "" : location} onChange={(event) => setLocation(event.target.value)} placeholder="Other location" aria-label="Other location" className="w-full rounded-lg border border-[#EAECF0] px-3 py-2 text-sm outline-none focus:border-[#FF5500]" /></div>)}
          {section("Price range", <div className="space-y-3">{([ ["all", "All prices"], ["free", "Free"], ["paid", "Paid"] ] as const).map(([value, label]) => <label key={value} className="flex cursor-pointer items-center gap-2 text-sm text-[#344054]"><input type="radio" name="priceType" checked={priceType === value} onChange={() => setPriceType(value)} className="accent-[#FF5500]" />{label}</label>)}</div>)}
          {section("Rating", <div className="space-y-3">{([ [0, "Any rating"], [4.5, "4.5 and above"], [4.8, "4.8 and above"], [5, "5 stars"] ] as const).map(([value, label]) => <label key={value} className="flex cursor-pointer items-center gap-2 text-sm text-[#344054]"><input type="radio" name="rating" checked={(minRating || 0) === value} onChange={() => setMinRating(value || undefined)} className="accent-[#FF5500]" />{label}</label>)}</div>)}
        </div>
        <div className="flex items-center justify-between border-t border-[#EAECF0] px-6 py-4">
          <button type="button" onClick={() => { setLocation(""); setPriceType("all"); setMinRating(undefined); onResetFilters(); }} className="rounded-full border border-[#EAECF0] px-4 py-2 text-xs font-medium text-[#475467]">Clear all</button>
          <button type="button" onClick={() => { onApplyFilters({ location: location || undefined, priceType, minRating }); onClose(); }} className="rounded-full bg-[#FF5500] px-5 py-2 text-xs font-semibold text-white">Show results</button>
        </div>
      </aside>
    </>
  );
}
