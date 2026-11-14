import { Pagination } from "./list-controls";

interface TableFooterProps {
  /** "Showing 1–8 of 21,408 users" */
  summary: string;
  page: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

export function TableFooter({ summary, page, lastPage, onPageChange }: TableFooterProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EAECF0] px-4 py-4">
      <span className="text-xs text-[#667085]">{summary}</span>
      <Pagination page={page} lastPage={lastPage} onChange={onPageChange} />
    </div>
  );
}
