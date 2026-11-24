"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/base/dialog";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: ReactNode;
  children: ReactNode;
  /** For dialogs that need more room than a confirmation, e.g. writing an email */
  isWide?: boolean;
}

/** The confirmation dialog used for admin actions: a title, what will happen, then the controls */
export function AdminModal({ isOpen, onClose, title, description, children, isWide = false }: AdminModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn("gap-5 rounded-2xl bg-white p-6", isWide ? "sm:max-w-2xl" : "sm:max-w-md")}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#101828]">{title}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-[#667085]">{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
