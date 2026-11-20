import type { ReactNode } from "react";
import { Wallet } from "iconsax-react";

interface EarningsEmptyStateProps {
  title: string;
  description: string;
  /** A button under the text, when there is something to do about it */
  action?: ReactNode;
}

/** What a table shows in place of its rows when there are none yet */
export function EarningsEmptyState({ title, description, action }: EarningsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-4 py-14 text-center">
      <span className="flex size-10 items-center justify-center rounded-full bg-[#FFEEE8]">
        <Wallet size="22" variant="Bulk" color="#FF5514" />
      </span>
      <h3 className="mt-5 text-base font-semibold text-[#344054]">{title}</h3>
      <p className="mt-2.5 max-w-[300px] text-sm leading-5 text-[#475467]">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
