/**
 * A personal email ("letter") from someone at Median, written as content blocks
 * so the same content renders the sent email and the admin preview.
 * Text may use **bold** for emphasis; everything else is escaped.
 */
export type LetterBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'numbered'; items: { title?: string; text: string }[] }
  /** path is on the web app, e.g. /mentor/profile */
  | { type: 'button'; label: string; path: string };

export type LetterSender = 'mide' | 'founder';

export interface LetterSignature {
  signOff?: string;
  name: string;
  title: string;
}

export interface Letter {
  subject: string;
  sender: LetterSender;
  blocks: LetterBlock[];
  signature: LetterSignature;
}

export const SENDER_NAMES: Record<LetterSender, string> = {
  mide: 'Mide from Median',
  founder: 'Abdullah, Founder, Median',
};

export const MIDE_SIGNATURE: LetterSignature = {
  name: 'Mide',
  title: 'from Median',
};

export const FOUNDER_SIGNATURE: LetterSignature = {
  signOff: 'Warmly,',
  name: 'Abdullah',
  title: 'Founder, Median',
};

export const paragraph = (text: string): LetterBlock => ({
  type: 'paragraph',
  text,
});
