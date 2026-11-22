"use client";

import { useState } from "react";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/base/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/base/popover";
import type { Bank } from "@/services/earnings";
import { useBanks } from "@/services/earnings/queries/earnings.queries";
import { cn } from "@/lib/utils";
import { modalInputClass } from "./earnings-modal";

interface BankSelectProps {
  id: string;
  value: Bank | null;
  onChange: (bank: Bank) => void;
}

/** Picks a bank by typing part of its name; the list comes from Paystack */
export function BankSelect({ id, value, onChange }: BankSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: banks, isError, isFetching, refetch } = useBanks();

  const handleSelect = (bank: Bank) => {
    onChange(bank);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={isOpen}
          className={cn(modalInputClass, "text-left", !value && "text-[#98A2B3]")}
        >
          <span className="block truncate">{value?.name ?? "Enter bank name"}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-0">
        <Command>
          <CommandInput placeholder="Search banks" />
          <CommandList onWheel={(e) => e.stopPropagation()} onTouchMove={(e) => e.stopPropagation()}>
            {banks ? (
              <>
                <CommandEmpty>No bank with that name.</CommandEmpty>
                {banks.map((bank) => (
                  <CommandItem key={bank.code} value={`${bank.name} ${bank.code}`} onSelect={() => handleSelect(bank)}>
                    {bank.name}
                  </CommandItem>
                ))}
              </>
            ) : isError && !isFetching ? (
              <div role="alert" className="p-3 text-sm text-[#475467]">
                We couldn&apos;t load the banks.{" "}
                <button type="button" onClick={() => refetch()} className="font-medium text-[#FF5514] hover:underline">
                  Try again
                </button>
              </div>
            ) : (
              <p className="p-3 text-sm text-[#667085]">Loading banks...</p>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
