import { findBlockedTerms } from '../../../../../src/modules/platform/moderation/blocked-terms';

describe('findBlockedTerms', () => {
  const rules = [
    { term: 'whatsapp', reason: 'Personal contact request' },
    { term: 'quick cash', reason: 'Suspicious and potential scam' },
    { term: 'scam', reason: 'Fraud' },
    { term: 'www.', reason: 'Spam/Self Promotion' },
  ];
  const terms = (text: string) =>
    findBlockedTerms(text, rules).map((rule) => rule.term);

  it('matches whole words and phrases, ignoring case', () => {
    expect(terms('Can we talk on WhatsApp instead?')).toEqual(['whatsapp']);
    expect(terms('DM me for Quick Cash')).toEqual(['quick cash']);
  });

  it('does not match a term inside a longer word', () => {
    expect(terms('I had scampi for lunch')).toEqual([]);
  });

  it('matches terms that start or end with punctuation', () => {
    expect(terms('see www.example.xyz')).toEqual(['www.']);
  });
});
