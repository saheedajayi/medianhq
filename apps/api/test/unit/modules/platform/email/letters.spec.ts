import { renderLetter } from '../../../../../src/modules/platform/email/letters/letter.layout';
import { letterFrom } from '../../../../../src/modules/platform/email/email.service';
import { mentorOnboardingLetters } from '../../../../../src/modules/platform/email/letters/mentor-onboarding.letters';
import { menteeOnboardingLetters } from '../../../../../src/modules/platform/email/letters/mentee-onboarding.letters';
import {
  applicationAcceptedLetter,
  applicationDeclinedLetter,
} from '../../../../../src/modules/platform/email/letters/mentor-application.letters';
import {
  isValidUnsubscribeToken,
  signUnsubscribeToken,
} from '../../../../../src/modules/platform/email/unsubscribe-token';

const links = {
  siteUrl: 'https://dev.medianhq.co',
  supportEmail: 'hello@medianhq.co',
  social: {
    twitter: 'https://x.com/Median_HQ',
    instagram: 'https://www.instagram.com/median_hq',
    linkedin: 'https://www.linkedin.com/company/median-hq/',
  },
  preferencesUrl: 'https://dev.medianhq.co/settings?tab=notifications',
};

describe('letters', () => {
  const env = process.env;
  beforeEach(() => {
    process.env = { ...env };
  });
  afterAll(() => {
    process.env = env;
  });

  it('has five days in each onboarding series', () => {
    expect(mentorOnboardingLetters).toHaveLength(5);
    expect(menteeOnboardingLetters).toHaveLength(5);
  });

  it('escapes names and links buttons to the environment it was sent from', () => {
    const { html, text } = renderLetter(
      mentorOnboardingLetters[0]('<Jola>', 'user-1'),
      links,
    );
    expect(html).toContain('Hi &lt;Jola&gt;');
    expect(html).not.toContain('<Jola>');
    expect(html).toContain('href="https://dev.medianhq.co/mentor/profile"');
    expect(text).toContain(
      'Complete Your Profile: https://dev.medianhq.co/mentor/profile',
    );
  });

  it('turns **bold** into strong text and drops the stars from plain text', () => {
    const { html, text } = renderLetter(
      applicationDeclinedLetter('Ada'),
      links,
    );
    expect(html).toMatch(/<strong[^>]*>3 months of Mentee Pro free<\/strong>/);
    expect(text).toContain('3 months of Mentee Pro free so you can');
    expect(text).not.toContain('**');
  });

  it('adds rejection feedback only when the admin wrote some', () => {
    const withFeedback = applicationDeclinedLetter('Ada', ' Add a CV. ');
    const without = applicationDeclinedLetter('Ada', '  ');
    expect(withFeedback.blocks).toContainEqual({
      type: 'paragraph',
      text: 'Feedback from our team: Add a CV.',
    });
    expect(without.blocks.length).toBe(withFeedback.blocks.length - 1);
  });

  it('shows Unsubscribe and WhatsApp only when they are given', () => {
    const plain = renderLetter(applicationAcceptedLetter('Ada'), links).html;
    expect(plain).not.toContain('Unsubscribe');
    expect(plain).not.toContain('WhatsApp');

    const full = renderLetter(applicationAcceptedLetter('Ada'), {
      ...links,
      social: { ...links.social, whatsapp: 'https://wa.me/234' },
      unsubscribeUrl: 'https://dev.medianhq.co/unsubscribe?u=1&t=x',
    }).html;
    expect(full).toContain('>Unsubscribe</a>');
    expect(full).toContain('>WhatsApp</a>');
  });

  it("sends as Mide or the founder, on EMAIL_FROM's address unless their own is set", () => {
    delete process.env.EMAIL_FROM_MIDE;
    delete process.env.EMAIL_FROM_FOUNDER;
    expect(letterFrom('mide', 'Median <hello@medianhq.co>')).toBe(
      'Mide from Median <hello@medianhq.co>',
    );
    expect(letterFrom('founder', 'hello@medianhq.co')).toBe(
      'Abdullah, Founder, Median <hello@medianhq.co>',
    );
    process.env.EMAIL_FROM_MIDE = 'Mide <mide@medianhq.co>';
    expect(letterFrom('mide', 'Median <hello@medianhq.co>')).toBe(
      'Mide <mide@medianhq.co>',
    );
  });

  it('accepts an unsubscribe token only for the account it was made for', () => {
    process.env.EMAIL_LINK_SECRET = 'secret';
    const token = signUnsubscribeToken('user-1') as string;
    expect(isValidUnsubscribeToken('user-1', token)).toBe(true);
    expect(isValidUnsubscribeToken('user-2', token)).toBe(false);
    expect(isValidUnsubscribeToken('user-1', 'nope')).toBe(false);
  });
});
