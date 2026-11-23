import { Injectable, Logger } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { EmailService } from '../../platform/email/email.service';
import { MessageEmailsRepository } from './message-emails.repository';

/** How long a message may sit unread before its recipient is emailed */
export const UNREAD_WAIT_MS = 10 * 60 * 1000;
/**
 * An unread message this recent in the same chat means the recipient was
 * already emailed, so later messages stay quiet until they read the chat
 */
export const QUIET_WINDOW_MS = 24 * 60 * 60 * 1000;
/** The settings type that turns these emails off */
const MESSAGES_PREFERENCE = 'messages';

type Person = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole | null;
  suspendedAt: Date | null;
  settings: { notificationPreferences: unknown } | null;
};

/**
 * Emails someone about a message they haven't read after 10 minutes. Two
 * people chatting live read each other's messages well inside that, so they
 * never get one. Nothing is stored per email: only the first unread message
 * of a run of them is emailed, and the email provider drops a repeat of the
 * same message, so overlapping runs don't email twice.
 */
@Injectable()
export class MessageEmailsService {
  private readonly logger = new Logger(MessageEmailsService.name);

  constructor(
    private readonly repository: MessageEmailsRepository,
    private readonly emailService: EmailService,
  ) {}

  /** Emails for messages that passed the wait in (from, to]; returns how many went out */
  async sendDue(from: Date, to: Date) {
    const messages = await this.repository.findUnreadSentBetween(
      new Date(from.getTime() - UNREAD_WAIT_MS),
      new Date(to.getTime() - UNREAD_WAIT_MS),
    );

    let sent = 0;
    for (const message of messages) {
      const people = message.conversation.participants.map((p) => p.user);
      const sender = people.find((person) => person.id === message.senderId);
      const recipient = people.find((person) => person.id !== message.senderId);
      if (!sender || !recipient || recipient.suspendedAt) continue;
      if (!wantsEmail(recipient)) continue;

      const earlierUnread = await this.repository.countUnreadBefore(
        message.conversationId,
        recipient.id,
        new Date(message.createdAt.getTime() - QUIET_WINDOW_MS),
        message.createdAt,
      );
      if (earlierUnread > 0) continue;

      sent += await this.send(message.id, sender, recipient);
    }
    return sent;
  }

  private async send(messageId: string, sender: Person, recipient: Person) {
    const senderName = `${sender.firstName} ${sender.lastName}`.trim();
    const inbox =
      recipient.role === UserRole.MENTOR
        ? '/mentor/messages'
        : '/mentee/messages';
    try {
      await this.emailService.sendBookingUpdate({
        email: recipient.email,
        firstName: recipient.firstName,
        subject: `New message from ${senderName}`,
        paragraphs: [
          `${senderName} sent you a message on Median. Open your inbox to read it and reply.`,
        ],
        details: [],
        ctaLabel: 'Read message',
        ctaPath: `${inbox}?with=${sender.id}`,
        idempotencyKey: `message:${messageId}`,
      });
      return 1;
    } catch (error) {
      this.logger.error(`New message email for ${messageId} failed`, error);
      return 0;
    }
  }
}

function wantsEmail(person: Person) {
  const value = person.settings?.notificationPreferences;
  const preferences = (
    value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  ) as Record<string, { email?: boolean } | undefined>;
  return preferences[MESSAGES_PREFERENCE]?.email !== false;
}
