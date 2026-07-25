"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/base/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/base/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/base/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/base/tooltip";

interface CreatableComboboxProps {
  options: string[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
  disabledMessage?: string;
  onCreate?: (value: string) => void;
}

export function CreatableCombobox({
  options,
  value,
  onValueChange,
  placeholder = "Select an option...",
  emptyText = "No results found.",
  disabled = false,
  disabledMessage,
  onCreate,
}: CreatableComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [disabledTooltipOpen, setDisabledTooltipOpen] = React.useState(false);
  const disabledTooltipTimeout =
    React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (disabledTooltipTimeout.current) {
        clearTimeout(disabledTooltipTimeout.current);
      }
    };
  }, []);

  function showDisabledMessage(autoDismiss = false) {
    if (!disabled || !disabledMessage) return;

    setDisabledTooltipOpen(true);
    if (disabledTooltipTimeout.current) {
      clearTimeout(disabledTooltipTimeout.current);
    }
    if (autoDismiss) {
      disabledTooltipTimeout.current = setTimeout(
        () => setDisabledTooltipOpen(false),
        2500,
      );
    }
  }

  function showDisabledMessageAfterInteraction() {
    if (disabledTooltipTimeout.current) {
      clearTimeout(disabledTooltipTimeout.current);
    }
    disabledTooltipTimeout.current = setTimeout(
      () => showDisabledMessage(true),
      0,
    );
  }

  // Check if current search value exactly matches an existing option (case insensitive)
  const isExactMatch = options.some(
    (opt) => opt.toLowerCase() === searchValue.toLowerCase().trim()
  );

  const combobox = (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between h-[46px] rounded-xl text-[15px] px-3.5 border-[#e2e8f0] bg-transparent shadow-none font-normal text-left hover:bg-transparent hover:text-inherit disabled:opacity-50"
        >
          <span className={cn("truncate", !value && "text-[#94a3b8]")}>
            {value ? value : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder={`Search...`} 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              {searchValue.trim() && !isExactMatch ? (
                <button
                  type="button"
                  className="w-full text-left px-2 py-1.5 text-sm hover:bg-muted hover:text-foreground rounded-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    onValueChange(searchValue.trim());
                    onCreate?.(searchValue.trim());
                    setOpen(false);
                    setSearchValue("");
                  }}
                >
                  Create &quot;{searchValue}&quot;
                </button>
              ) : (
                emptyText
              )}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={(currentValue) => {
                    // CommandItem value is always lowercased by cmdk internally when used as value
                    // We want to pass the original cased option
                    const originalOption = options.find(o => o.toLowerCase() === currentValue) || option;
                    onValueChange(originalOption);
                    setOpen(false);
                    setSearchValue("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value.toLowerCase() === option.toLowerCase() ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option}
                </CommandItem>
              ))}
              {searchValue.trim() && !isExactMatch && (
                 <CommandItem
                 key="create-new"
                 value={searchValue.trim()}
                 onSelect={() => {
                   onValueChange(searchValue.trim());
                   onCreate?.(searchValue.trim());
                   setOpen(false);
                   setSearchValue("");
                 }}
               >
                 <Check className="mr-2 size-4 opacity-0" />
                 Create &quot;{searchValue}&quot;
               </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );

  if (!disabled || !disabledMessage) {
    return combobox;
  }

  return (
    <TooltipProvider>
      <Tooltip
        open={disabledTooltipOpen}
        onOpenChange={setDisabledTooltipOpen}
      >
        <TooltipTrigger asChild>
          <div
            role="button"
            tabIndex={0}
            aria-label={disabledMessage}
            className="w-full cursor-not-allowed [&_button]:pointer-events-none"
            onMouseEnter={() => showDisabledMessage()}
            onMouseLeave={() => setDisabledTooltipOpen(false)}
            onFocus={() => showDisabledMessage()}
            onBlur={() => setDisabledTooltipOpen(false)}
            onClick={showDisabledMessageAfterInteraction}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                showDisabledMessageAfterInteraction();
              }
            }}
          >
            {combobox}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">{disabledMessage}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
