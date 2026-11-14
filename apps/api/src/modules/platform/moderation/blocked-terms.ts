export type BlockedTermRule = { term: string; reason: string };

const escapeRegExp = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * The blocklist terms the text contains. A term only matches as a whole word
 * or phrase, so "scam" doesn't match "scampi", and case is ignored.
 */
export function findBlockedTerms(text: string, rules: BlockedTermRule[]) {
  return rules.filter((rule) => {
    const term = rule.term.trim();
    if (!term) return false;
    // Word boundaries only make sense next to letters and digits
    const start = /^\w/.test(term) ? '\\b' : '';
    const end = /\w$/.test(term) ? '\\b' : '';
    return new RegExp(`${start}${escapeRegExp(term)}${end}`, 'i').test(text);
  });
}
