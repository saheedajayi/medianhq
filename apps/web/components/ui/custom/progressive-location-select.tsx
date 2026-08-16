"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Country,
  State,
  type ICountry,
  type IState,
} from "country-state-city";
import { ChevronsUpDown, Search, MapPin, ChevronRight, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/base/popover";

export interface ProgressiveLocationSelectProps {
  id?: string;
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: boolean | string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
}

type TabStep = "country" | "state";

export function ProgressiveLocationSelect({
  id = "progressive-location",
  name,
  value = "",
  onChange,
  placeholder = "Select country and state...",
  error,
  disabled = false,
  className = "",
  triggerClassName = "",
}: ProgressiveLocationSelectProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabStep>("country");
  const [query, setQuery] = useState("");

  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
  const [selectedState, setSelectedState] = useState<IState | null>(null);

  const [displayValue, setDisplayValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // All Countries list
  const countries = useMemo(() => Country.getAllCountries(), []);

  // States for selected Country
  const states = useMemo(() => {
    if (!selectedCountry) return [];
    return State.getStatesOfCountry(selectedCountry.isoCode);
  }, [selectedCountry]);

  // Parse initial or prop value
  useEffect(() => {
    setDisplayValue(value);
    if (!value) {
      setSelectedCountry(null);
      setSelectedState(null);
      return;
    }

    const parts = value.split(",").map((p) => p.trim());

    const cName = parts[parts.length - 1];
    const sName = parts.length >= 2 ? parts[parts.length - 2] : undefined;

    if (parts.length >= 2 && cName && sName) {
      // Could be "State, Country" or "City, State, Country"
      const foundCountry = countries.find(
        (c) => c.name.toLowerCase() === cName.toLowerCase(),
      );
      if (foundCountry) {
        setSelectedCountry(foundCountry);
        const countryStates = State.getStatesOfCountry(foundCountry.isoCode);
        const foundState = countryStates.find(
          (s) => s.name.toLowerCase() === sName.toLowerCase(),
        );
        if (foundState) {
          setSelectedState(foundState);
        }
      }
    } else if (parts.length === 1 && cName) {
      // Country only
      const foundCountry = countries.find(
        (c) => c.name.toLowerCase() === cName.toLowerCase(),
      );
      if (foundCountry) {
        setSelectedCountry(foundCountry);
      }
    }
  }, [value, countries]);

  // Filtered options based on active tab & query
  const filteredCountries = useMemo(() => {
    if (activeTab !== "country") return [];
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter((c) => c.name.toLowerCase().includes(q));
  }, [countries, activeTab, query]);

  const filteredStates = useMemo(() => {
    if (activeTab !== "state") return [];
    const q = query.trim().toLowerCase();
    if (!q) return states;
    return states.filter((s) => s.name.toLowerCase().includes(q));
  }, [states, activeTab, query]);

  // Finish and emit final formatted location string ("State, Country")
  const finalizeLocation = (sName: string, countryName: string) => {
    const finalStr = `${sName}, ${countryName}`;
    setDisplayValue(finalStr);
    onChange?.(finalStr);
    setOpen(false);
    setQuery("");
  };

  const handleSelectCountry = (country: ICountry) => {
    setSelectedCountry(country);
    setSelectedState(null);
    setQuery("");

    const countryStates = State.getStatesOfCountry(country.isoCode);
    if (countryStates.length > 0) {
      setActiveTab("state");
    } else {
      // If country has no states, use Country name as final location
      setDisplayValue(country.name);
      onChange?.(country.name);
      setOpen(false);
    }
  };

  const handleSelectState = (state: IState) => {
    setSelectedState(state);
    if (selectedCountry) {
      finalizeLocation(state.name, selectedCountry.name);
    }
  };

  const searchPlaceholder =
    activeTab === "country"
      ? "Search countries..."
      : `Search states in ${selectedCountry?.name ?? "country"}...`;

  const defaultTriggerStyles =
    "flex h-11 w-full items-center justify-between rounded-xl border border-[#D0D5DD] bg-white px-4 text-left text-sm shadow-2xs outline-none transition-all focus-visible:border-[#FF5500] focus-visible:ring-2 focus-visible:ring-[#FF5500]/15 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div ref={wrapperRef} className={`relative min-w-0 ${className}`}>
      {name && <input type="hidden" name={name} value={displayValue} />}
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          if (disabled) return;
          setOpen(nextOpen);
          if (!nextOpen) {
            setQuery("");
          } else {
            if (!selectedCountry) setActiveTab("country");
          }
        }}
      >
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-controls={`${id}-options`}
            aria-describedby={error ? `${id}-error` : undefined}
            aria-invalid={Boolean(error)}
            disabled={disabled}
            className={`${defaultTriggerStyles} ${
              error ? "border-[#D92D20]" : ""
            } ${displayValue ? "text-[#101828]" : "text-[#667085]"} ${triggerClassName}`}
          >
            <span className="truncate flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-[#FF5500]" />
              {displayValue || placeholder}
            </span>
            <ChevronsUpDown className="size-4 shrink-0 opacity-50 text-[#667085]" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] min-w-[300px] max-w-[400px] p-0 z-50 bg-white border border-[#E4E7EC] shadow-xl rounded-2xl overflow-hidden"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
        >
          {/* Step Tabs Header */}
          <div className="flex items-center justify-between border-b border-[#EAECF0] bg-[#FAFAFA] px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-xs font-medium">
              {/* Tab 1: Country */}
              <button
                type="button"
                onClick={() => setActiveTab("country")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition-colors ${
                  activeTab === "country"
                    ? "bg-[#FF5500] text-white font-semibold shadow-xs"
                    : selectedCountry
                    ? "bg-[#F2F4F7] text-[#344054] hover:bg-[#E4E7EC]"
                    : "text-[#98A2B3]"
                }`}
              >
                1. Country
              </button>

              <ChevronRight className="size-3 text-[#D0D5DD]" />

              {/* Tab 2: State */}
              <button
                type="button"
                disabled={!selectedCountry}
                onClick={() => selectedCountry && setActiveTab("state")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition-colors ${
                  activeTab === "state"
                    ? "bg-[#FF5500] text-white font-semibold shadow-xs"
                    : selectedState
                    ? "bg-[#F2F4F7] text-[#344054] hover:bg-[#E4E7EC]"
                    : "text-[#98A2B3] cursor-not-allowed"
                }`}
              >
                2. State / Region
              </button>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close location picker"
              className="size-7 flex items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7]"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Search Input Bar */}
          <div className="flex items-center gap-2 border-b border-[#E4E7EC] px-3.5 py-1">
            <Search className="size-4 shrink-0 text-[#667085]" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="h-10 min-w-0 flex-1 bg-transparent text-sm text-[#101828] outline-none placeholder:text-[#98A2B3]"
            />
          </div>

          {/* Active Tab List Content */}
          <div
            id={`${id}-options`}
            role="listbox"
            className="max-h-64 overflow-y-auto p-1.5"
          >
            {/* Country List */}
            {activeTab === "country" && (
              filteredCountries.length ? (
                filteredCountries.map((c) => {
                  const isSelected = selectedCountry?.isoCode === c.isoCode;
                  return (
                    <button
                      key={c.isoCode}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm outline-none transition-colors ${
                        isSelected
                          ? "bg-[#FFF5F0] font-semibold text-[#FF5500]"
                          : "text-[#344054] hover:bg-[#F9FAFB] focus-visible:bg-[#F9FAFB]"
                      }`}
                      onClick={() => handleSelectCountry(c)}
                    >
                      <span>{c.name}</span>
                      <ChevronRight className="size-4 text-[#98A2B3]" />
                    </button>
                  );
                })
              ) : (
                <p className="px-3 py-6 text-center text-sm text-[#667085]">
                  No country found.
                </p>
              )
            )}

            {/* State List */}
            {activeTab === "state" && (
              filteredStates.length ? (
                filteredStates.map((s) => {
                  const isSelected = selectedState?.isoCode === s.isoCode;
                  return (
                    <button
                      key={s.isoCode}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm outline-none transition-colors ${
                        isSelected
                          ? "bg-[#FFF5F0] font-semibold text-[#FF5500]"
                          : "text-[#344054] hover:bg-[#F9FAFB] focus-visible:bg-[#F9FAFB]"
                      }`}
                      onClick={() => handleSelectState(s)}
                    >
                      <span>{s.name}</span>
                    </button>
                  );
                })
              ) : (
                <p className="px-3 py-6 text-center text-sm text-[#667085]">
                  No state found for {selectedCountry?.name}.
                </p>
              )
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
