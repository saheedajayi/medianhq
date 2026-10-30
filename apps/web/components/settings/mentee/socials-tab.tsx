"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import {
  useSaveSocialLinks,
  useSocialLinks,
} from "@/services/settings/queries/settings.queries";
import {
  cardClass,
  Field,
  FormSkeleton,
  getApiMessage,
  inputClass,
  neutralButtonClass,
  outlineButtonClass,
  TabError,
} from "./shared";

type CustomLink = { title: string; url: string };

export function SocialsTab() {
  const { data, isLoading, isError, isFetching, refetch } = useSocialLinks();
  const saveLinks = useSaveSocialLinks();

  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!data) return;
    const urlOf = (kind: string) => data.find((link) => link.kind === kind)?.url ?? "";
    setLinkedinUrl(urlOf("LINKEDIN"));
    setTwitterUrl(urlOf("X"));
    setWebsiteUrl(urlOf("WEBSITE"));
    setCustomLinks(
      data
        .filter((link) => link.kind === "CUSTOM")
        .map((link) => ({ title: link.title ?? "", url: link.url }))
    );
  }, [data]);

  if (isLoading) return <FormSkeleton rows={3} label="Loading your links" />;
  if (isError || !data) return <TabError onRetry={() => refetch()} isRetrying={isFetching} />;

  const save = async (links: CustomLink[], message: string) => {
    setError("");
    try {
      await saveLinks.mutateAsync({ linkedinUrl, twitterUrl, websiteUrl, links });
      toast.success(message);
      return true;
    } catch (err) {
      setError(getApiMessage(err, "We couldn't save your links. Please try again."));
      return false;
    }
  };

  const handleSaveNewLink = async () => {
    if (!newTitle.trim() || !newUrl.trim()) {
      setError("Add a title and a URL for your link.");
      return;
    }
    const saved = await save([...customLinks, { title: newTitle, url: newUrl }], "Link saved");
    if (saved) {
      setNewTitle("");
      setNewUrl("");
      setIsAdding(false);
    }
  };

  return (
    <section className={`${cardClass} flex flex-col gap-4`}>
      <Field id="linkedin-url" label="LinkedIn URL">
        <input
          id="linkedin-url"
          type="url"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          placeholder="https://www.linkedin.com/in/your-name/"
          className={inputClass}
        />
        <a
          href="https://www.linkedin.com/in/"
          target="_blank"
          rel="noreferrer"
          className="self-start text-sm underline"
        >
          <span className="text-[#475467]">Get your LinkedIn URL</span>
        </a>
      </Field>
      <Field id="x-url" label="X (Twitter)">
        <input
          id="x-url"
          type="url"
          value={twitterUrl}
          onChange={(e) => setTwitterUrl(e.target.value)}
          placeholder="https://x.com/your-name"
          className={inputClass}
        />
      </Field>
      <Field id="website-url" label="Website URL">
        <input
          id="website-url"
          type="url"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://your-website.com"
          className={inputClass}
        />
      </Field>

      {customLinks.map((link, index) => (
        <div
          key={`${link.title}-${index}`}
          className="flex items-center justify-between gap-3 rounded-xl border border-[#EAECF0] px-3 py-2.5"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[#101828]">{link.title}</p>
            <p className="truncate text-xs text-[#667085]">{link.url}</p>
          </div>
          <button
            type="button"
            aria-label={`Remove ${link.title}`}
            disabled={saveLinks.isPending}
            onClick={() =>
              save(customLinks.filter((_, i) => i !== index), "Link removed")
            }
            className="shrink-0 rounded p-1 text-[#475467] hover:bg-[#F2F4F7]"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}

      {isAdding && (
        <div className="flex flex-col gap-4 rounded-2xl border border-[#EAECF0] p-4">
          <Field id="link-title" label="Link title">
            <input
              id="link-title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter title here"
              className={inputClass}
            />
          </Field>
          <Field id="link-url" label="URL">
            <input
              id="link-url"
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Enter URL"
              className={inputClass}
            />
          </Field>
          <div className="flex justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setError("");
              }}
              className={neutralButtonClass}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saveLinks.isPending}
              onClick={handleSaveNewLink}
              className={outlineButtonClass}
            >
              Save link
            </button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm font-medium text-[#D92D20]">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={isAdding}
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-2 px-1 text-sm font-medium text-[#FF5514] disabled:text-[#98A2B3]"
        >
          <Plus className="size-4" />
          Add another link
        </button>
        <button
          type="button"
          disabled={saveLinks.isPending}
          onClick={() => save(customLinks, "Links saved")}
          className={outlineButtonClass}
        >
          {saveLinks.isPending ? "Saving..." : "Save links"}
        </button>
      </div>
    </section>
  );
}
