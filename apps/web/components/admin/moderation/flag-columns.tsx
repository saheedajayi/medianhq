import type { ReactNode } from "react";
import type { ContentFlag, FlagContentType } from "@/services/admin/moderation";
import { ContentTypeChip, FlagDate, FlagStatusChip, ModerationPerson } from "./moderation-cells";
import { formatFlagAge, smallChipClass } from "./moderation-utils";

export interface FlagColumn {
  header: string;
  render: (flag: ContentFlag) => ReactNode;
}

const preview = (flag: ContentFlag) => <p className="line-clamp-2 max-w-44">{flag.content}</p>;
const flaggedAt: FlagColumn = { header: "Flagged at", render: (flag) => <FlagDate iso={flag.flaggedAt} /> };
const status: FlagColumn = { header: "Status", render: (flag) => <FlagStatusChip status={flag.status} /> };
const type = (header: string): FlagColumn => ({
  header,
  render: (flag) => <ContentTypeChip type={flag.contentType} />,
});

// Posts, and the All tab that mixes every type
const CONTENT_COLUMNS: FlagColumn[] = [
  { header: "Content", render: preview },
  type("Type"),
  { header: "User", render: (flag) => <ModerationPerson person={flag.author} /> },
  { header: "Flagged reason", render: (flag) => <p className="max-w-24">{flag.reason}</p> },
  flaggedAt,
  {
    header: "Age",
    render: (flag) => <span className={`${smallChipClass} bg-[#FEE4E2] text-[#F04438]`}>{formatFlagAge(flag.flaggedAt)}</span>,
  },
  status,
];

const MESSAGE_COLUMNS: FlagColumn[] = [
  { header: "Sender", render: (flag) => <ModerationPerson person={flag.author} /> },
  { header: "Receiver", render: (flag) => flag.recipient && <ModerationPerson person={flag.recipient} /> },
  { header: "Message Preview", render: preview },
  type("Message type"),
  status,
  flaggedAt,
];

const PROFILE_COLUMNS: FlagColumn[] = [
  { header: "User", render: (flag) => <ModerationPerson person={flag.author} /> },
  { header: "Profile Text (Preview)", render: preview },
  {
    header: "Content Type",
    render: (flag) => <span className={`${smallChipClass} bg-[#EAF6FE] text-[#1B8FD6]`}>{flag.profileField}</span>,
  },
  status,
  flaggedAt,
];

/** Each tab shows its content type with the columns that suit it */
export const flagColumnsFor = (type?: FlagContentType) =>
  type === "MESSAGE" ? MESSAGE_COLUMNS : type === "PROFILE_TEXT" ? PROFILE_COLUMNS : CONTENT_COLUMNS;
