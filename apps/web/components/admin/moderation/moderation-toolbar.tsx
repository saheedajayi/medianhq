"use client";

import { CaptionSelect } from "../shared/caption-select";
import { ALL, SearchField } from "../shared/list-controls";
import { CONTENT_TYPE, FLAG_STATUS } from "./moderation-utils";

const toOptions = (labels: Record<string, { label: string }>) =>
  Object.entries(labels).map(([value, { label }]) => ({ value, label }));

const TYPE_OPTIONS = toOptions(CONTENT_TYPE);
const STATUS_OPTIONS = toOptions(FLAG_STATUS);
const FLAGGED_OVER_OPTIONS = [
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];

const viewButtonClass = "rounded-lg px-6 py-3 text-[15px] font-medium transition-colors";

export interface ModerationFilterValues {
  search: string;
  type: string;
  status: string;
  flaggedOver: string;
}

export const EMPTY_MODERATION_FILTERS: ModerationFilterValues = {
  search: "",
  type: ALL,
  status: ALL,
  flaggedOver: ALL,
};

interface ModerationToolbarProps {
  values: ModerationFilterValues;
  onChange: (values: Partial<ModerationFilterValues>) => void;
  isHistoryOpen: boolean;
  onToggleHistory: () => void;
  onOpenBlocklist: () => void;
}

export function ModerationToolbar({
  values,
  onChange,
  isHistoryOpen,
  onToggleHistory,
  onOpenBlocklist,
}: ModerationToolbarProps) {
  return (
    <div className="flex flex-wrap items-end gap-4 px-5 py-6">
      <SearchField
        value={values.search}
        onChange={(search) => onChange({ search })}
        placeholder="Search by mentor, mentee, or topic..."
        label="Search flagged content"
        className="min-w-56 flex-1 border-0 bg-[#F7F8FB]"
      />
      <CaptionSelect
        caption="Content Type"
        placeholder="All types"
        value={values.type}
        options={TYPE_OPTIONS}
        onChange={(type) => onChange({ type })}
      />
      <CaptionSelect
        caption="Status Type"
        placeholder="All statuses"
        value={values.status}
        options={STATUS_OPTIONS}
        onChange={(status) => onChange({ status })}
      />
      <CaptionSelect
        caption="Flagged Over"
        placeholder="All times"
        value={values.flaggedOver}
        options={FLAGGED_OVER_OPTIONS}
        onChange={(flaggedOver) => onChange({ flaggedOver })}
      />
      <div className="flex gap-2">
        <button
          type="button"
          aria-pressed={isHistoryOpen}
          onClick={onToggleHistory}
          className={`${viewButtonClass} bg-[#FF5514] text-white hover:bg-[#E84D12]`}
        >
          {isHistoryOpen ? "Queue" : "History"}
        </button>
        <button
          type="button"
          onClick={onOpenBlocklist}
          className={`${viewButtonClass} bg-[#EAECF0] text-[#667085] hover:bg-[#D0D5DD]`}
        >
          Blocklist
        </button>
      </div>
    </div>
  );
}
