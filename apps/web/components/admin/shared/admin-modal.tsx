"use client";

import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/base/dialog";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: ReactNode;
  children: ReactNode;
}

/** The confirmation dialog used for admin actions: a title, what will happen, then the controls */
export function AdminModal({ isOpen, onClose, title, description, children }: AdminModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-5 rounded-2xl bg-white p-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#101828]">{title}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-[#667085]">{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
