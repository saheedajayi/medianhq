"use client";

import { useState, type ReactNode } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, Link2, List, ListOrdered, Underline } from "lucide-react";
import { cn } from "@/lib/utils";
import { toRichTextBlocks, type RichTextBlock } from "./rich-text";

interface RichTextEditorProps {
  ariaLabel: string;
  placeholder?: string;
  onChange: (blocks: RichTextBlock[]) => void;
}

function ToolbarButton({
  label,
  isActive,
  onClick,
  children,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isActive}
      title={label}
      // Keeps the selection in the editor while the button is pressed
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        "flex size-8 items-center justify-center rounded-lg text-[#475467] transition-colors hover:bg-[#F2F4F7]",
        isActive && "bg-[#FFEEE8] text-[#E84D12] hover:bg-[#FFEEE8]"
      )}
    >
      {children}
    </button>
  );
}

/** Adds https:// to "medianhq.co"; anything that isn't a web or email link is refused */
function readLink(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const url = /^(https?:\/\/|mailto:)/i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return URL.canParse(url) ? url : null;
}

/** A message box with a formatting toolbar: bold, italic, underline, lists and links */
export function RichTextEditor({ ariaLabel, placeholder, onChange }: RichTextEditorProps) {
  // null while the link row is closed
  const [linkUrl, setLinkUrl] = useState<string | null>(null);

  const editor = useEditor({
    // Next renders this on the server first, where there is no editor
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        link: { openOnClick: false, autolink: true },
      }),
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ],
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": ariaLabel,
        class: "min-h-64 px-3.5 py-3 text-sm leading-relaxed text-[#101828] outline-none",
      },
    },
    onUpdate: ({ editor: current }) => onChange(toRichTextBlocks(current.getJSON())),
  });

  const active = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: !!current?.isActive("bold"),
      italic: !!current?.isActive("italic"),
      underline: !!current?.isActive("underline"),
      bullets: !!current?.isActive("bulletList"),
      numbers: !!current?.isActive("orderedList"),
      link: !!current?.isActive("link"),
    }),
  });

  if (!editor || !active) {
    return <div className="h-[298px] rounded-xl border border-[#D0D5DD] bg-[#F9FAFB]" />;
  }

  const applyLink = () => {
    const href = readLink(linkUrl ?? "");
    if (!href) return;
    const chain = editor.chain().focus();
    if (editor.state.selection.empty && !editor.isActive("link")) {
      // Nothing selected: the address itself becomes the linked text
      chain.insertContent({ type: "text", text: href, marks: [{ type: "link", attrs: { href } }] }).run();
    } else {
      chain.extendMarkRange("link").setLink({ href }).run();
    }
    setLinkUrl(null);
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkUrl(null);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-[#D0D5DD] focus-within:border-[#FF5514]">
      <div className="flex flex-wrap items-center gap-1 border-b border-[#EAECF0] bg-[#F9FAFB] px-2 py-1.5">
        <ToolbarButton label="Bold" isActive={active.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          isActive={active.italic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          isActive={active.underline}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline className="size-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-[#EAECF0]" />
        <ToolbarButton
          label="Bulleted list"
          isActive={active.bullets}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          isActive={active.numbers}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-[#EAECF0]" />
        <ToolbarButton
          label="Link"
          isActive={active.link || linkUrl !== null}
          onClick={() =>
            setLinkUrl(linkUrl === null ? ((editor.getAttributes("link").href as string | undefined) ?? "") : null)
          }
        >
          <Link2 className="size-4" />
        </ToolbarButton>
      </div>

      {linkUrl !== null && (
        <div className="flex items-center gap-2 border-b border-[#EAECF0] px-2 py-1.5">
          <input
            type="url"
            autoFocus
            aria-label="Link address"
            value={linkUrl}
            onChange={(event) => setLinkUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              applyLink();
            }}
            placeholder="https://medianhq.co"
            className="h-8 min-w-0 flex-1 rounded-lg border border-[#D0D5DD] px-2.5 text-sm font-normal text-[#101828] outline-none placeholder:text-[#98A2B3] focus:border-[#FF5514]"
          />
          <button
            type="button"
            disabled={!readLink(linkUrl)}
            onClick={applyLink}
            className="h-8 rounded-lg px-2.5 text-sm font-medium text-[#E84D12] hover:bg-[#FFEEE8] disabled:text-[#98A2B3] disabled:hover:bg-transparent"
          >
            Apply
          </button>
          {active.link && (
            <button
              type="button"
              onClick={removeLink}
              className="h-8 rounded-lg px-2.5 text-sm font-medium text-[#475467] hover:bg-[#F2F4F7]"
            >
              Remove
            </button>
          )}
        </div>
      )}

      <EditorContent
        editor={editor}
        className={cn(
          "max-h-[45vh] overflow-y-auto font-normal",
          "[&_p]:my-0 [&_p+p]:mt-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6",
          "[&_a]:text-[#E84D12] [&_a]:underline",
          "[&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:float-left [&_p.is-editor-empty:first-child]:before:h-0 [&_p.is-editor-empty:first-child]:before:text-[#98A2B3] [&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]"
        )}
      />
    </div>
  );
}
