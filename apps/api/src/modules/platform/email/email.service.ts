import { Injectable, Logger } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { WaitlistAudience } from '@prisma/client';
import { buildMenteeWaitlistConfirmationTemplate } from './templates/mentee-waitlist-confirmation.template';
import { buildMentorWaitlistConfirmationTemplate } from './templates/mentor-waitlist-confirmation.template';
import { buildEmailVerificationTemplate } from './templates/email-verification.template';
import { buildResetPasswordTemplate } from './templates/reset-password.template';
import { buildPasswordChangedTemplate } from './templates/password-changed.template';
import { buildBookingUpdateTemplate } from './templates/booking-update.template';
import {
  buildContactMessageTemplate,
  type ContactMessageTemplateInput,
} from './templates/contact-message.template';
import { SOCIAL_LINKS } from '../../../common/constants/social-links.constant';
import { renderLetter } from './letters/letter.layout';
import {
  SENDER_NAMES,
  type Letter,
  type LetterSender,
} from './letters/letter.types';
import { signUnsubscribeToken } from './unsubscribe-token';

const RESEND_EMAILS_URL = 'https://api.resend.com/emails';
// Seeded demo accounts (packages/database/prisma/demo) use this domain; it has no
// mailbox, so emailing it would only bounce and hurt our sender reputation
const DEMO_EMAIL_DOMAIN = '@demo.medianhq.co';
const REQUEST_TIMEOUT_MS = 30_000;

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
  attachments?: { filename: string; content: string }[];
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

export type PasswordChangedEmailInput = {
  email: string;
  firstName: string;
  changedAt?: Date;
  deviceInfo?: string;
  ipAddress?: string;
};

export type BookingUpdateEmailInput = {
  email: string;
  firstName: string;
  subject: string;
  paragraphs: string[];
  details: { label: string; value: string }[];
  ctaLabel: string;
  /** Path on the web app, e.g. /mentor/bookings?tab=pending */
  ctaPath: string;
  /** Same booking + event must not email twice if a request is retried */
  idempotencyKey: string;
};

export type SendLetterInput = {
  email: string;
  letter: Letter;
  idempotencyKey: string;
  unsubscribeUserId?: string;
};

/**
 * "Mide from Median <mide@…>". Each sender's address comes from its own
 * setting; until that is set, the name goes on EMAIL_FROM's address so the
 * email still sends from a verified domain.
 */
export function letterFrom(sender: LetterSender, fallbackFrom: string) {
  const configured =
    sender === 'mide'
      ? process.env.EMAIL_FROM_MIDE
      : process.env.EMAIL_FROM_FOUNDER;
  if (configured) return configured;
  const address = /<([^>]+)>/.exec(fallbackFrom)?.[1] ?? fallbackFrom.trim();
  return `${SENDER_NAMES[sender]} <${address}>`;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly attachmentCache = new Map<string, Promise<string>>();

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
    await this.sendEmail(
      payload,
      `verification-email:${input.email}:${input.verificationCode}`,
    );
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

  async sendPasswordChangedEmail(input: PasswordChangedEmailInput) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;

    if (!apiKey || !from) {
      this.logger.warn(
        'Skipping password changed email because RESEND_API_KEY or EMAIL_FROM is not configured.',
      );
      return;
    }

    const payload = this.buildPasswordChangedPayload(input, from);
    await this.sendEmail(
      payload,
      `password-changed:${input.email}:${Date.now()}`,
    );
  }

  async sendBookingUpdate(input: BookingUpdateEmailInput) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;

    if (!apiKey || !from) {
      this.logger.warn(
        'Skipping booking email because RESEND_API_KEY or EMAIL_FROM is not configured.',
      );
      return;
    }

    const replyTo = process.env.EMAIL_REPLY_TO;
    const siteUrl = this.getSiteUrl();
    const template = buildBookingUpdateTemplate({
      firstName: input.firstName,
      subject: input.subject,
      paragraphs: input.paragraphs,
      details: input.details,
      ctaLabel: input.ctaLabel,
      ctaUrl: `${siteUrl}${input.ctaPath}`,
      instagramUrl: SOCIAL_LINKS.instagram,
      twitterUrl: SOCIAL_LINKS.twitter,
      linkedinUrl: SOCIAL_LINKS.linkedin,
      sentYear: new Date().getFullYear(),
      siteUrl,
      assetUrl: this.getEmailAssetUrl(siteUrl),
    });

    await this.sendEmail(
      {
        from,
        to: [input.email],
        subject: template.subject,
        html: template.html,
        text: template.text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      },
      input.idempotencyKey,
    );
  }

  /**
   * Sends a personal email from someone at Median (Mide or the founder).
   * Pass unsubscribeUserId for optional emails like the onboarding series,
   * so the footer carries a one-click unsubscribe link.
   */
  async sendLetter(input: SendLetterInput) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;

    if (!apiKey || !from) {
      this.logger.warn(
        `Skipping "${input.letter.subject}" email because RESEND_API_KEY or EMAIL_FROM is not configured.`,
      );
      return;
    }

    const siteUrl = this.getSiteUrl();
    const token = input.unsubscribeUserId
      ? signUnsubscribeToken(input.unsubscribeUserId)
      : null;
    const template = renderLetter(input.letter, {
      siteUrl,
      supportEmail: SOCIAL_LINKS.email,
      social: {
        twitter: SOCIAL_LINKS.twitter,
        instagram: SOCIAL_LINKS.instagram,
        linkedin: SOCIAL_LINKS.linkedin,
        whatsapp: process.env.WHATSAPP_URL || undefined,
      },
      preferencesUrl: `${siteUrl}/settings?tab=notifications`,
      unsubscribeUrl:
        input.unsubscribeUserId && token
          ? `${siteUrl}/unsubscribe?u=${encodeURIComponent(input.unsubscribeUserId)}&t=${token}`
          : undefined,
    });
    const replyTo = process.env.EMAIL_REPLY_TO;
    const attachments = await this.loadAttachments(input.letter);

    await this.sendEmail(
      {
        from: letterFrom(input.letter.sender, from),
        to: [input.email],
        subject: template.subject,
        html: template.html,
        text: template.text,
        ...(replyTo ? { reply_to: replyTo } : {}),
        ...(attachments.length ? { attachments } : {}),
      },
      input.idempotencyKey,
    );
  }

  /** A missing file is logged and left off, so the email itself still goes */
  private async loadAttachments(letter: Letter) {
    const loaded = await Promise.all(
      (letter.attachments ?? []).map(async (attachment) => {
        try {
          return {
            filename: attachment.filename,
            content: await this.readAttachment(attachment.file),
          };
        } catch (error) {
          this.logger.error(
            `Couldn't attach ${attachment.file} to "${letter.subject}"`,
            error,
          );
          return null;
        }
      }),
    );
    return loaded.filter((attachment) => attachment !== null);
  }

  /** Base64 of a file in ./attachments, read once; the build copies these next to this file */
  private readAttachment(file: string) {
    let content = this.attachmentCache.get(file);
    if (!content) {
      content = readFile(join(__dirname, 'attachments', file)).then((data) =>
        data.toString('base64'),
      );
      // A failed read is retried on the next email rather than cached
      content.catch(() => this.attachmentCache.delete(file));
      this.attachmentCache.set(file, content);
    }
    return content;
  }

  /**
   * Passes a Contact Us message to the team inbox, with the sender as the
   * reply-to so the team can answer them directly. Returns false when email
   * isn't configured, so the caller can say the message wasn't delivered.
   */
  async sendContactMessage(
    input: ContactMessageTemplateInput & { inbox: string },
  ) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;

    if (!apiKey || !from) {
      this.logger.warn(
        'Skipping contact message because RESEND_API_KEY or EMAIL_FROM is not configured.',
      );
      return false;
    }

    const template = buildContactMessageTemplate(input);
    await this.sendEmail(
      {
        from,
        to: [input.inbox],
        subject: template.subject,
        html: template.html,
        text: template.text,
        reply_to: input.email,
      },
      `contact:${input.email}:${Date.now()}`,
    );
    return true;
  }

  private async sendEmail(payload: ResendEmailPayload, idempotencyKey: string) {
    const to = payload.to.filter(
      (email) => !email.toLowerCase().endsWith(DEMO_EMAIL_DOMAIN),
    );
    if (to.length === 0) {
      this.logger.log(`Skipping "${payload.subject}" email to a demo account.`);
      return;
    }
    payload = { ...payload, to };

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
    const instagramUrl = SOCIAL_LINKS.instagram;
    const twitterUrl = SOCIAL_LINKS.twitter;
    const linkedinUrl = SOCIAL_LINKS.linkedin;
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
    const instagramUrl = SOCIAL_LINKS.instagram;
    const twitterUrl = SOCIAL_LINKS.twitter;
    const linkedinUrl = SOCIAL_LINKS.linkedin;

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
    const instagramUrl = SOCIAL_LINKS.instagram;
    const twitterUrl = SOCIAL_LINKS.twitter;
    const linkedinUrl = SOCIAL_LINKS.linkedin;

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

  private buildPasswordChangedPayload(
    input: PasswordChangedEmailInput,
    from: string,
  ): ResendEmailPayload {
    const siteUrl = this.getSiteUrl();
    const assetUrl = this.getEmailAssetUrl(siteUrl);
    const replyTo = process.env.EMAIL_REPLY_TO;
    const changedAtStr = (input.changedAt ?? new Date()).toUTCString();

    const template = buildPasswordChangedTemplate({
      firstName: input.firstName,
      changedAt: changedAtStr,
      deviceInfo: input.deviceInfo,
      ipAddress: input.ipAddress,
      recoveryLink: `${siteUrl}/forgot-password`,
      instagramUrl: SOCIAL_LINKS.instagram,
      twitterUrl: SOCIAL_LINKS.twitter,
      linkedinUrl: SOCIAL_LINKS.linkedin,
      sentYear: new Date().getFullYear(),
      siteUrl,
      assetUrl,
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

  private getEmailAssetUrl(siteUrl: string) {
    const assetOrigin = process.env.EMAIL_ASSET_ORIGIN ?? siteUrl;

    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(assetOrigin)) {
      return 'https://www.medianhq.co';
    }

    return assetOrigin.replace(/\/+$/, '');
  }
}
