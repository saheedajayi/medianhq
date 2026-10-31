"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ChevronDown, X } from "lucide-react";

interface CreatableMultiSelectProps {
  id: string;
  label: string;
  required?: boolean;
  values: string[];
  onChange: (values: string[]) => void;
  options: string[];
  /** Stops new entries past this many and tells the user why */
  maxItems?: number;
  placeholder?: string;
  error?: string;
}

const isSameText = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/**
 * Pick several values as chips: choose from the options, or type to search and add your own.
 * Custom entries only go to `onChange`; `options` is never changed, so they stay with this user.
 */
export function CreatableMultiSelect({
  id,
  label,
  required = false,
  values,
  onChange,
  options,
  maxItems,
  placeholder = "Select",
  error,
}: CreatableMultiSelectProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  // No option is highlighted until an arrow key is used, so Enter adds what was typed
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const trimmedQuery = query.trim();
  const isSelected = (text: string) => values.some((value) => isSameText(value, text));
  const matches = options.filter(
    (option) => !isSelected(option) && option.toLowerCase().includes(trimmedQuery.toLowerCase())
  );
  const isAtLimit = maxItems !== undefined && values.length >= maxItems;
  const isCustomEntry =
    !isAtLimit &&
    !!trimmedQuery &&
    !isSelected(trimmedQuery) &&
    !options.some((option) => isSameText(option, trimmedQuery));
  const listId = `${id}-options`;
  const hintId = `${id}-hint`;
  const showList = isOpen && !isAtLimit && matches.length > 0;

  useEffect(() => {
    if (highlightedIndex < 0) return;
    listRef.current?.children[highlightedIndex]?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex]);

  const addValue = (raw: string) => {
    const text = raw.trim();
    // Leave what was typed in the field so it isn't lost while they make room
    if (isAtLimit && !isSelected(text)) return;
    setQuery("");
    setHighlightedIndex(-1);
    if (!text || isSelected(text)) return;
    // "figma" becomes the "Figma" option rather than a near-duplicate
    onChange([...values, options.find((option) => isSameText(option, text)) ?? text]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "Enter":
        // Enter would otherwise submit the surrounding form
        e.preventDefault();
        addValue(showList && matches[highlightedIndex] ? matches[highlightedIndex] : query);
        break;
      case "ArrowDown":
      case "ArrowUp": {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          break;
        }
        if (matches.length === 0) break;
        const step = e.key === "ArrowDown" ? 1 : -1;
        setHighlightedIndex((current) =>
          current < 0 && step < 0
            ? matches.length - 1
            : (current + step + matches.length) % matches.length
        );
        break;
      }
      case "Backspace":
        if (!query && values.length > 0) onChange(values.slice(0, -1));
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-[#101828]">
        {label} {required && <span className="text-[#FF5500]">*</span>}
      </label>

      <div className="relative">
        <div
          onClick={() => inputRef.current?.focus()}
          className={`relative flex min-h-11.5 cursor-text flex-wrap items-center gap-2 rounded-xl border bg-white py-2 pl-3 pr-10 focus-within:border-[#FF5500] focus-within:ring-2 focus-within:ring-[#FF5500]/20 ${
            error ? "border-[#D92D20]" : "border-[#D0D5DD]"
          }`}
        >
          {values.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#F2F4F7] px-2 py-1 text-sm text-[#344054]"
            >
              {value}
              <button
                type="button"
                aria-label={`Remove ${value}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(values.filter((item) => item !== value));
                }}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}

          <input
            ref={inputRef}
            id={id}
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              showList && highlightedIndex >= 0 ? `${listId}-${highlightedIndex}` : undefined
            }
            aria-describedby={isCustomEntry || isAtLimit ? hintId : undefined}
            value={query}
            autoComplete="off"
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setHighlightedIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onBlur={() => {
              // Keep what was typed when clicking away; it's one click to remove if unwanted
              addValue(query);
              setIsOpen(false);
            }}
            onKeyDown={handleKeyDown}
            placeholder={values.length === 0 ? placeholder : ""}
            className="min-w-16 flex-1 bg-transparent text-sm text-[#101828] outline-none placeholder:text-[#98A2B3]"
          />

          <button
            type="button"
            tabIndex={-1}
            aria-label={isOpen ? `Close ${label} options` : `Open ${label} options`}
            // mouseDown keeps focus in the input, which would otherwise blur and close the list
            onMouseDown={(e) => {
              e.preventDefault();
              // Decide first: focusing the input opens the list by itself
              const shouldOpen = !isOpen;
              inputRef.current?.focus();
              setIsOpen(shouldOpen);
            }}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-3 top-3.5"
          >
            <ChevronDown
              className={`size-4 text-[#344054] transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* Sits above the list so the options never cover it */}
        {isAtLimit && (
          <p id={hintId} className="mt-1.5 text-xs text-[#667085]">
            You can add up to {maxItems} {label.toLowerCase()}. Remove one to add another.
          </p>
        )}
        {isCustomEntry && (
          <p id={hintId} className="mt-1.5 text-xs text-[#667085]">
            Press Enter to add &ldquo;{trimmedQuery}&rdquo;
          </p>
        )}

        {showList && (
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={`${label} options`}
            className="absolute z-20 mt-1 max-h-44 w-full overflow-y-auto rounded-xl border border-[#EAECF0] bg-white py-1 shadow-sm"
          >
            {matches.map((option, index) => (
              <li
                key={option}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === highlightedIndex}
                // mouseDown runs before the input's blur would add the half-typed text
                onMouseDown={(e) => {
                  e.preventDefault();
                  addValue(option);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`cursor-pointer px-3 py-2 text-sm text-[#101828] ${
                  index === highlightedIndex ? "bg-[#F9FAFB]" : ""
                }`}
              >
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <span className="text-xs font-medium text-[#D92D20]">{error}</span>}
    </div>
  );
}
