import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { mentorOnboardingLetters } from '../email/letters/mentor-onboarding.letters';
import { menteeOnboardingLetters } from '../email/letters/mentee-onboarding.letters';
import type { Letter } from '../email/letters/letter.types';
import { isValidUnsubscribeToken } from '../email/unsubscribe-token';
import { OnboardingEmailsRepository } from './onboarding-emails.repository';

const DAY_MS = 24 * 60 * 60 * 1000;
/** Resend allows 2 requests a second; stay under it */
const SEND_GAP_MS = 600;
/** The settings type that turns these emails off */
export const TIPS_PREFERENCE = 'tips';

type Recipient = {
  id: string;
  email: string;
  firstName: string;
  settings: { notificationPreferences: unknown } | null;
};

/**
 * The 5-day onboarding series. Mentors get day 1 the day after approval;
 * mentees get day 1 straight after signing up. Nothing is stored per email:
 * each run sends the step that fell due since the last run, and Resend drops
 * a repeat of the same step for a day, so a run that overlaps another
 * (after a restart, or on a second server) doesn't email twice.
 */
@Injectable()
export class OnboardingEmailsService {
  private readonly logger = new Logger(OnboardingEmailsService.name);

  constructor(
    private readonly repository: OnboardingEmailsRepository,
    private readonly emailService: EmailService,
  ) {}

  /** Sends every step that fell due in (from, to]; returns how many went out */
  async sendDue(from: Date, to: Date) {
    let sent = 0;

    for (const [index, build] of mentorOnboardingLetters.entries()) {
      const offset = (index + 1) * DAY_MS;
      const mentors = await this.repository.findMentorsApprovedBetween(
        new Date(from.getTime() - offset),
        new Date(to.getTime() - offset),
      );
      for (const mentor of mentors) {
        sent += await this.send(
          mentor,
          build(mentor.firstName, mentor.id),
          `onboarding:mentor:day${index + 1}:${mentor.id}`,
        );
      }
    }

    for (const [index, build] of menteeOnboardingLetters.entries()) {
      const offset = index * DAY_MS;
      const mentees = await this.repository.findMenteesJoinedBetween(
        new Date(from.getTime() - offset),
        new Date(to.getTime() - offset),
      );
      for (const mentee of mentees) {
        sent += await this.send(
          mentee,
          build(mentee.firstName),
          `onboarding:mentee:day${index + 1}:${mentee.id}`,
        );
      }
    }

    return sent;
  }

  /** Turns off tips and onboarding emails from an emailed link, no sign-in needed */
  async unsubscribe(userId: unknown, token: unknown) {
    if (
      typeof userId !== 'string' ||
      typeof token !== 'string' ||
      !isValidUnsubscribeToken(userId, token) ||
      !(await this.repository.userExists(userId))
    ) {
      throw new BadRequestException(
        'This unsubscribe link is invalid. You can change your emails in Settings.',
      );
    }

    const current = await this.repository.findSettings(userId);
    const preferences = readPreferences(current?.notificationPreferences);
    await this.repository.saveNotificationPreferences(userId, {
      ...preferences,
      [TIPS_PREFERENCE]: { ...preferences[TIPS_PREFERENCE], email: false },
    });
    return { unsubscribed: true };
  }

  private async send(recipient: Recipient, letter: Letter, key: string) {
    const preferences = readPreferences(
      recipient.settings?.notificationPreferences,
    );
    if (preferences[TIPS_PREFERENCE]?.email === false) return 0;

    try {
      await this.emailService.sendLetter({
        email: recipient.email,
        letter,
        idempotencyKey: key,
        unsubscribeUserId: recipient.id,
      });
      await new Promise((resolve) => setTimeout(resolve, SEND_GAP_MS));
      return 1;
    } catch (error) {
      this.logger.error(`Onboarding email ${key} failed`, error);
      return 0;
    }
  }
}

function readPreferences(value: unknown) {
  return (
    value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  ) as Record<string, { email?: boolean; inApp?: boolean } | undefined>;
}
