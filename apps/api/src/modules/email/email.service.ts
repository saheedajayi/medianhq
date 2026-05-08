import { Injectable, Logger } from '@nestjs/common';
import { WaitlistAudience } from '@prisma/client';
import { buildWaitlistConfirmationTemplate } from './templates/waitlist-confirmation.template';

const RESEND_EMAILS_URL = 'https://api.resend.com/emails';
const REQUEST_TIMEOUT_MS = 10_000;
const DEFAULT_INSTAGRAM_URL = 'https://www.instagram.com/median_hq';
const DEFAULT_TWITTER_URL = 'https://x.com/Median_HQ';
const DEFAULT_LINKEDIN_URL = 'https://www.linkedin.com/company/median-hq/';

type WaitlistConfirmationInput = {
  email: string;
  firstName: string;
  audience: WaitlistAudience;
};

type ResendEmailPayload = {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
  reply_to?: string;
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendWaitlistConfirmation(input: WaitlistConfirmationInput) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;

    if (!apiKey || !from) {
      this.logger.warn(
        'Skipping waitlist confirmation email because RESEND_API_KEY or EMAIL_FROM is not configured.',
      );
      return;
    }

    const payload = this.buildWaitlistConfirmationPayload(input, from);
    const response = await fetch(RESEND_EMAILS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `waitlist-confirmation:${input.audience}:${input.email}`,
        'User-Agent': 'Median API',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Resend email request failed with status ${response.status}: ${body}`,
      );
    }
  }

  private buildWaitlistConfirmationPayload(
    input: WaitlistConfirmationInput,
    from: string,
  ): ResendEmailPayload {
    const audienceLabel =
      input.audience === WaitlistAudience.MENTOR ? 'mentor' : 'mentee';
    const replyTo = process.env.EMAIL_REPLY_TO;
    const siteUrl = this.getSiteUrl();
    const waitlistUrl = process.env.WAITLIST_URL ?? `${siteUrl}/waitlist`;
    const unsubscribeUrl = process.env.EMAIL_UNSUBSCRIBE_URL ?? waitlistUrl;
    const instagramUrl = process.env.INSTAGRAM_URL ?? DEFAULT_INSTAGRAM_URL;
    const twitterUrl = process.env.TWITTER_URL ?? DEFAULT_TWITTER_URL;
    const linkedinUrl = process.env.LINKEDIN_URL ?? DEFAULT_LINKEDIN_URL;
    const template = buildWaitlistConfirmationTemplate({
      firstName: input.firstName,
      audienceLabel,
      waitlistUrl,
      unsubscribeUrl,
      instagramUrl,
      twitterUrl,
      linkedinUrl,
      sentYear: new Date().getFullYear(),
      siteUrl,
    });

    return {
      from,
      to: [input.email],
      subject: template.subject,
      html: template.html,
      text: template.text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    };
  }

  private getSiteUrl() {
    return (process.env.WEB_ORIGIN ?? 'https://www.medianhq.co').replace(
      /\/+$/,
      '',
    );
  }
}
