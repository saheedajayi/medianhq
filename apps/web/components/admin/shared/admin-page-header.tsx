import type { ReactNode } from "react";
import { Notification } from "iconsax-react";

interface AdminPageHeaderProps {
  title: string;
  description: string;
  /** Page actions, shown before the bell */
  children?: ReactNode;
}

/** The title row at the top of an admin page, with its actions and the notification bell */
export function AdminPageHeader({ title, description, children }: AdminPageHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-[#101828]">{title}</h1>
        <p className="mt-1.5 text-sm text-[#667085]">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        {children}
        <button
          type="button"
          aria-label="Notifications"
          className="flex size-10 items-center justify-center rounded-full border border-[#EAECF0] bg-white transition-colors hover:bg-[#F9FAFB]"
        >
          <Notification size="18" variant="Outline" color="#101828" />
        </button>
      </div>
    </header>
  );
}
