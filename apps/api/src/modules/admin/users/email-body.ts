import { BadRequestException } from '@nestjs/common';

/** A run of text with its formatting */
export type EmailSpan = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  link?: string;
};

/**
 * A formatted message as plain data. The admin page sends this instead of
 * HTML, so the email's HTML is always built here and nothing typed or pasted
 * into the editor can smuggle markup into it.
 */
export type EmailBlock =
  | { type: 'paragraph'; spans: EmailSpan[] }
  | { type: 'bullets' | 'numbers'; items: EmailSpan[][] };

const MAX_BLOCKS = 200;
const MAX_SPANS = 500;
const MAX_LINK_LENGTH = 2000;
export const MAX_EMAIL_MESSAGE_LENGTH = 5000;

const invalid = () =>
  new BadRequestException("That message couldn't be read. Please try again.");

function readLink(value: unknown) {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string' || value.length > MAX_LINK_LENGTH) {
    throw invalid();
  }
  // Only web and email links: never javascript: or data:
  if (!/^(https?:\/\/|mailto:)/i.test(value) || !URL.canParse(value)) {
    throw invalid();
  }
  return value;
}

function readSpans(value: unknown): EmailSpan[] {
  if (!Array.isArray(value) || value.length > MAX_SPANS) throw invalid();
  return value.map((raw: unknown) => {
    const span = raw as Record<string, unknown> | null;
    if (!span || typeof span !== 'object' || typeof span.text !== 'string') {
      throw invalid();
    }
    const link = readLink(span.link);
    return {
      text: span.text,
      ...(span.bold === true && { bold: true }),
      ...(span.italic === true && { italic: true }),
      ...(span.underline === true && { underline: true }),
      ...(link && { link }),
    };
  });
}

const hasText = (spans: EmailSpan[]) => spans.some((span) => span.text.trim());

/** Checks a message from the admin page; throws when it is empty, too long or malformed */
export function readEmailBody(value: unknown): EmailBlock[] {
  if (!Array.isArray(value) || value.length > MAX_BLOCKS) throw invalid();

  const blocks = value.flatMap((raw: unknown): EmailBlock[] => {
    const block = raw as Record<string, unknown> | null;
    if (!block || typeof block !== 'object') throw invalid();
    if (block.type === 'paragraph') {
      const spans = readSpans(block.spans);
      return hasText(spans) ? [{ type: 'paragraph', spans }] : [];
    }
    if (block.type === 'bullets' || block.type === 'numbers') {
      if (!Array.isArray(block.items) || block.items.length > MAX_BLOCKS) {
        throw invalid();
      }
      const items = block.items.map(readSpans).filter(hasText);
      return items.length ? [{ type: block.type, items }] : [];
    }
    throw invalid();
  });

  if (blocks.length === 0) {
    throw new BadRequestException('A message is required.');
  }
  if (renderEmailText(blocks).length > MAX_EMAIL_MESSAGE_LENGTH) {
    throw new BadRequestException(
      `The message cannot exceed ${MAX_EMAIL_MESSAGE_LENGTH} characters.`,
    );
  }
  return blocks;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function spansToHtml(spans: EmailSpan[]) {
  return spans
    .map((span) => {
      let html = escapeHtml(span.text).replace(/\n/g, '<br>');
      if (span.bold) html = `<strong>${html}</strong>`;
      if (span.italic) html = `<em>${html}</em>`;
      if (span.underline) html = `<u>${html}</u>`;
      if (span.link) {
        html = `<a href="${escapeHtml(span.link)}" style="color:#FF5514;text-decoration:underline;">${html}</a>`;
      }
      return html;
    })
    .join('');
}

/** The message as HTML for the email body; every piece of text is escaped */
export function renderEmailHtml(blocks: EmailBlock[]) {
  return blocks
    .map((block) => {
      if (block.type === 'paragraph') {
        return `<p>${spansToHtml(block.spans)}</p><br>`;
      }
      const tag = block.type === 'bullets' ? 'ul' : 'ol';
      const items = block.items
        .map((item) => `<li>${spansToHtml(item)}</li>`)
        .join('');
      return `<${tag} style="margin:0;padding:0 0 0 24px;">${items}</${tag}><br>`;
    })
    .join('');
}

const spansToText = (spans: EmailSpan[]) =>
  spans
    .map((span) =>
      span.link && span.link !== span.text
        ? `${span.text} (${span.link})`
        : span.text,
    )
    .join('');

/** The same message without formatting, for the plain-text email and the activity log */
export function renderEmailText(blocks: EmailBlock[]) {
  return blocks
    .map((block) =>
      block.type === 'paragraph'
        ? spansToText(block.spans)
        : block.items
            .map(
              (item, index) =>
                `${block.type === 'bullets' ? '-' : `${index + 1}.`} ${spansToText(item)}`,
            )
            .join('\n'),
    )
    .join('\n\n');
}
