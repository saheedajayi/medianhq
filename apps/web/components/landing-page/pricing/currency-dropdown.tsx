"use client";

import { useState, useRef, useEffect } from "react";

export type Currency = "NGN" | "USD";

export function NigeriaFlag({
  className = "h-[30px] w-[44px]",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 44 30"
      className={`${className} overflow-hidden rounded-[4px] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] shrink-0`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="44" height="30" rx="4" fill="white" />
      <path d="M0 0H14.67V30H0V0Z" fill="#008751" />
      <path d="M29.33 0H44V30H29.33V0Z" fill="#008751" />
    </svg>
  );
}

export function USAFlag({
  className = "h-[30px] w-[44px]",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 44 30"
      className={`${className} overflow-hidden rounded-[4px] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] shrink-0`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="44" height="30" rx="4" fill="#B22234" />
      <rect y="2.31" width="44" height="2.31" fill="white" />
      <rect y="6.92" width="44" height="2.31" fill="white" />
      <rect y="11.54" width="44" height="2.31" fill="white" />
      <rect y="16.15" width="44" height="2.31" fill="white" />
      <rect y="20.77" width="44" height="2.31" fill="white" />
      <rect y="25.38" width="44" height="2.31" fill="white" />
      <rect width="18" height="16.15" fill="#3C3B6E" />
      <circle cx="4.0" cy="3.5" r="1.1" fill="white" />
      <circle cx="9.0" cy="3.5" r="1.1" fill="white" />
      <circle cx="14.0" cy="3.5" r="1.1" fill="white" />
      <circle cx="6.5" cy="7.8" r="1.1" fill="white" />
      <circle cx="11.5" cy="7.8" r="1.1" fill="white" />
      <circle cx="4.0" cy="12.1" r="1.1" fill="white" />
      <circle cx="9.0" cy="12.1" r="1.1" fill="white" />
      <circle cx="14.0" cy="12.1" r="1.1" fill="white" />
    </svg>
  );
}

export interface CurrencyDropdownProps {
  value?: Currency;
  onChange?: (currency: Currency) => void;
  align?: "left" | "center" | "right";
  className?: string;
}

export function CurrencyDropdown({
  value,
  onChange,
  align = "left",
  className = "",
}: CurrencyDropdownProps) {
  const [internalCurrency, setInternalCurrency] = useState<Currency>("NGN");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentCurrency = value !== undefined ? value : internalCurrency;

  const handleSelect = (curr: Currency) => {
    if (value === undefined) {
      setInternalCurrency(curr);
    }
    onChange?.(curr);
    setIsOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuAlignClass =
    align === "center"
      ? "left-1/2 -translate-x-1/2"
      : align === "right"
      ? "right-0"
      : "left-0";

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex h-[52px] items-center gap-3 rounded-10 border border-[#FCD5C5] bg-[#FFF4ED] pl-3.5 pr-4 text-sm font-semibold text-[#101828] shadow-2xs transition-all hover:bg-[#FFEFE5] hover:border-[#FBBFA7]"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {currentCurrency === "NGN" ? (
          <NigeriaFlag className="h-[30px] w-[44px]" />
        ) : (
          <USAFlag className="h-[30px] w-[44px]" />
        )}
        <div className="h-7 w-[1px] bg-[#FCD5C5]" />
        <span className="text-[#101828] font-semibold text-base">
          {currentCurrency}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#101828"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`absolute ${menuAlignClass} z-30 mt-2 w-44 overflow-hidden rounded-10 border border-[#FCD5C5] bg-white p-1.5 shadow-lg shadow-black/5 animate-in fade-in-50 zoom-in-95 duration-100`}
        >
          <button
            type="button"
            onClick={() => handleSelect("NGN")}
            className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
              currentCurrency === "NGN"
                ? "bg-[#FFF4ED] font-semibold text-[#FF5514]"
                : "text-[#344054] hover:bg-[#FFF9F6]"
            }`}
          >
            <NigeriaFlag className="h-6 w-9" />
            <span>NGN (₦)</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelect("USD")}
            className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
              currentCurrency === "USD"
                ? "bg-[#FFF4ED] font-semibold text-[#FF5514]"
                : "text-[#344054] hover:bg-[#FFF9F6]"
            }`}
          >
            <USAFlag className="h-6 w-9" />
            <span>USD ($)</span>
          </button>
        </div>
      )}
    </div>
  );
}

export const CountryDropdown = CurrencyDropdown;
