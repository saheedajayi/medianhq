"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/base/popover";

const countryCodes =
  "AF AX AL DZ AS AD AO AI AQ AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BQ BA BW BV BR IO BN BG BF BI CV KH CM CA KY CF TD CL CN CX CC CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF TF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT HM VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF MK MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA GS SS ES LK SD SR SJ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UM UY UZ VU VE VN VG VI WF EH YE ZM ZW".split(
    " ",
  );

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

export type CountryOption = {
  label: string;
  value: string;
  code: string;
};

export const COUNTRY_OPTIONS: CountryOption[] = [
  ...countryCodes
    .map((code) => {
      const label = regionNames.of(code) ?? code;
      return {
        label,
        value: label,
        code: code.toLowerCase(),
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label)),
  { label: "Other", value: "Other", code: "other" },
];


export interface CountrySelectProps {
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

export function CountrySelect({
  id = "country",
  name,
  value = "",
  onChange,
  placeholder = "Select a country",
  error,
  disabled = false,
  className = "",
  triggerClassName = "",
}: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedValue, setSelectedValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  const selectedOption = useMemo(() => {
    if (!selectedValue) return undefined;
    const lower = selectedValue.trim().toLowerCase();
    return COUNTRY_OPTIONS.find(
      (opt) =>
        opt.value.toLowerCase() === lower ||
        opt.code.toLowerCase() === lower ||
        opt.label.toLowerCase() === lower,
    );
  }, [selectedValue]);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return COUNTRY_OPTIONS;

    return COUNTRY_OPTIONS.filter((option) =>
      option.label.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  const handleSelect = (option: CountryOption) => {
    setSelectedValue(option.value);
    onChange?.(option.value);
    setOpen(false);
    setQuery("");
  };

  useEffect(() => {
    const form = wrapperRef.current?.closest("form");
    if (!form) return;

    const handleReset = () => {
      setSelectedValue("");
      setQuery("");
      setOpen(false);
      onChange?.("");
    };

    form.addEventListener("reset", handleReset);
    return () => form.removeEventListener("reset", handleReset);
  }, [onChange]);

  const defaultTriggerStyles =
    "flex h-11 w-full items-center justify-between rounded-lg border border-[#D0D5DD] bg-white px-4 text-left text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-[#FF5500] focus-visible:ring-2 focus-visible:ring-[#FF5500]/15 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div ref={wrapperRef} className={`relative min-w-0 ${className}`}>
      {name && <input type="hidden" name={name} value={selectedValue} />}
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          if (disabled) return;
          setOpen(nextOpen);
          if (!nextOpen) setQuery("");
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
            } ${
              selectedOption ? "text-[#101828]" : "text-[#667085]"
            } ${triggerClassName}`}
          >
            <span className="truncate">
              {selectedOption?.label ?? value ?? placeholder}
            </span>
            <ChevronsUpDown className="size-4 shrink-0 opacity-50 text-[#667085]" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] p-0 z-50 bg-white border border-[#E4E7EC] shadow-md rounded-lg"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <div className="flex items-center gap-2 border-b border-[#E4E7EC] px-3">
            <Search className="size-4 shrink-0 text-[#667085]" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search countries..."
              aria-label="Search countries"
              className="h-10 min-w-0 flex-1 bg-transparent text-sm text-[#101828] outline-none placeholder:text-[#667085]"
            />
          </div>
          <div
            id={`${id}-options`}
            role="listbox"
            className="max-h-60 overflow-y-auto p-1"
          >
            {filteredOptions.length ? (
              filteredOptions.map((option) => {
                const isSelected =
                  selectedOption?.value.toLowerCase() ===
                  option.value.toLowerCase();
                return (
                  <button
                    key={option.code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-[#344054] outline-none hover:bg-[#F9FAFB] focus-visible:bg-[#F9FAFB]"
                    onClick={() => handleSelect(option)}
                  >
                    <Check
                      className={`mr-2 size-4 text-[#FF5500] ${
                        isSelected ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    {option.label}
                  </button>
                );
              })
            ) : (
              <p className="px-3 py-6 text-center text-sm text-[#667085]">
                No country found.
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
