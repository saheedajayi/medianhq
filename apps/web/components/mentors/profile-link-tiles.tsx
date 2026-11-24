"use client";

import Link from "next/link";
import { Global, Instagram, Send2 } from "iconsax-react";
import { Link2 } from "lucide-react";
import { toast } from "sonner";
import type { MentorLink } from "./types";

const ICON_COLOR = "#FF5514";
const tileClass =
  "flex size-10 items-center justify-center rounded-lg bg-[#FFEEE8] !text-[#FF5514] transition-colors hover:bg-[#FFE1D6]";

function hostOf(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

/** The icon for one saved link; a custom link to Instagram gets Instagram's */
function LinkIcon({ link }: { link: MentorLink }) {
  if (link.kind === "website") return <Global size="24" variant="Bulk" color={ICON_COLOR} />;
  if (link.kind === "linkedin") {
    return (
      <svg className="size-6 fill-current" viewBox="0 0 24 24" aria-hidden>
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 0 0-1.6 1.6 1.6 1.6 0 0 0 1.6 1.6 1.6 1.6 0 0 0 1.6-1.6 1.6 1.6 0 0 0-1.6-1.6Z" />
      </svg>
    );
  }
  if (link.kind === "x") {
    return (
      <svg className="size-5 fill-current" viewBox="0 0 24 24" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (/(^|\.)instagram\.com$/i.test(hostOf(link.url))) {
    return <Instagram size="24" variant="Bulk" color={ICON_COLOR} />;
  }
  return <Link2 className="size-6" />;
}

interface ProfileLinkTilesProps {
  links: MentorLink[];
  /** Adds the share tile; the path of the page to share, e.g. "/mentors/abc" */
  sharePath?: string;
  shareTitle?: string;
}

/** The row of link tiles under a profile's name, ending with the share tile when there is one */
export function ProfileLinkTiles({ links, sharePath, shareTitle }: ProfileLinkTilesProps) {
  const handleShare = async () => {
    if (!sharePath) return;
    const url = new URL(sharePath, window.location.origin).toString();

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: shareTitle, url });
      } catch {
        // Closing the share sheet is not an error
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Profile link copied");
    } catch {
      toast.error("Couldn't copy the profile link");
    }
  };

  if (links.length === 0 && !sharePath) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {links.map((link) => (
        <Link
          key={`${link.kind}-${link.url}`}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          aria-label={link.title}
          title={link.title}
          className={tileClass}
        >
          <LinkIcon link={link} />
        </Link>
      ))}
      {sharePath && (
        <button
          type="button"
          onClick={handleShare}
          aria-label="Share profile"
          title="Share profile"
          className={tileClass}
        >
          <Send2 size="24" variant="Bulk" color={ICON_COLOR} />
        </button>
      )}
    </div>
  );
}
