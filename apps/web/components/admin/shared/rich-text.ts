import type { JSONContent } from "@tiptap/react";

/** A run of text with its formatting */
export interface RichTextSpan {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  link?: string;
}

/** Formatted writing as plain data, so the API builds the email and never trusts HTML from the browser */
export type RichTextBlock =
  | { type: "paragraph"; spans: RichTextSpan[] }
  | { type: "bullets" | "numbers"; items: RichTextSpan[][] };

function toSpans(nodes: JSONContent[] = []): RichTextSpan[] {
  return nodes.flatMap((node): RichTextSpan[] => {
    if (node.type === "hardBreak") return [{ text: "\n" }];
    if (node.type !== "text" || !node.text) return [];
    const span: RichTextSpan = { text: node.text };
    for (const mark of node.marks ?? []) {
      if (mark.type === "bold") span.bold = true;
      if (mark.type === "italic") span.italic = true;
      if (mark.type === "underline") span.underline = true;
      if (mark.type === "link" && typeof mark.attrs?.href === "string") span.link = mark.attrs.href;
    }
    return [span];
  });
}

const hasText = (spans: RichTextSpan[]) => spans.some((span) => span.text.trim());

/** Reads the editor's document, leaving out empty lines and empty list items */
export function toRichTextBlocks(doc: JSONContent): RichTextBlock[] {
  return (doc.content ?? []).flatMap((node): RichTextBlock[] => {
    if (node.type === "bulletList" || node.type === "orderedList") {
      const items = (node.content ?? [])
        .map((item) => (item.content ?? []).flatMap((child) => toSpans(child.content)))
        .filter(hasText);
      return items.length ? [{ type: node.type === "bulletList" ? "bullets" : "numbers", items }] : [];
    }
    const spans = toSpans(node.content);
    return hasText(spans) ? [{ type: "paragraph", spans }] : [];
  });
}
