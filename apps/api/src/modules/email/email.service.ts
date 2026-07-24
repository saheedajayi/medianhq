import { Injectable, Logger } from '@nestjs/common';
import { WaitlistAudience } from '@prisma/client';
import { buildMenteeWaitlistConfirmationTemplate } from './templates/mentee-waitlist-confirmation.template';
import { buildMentorWaitlistConfirmationTemplate } from './templates/mentor-waitlist-confirmation.template';
import { buildEmailVerificationTemplate } from './templates/email-verification.template';
import { buildResetPasswordTemplate } from './templates/reset-password.template';

const RESEND_EMAILS_URL = 'https://api.resend.com/emails';
const REQUEST_TIMEOUT_MS = 30_000;
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

type VerificationEmailInput = {
  email: string;
  firstName: string;
  verificationCode: string;
};

type PasswordResetEmailInput = {
  email: string;
  firstName: string;
  resetLink: string;
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

  async sendVerificationEmail(input: VerificationEmailInput) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;

    if (!apiKey || !from) {
      this.logger.warn(
        'Skipping verification email because RESEND_API_KEY or EMAIL_FROM is not configured.',
      );
      return;
    }

    const payload = this.buildVerificationEmailPayload(input, from);
    await this.sendEmail(payload, `verification-email:${input.email}:${input.verificationCode}`);
  }

  async sendPasswordResetEmail(input: PasswordResetEmailInput) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;

    if (!apiKey || !from) {
      this.logger.warn(
        'Skipping password reset email because RESEND_API_KEY or EMAIL_FROM is not configured.',
      );
      return;
    }

    const payload = this.buildPasswordResetPayload(input, from);
    // Extract the token from the resetLink to use as part of the idempotency key
    const token = input.resetLink.split('/').pop() || Date.now().toString();
    await this.sendEmail(payload, `password-reset:${input.email}:${token}`);
  }

  private async sendEmail(payload: ResendEmailPayload, idempotencyKey: string) {
    const apiKey = process.env.RESEND_API_KEY;
    const response = await fetch(RESEND_EMAILS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
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
    const assetUrl = this.getEmailAssetUrl(siteUrl);
    const instagramUrl = process.env.INSTAGRAM_URL ?? DEFAULT_INSTAGRAM_URL;
    const twitterUrl = process.env.TWITTER_URL ?? DEFAULT_TWITTER_URL;
    const linkedinUrl = process.env.LINKEDIN_URL ?? DEFAULT_LINKEDIN_URL;
    const templateInput = {
      firstName: input.firstName,
      audienceLabel,
      waitlistUrl,
      unsubscribeUrl,
      instagramUrl,
      twitterUrl,
      linkedinUrl,
      sentYear: new Date().getFullYear(),
      siteUrl,
      assetUrl,
    };
    const template =
      input.audience === WaitlistAudience.MENTOR
        ? buildMentorWaitlistConfirmationTemplate(templateInput)
        : buildMenteeWaitlistConfirmationTemplate(templateInput);

    return {
      from,
      to: [input.email],
      subject: template.subject,
      html: template.html,
      text: template.text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    };
  }

  private buildVerificationEmailPayload(
    input: VerificationEmailInput,
    from: string,
  ): ResendEmailPayload {
    const replyTo = process.env.EMAIL_REPLY_TO;
    const siteUrl = this.getSiteUrl();
    const assetUrl = this.getEmailAssetUrl(siteUrl);
    const instagramUrl = process.env.INSTAGRAM_URL ?? DEFAULT_INSTAGRAM_URL;
    const twitterUrl = process.env.TWITTER_URL ?? DEFAULT_TWITTER_URL;
    const linkedinUrl = process.env.LINKEDIN_URL ?? DEFAULT_LINKEDIN_URL;
    
    const templateInput = {
      firstName: input.firstName,
      verificationCode: input.verificationCode,
      instagramUrl,
      twitterUrl,
      linkedinUrl,
      sentYear: new Date().getFullYear(),
      siteUrl,
      assetUrl,
    };
    
    const template = buildEmailVerificationTemplate(templateInput);

    return {
      from,
      to: [input.email],
      subject: template.subject,
      html: template.html,
      text: template.text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    };
  }

  private buildPasswordResetPayload(
    input: PasswordResetEmailInput,
    from: string,
  ): ResendEmailPayload {
    const replyTo = process.env.EMAIL_REPLY_TO;
    const siteUrl = this.getSiteUrl();
    const assetUrl = this.getEmailAssetUrl(siteUrl);
    const instagramUrl = process.env.INSTAGRAM_URL ?? DEFAULT_INSTAGRAM_URL;
    const twitterUrl = process.env.TWITTER_URL ?? DEFAULT_TWITTER_URL;
    const linkedinUrl = process.env.LINKEDIN_URL ?? DEFAULT_LINKEDIN_URL;
    
    const templateInput = {
      firstName: input.firstName,
      resetLink: input.resetLink,
      instagramUrl,
      twitterUrl,
      linkedinUrl,
      sentYear: new Date().getFullYear(),
      siteUrl,
      assetUrl,
    };
    
    const template = buildResetPasswordTemplate(templateInput);

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

  private getEmailAssetUrl(siteUrl: string) {
    const assetOrigin = process.env.EMAIL_ASSET_ORIGIN ?? siteUrl;

    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(assetOrigin)) {
      return 'https://www.medianhq.co';
    }

    return assetOrigin.replace(/\/+$/, '');
  }
}
