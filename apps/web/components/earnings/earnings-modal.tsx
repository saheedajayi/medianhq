"use client";

import type { ReactNode } from "react";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface EarningsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: ReactNode;
  children: ReactNode;
  /** Drawn across the top edge, above the title */
  decoration?: ReactNode;
  className?: string;
}

/** The centred dialog used across earnings: a close button, a title, one line of context, then the content */
export function EarningsModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  decoration,
  className,
}: EarningsModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#101828]/40 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            "fixed top-1/2 left-1/2 z-50 max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-[480px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl bg-white p-6 outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            className,
          )}
        >
          {decoration}
          <div className="flex justify-end">
            <Dialog.Close className="relative flex size-8 items-center justify-center rounded-full bg-[#F7F8FB] text-[#101828] transition-colors hover:bg-[#EAECF0]">
              <X className="size-4" strokeWidth={2.5} />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>
          <Dialog.Title className="mt-4 text-center text-2xl font-semibold text-[#101828]">{title}</Dialog.Title>
          <Dialog.Description className="mx-auto mt-3 max-w-[330px] text-center text-base leading-6 text-[#344054]">
            {description}
          </Dialog.Description>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const modalLabelClass = "text-sm font-medium text-[#101828]";
export const modalInputClass =
  "mt-1.5 h-12 w-full rounded-lg border border-[#D0D5DD] bg-white px-3 text-base text-[#101828] outline-none placeholder:text-[#98A2B3] focus:border-[#FF5514]";
export const modalErrorClass = "mt-2 text-sm leading-5 text-[#D92D20]";
