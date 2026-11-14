import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { CONTACT_SUBJECTS, type ContactMessageDto } from './dto/contact.dto';

const DEFAULT_INBOX = 'hello@medianhq.co';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 80;
const MAX_MESSAGE_LENGTH = 5000;

@Injectable()
export class ContactService {
  constructor(private readonly emailService: EmailService) {}

  /** Emails the message to the team inbox; nothing is stored */
  async send(dto: ContactMessageDto) {
    const firstName = this.readText(
      dto?.firstName,
      'First name',
      MAX_NAME_LENGTH,
    );
    const lastName = this.readText(dto?.lastName, 'Last name', MAX_NAME_LENGTH);
    const email = this.readText(dto?.email, 'Email address', 254).toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
      throw new BadRequestException('Enter a valid email address.');
    }
    const subject = CONTACT_SUBJECTS.find((value) => value === dto?.subject);
    if (!subject) throw new BadRequestException('Choose a subject.');
    const message = this.readText(dto?.message, 'Message', MAX_MESSAGE_LENGTH);

    const sent = await this.emailService.sendContactMessage({
      inbox: process.env.CONTACT_INBOX || DEFAULT_INBOX,
      name: `${firstName} ${lastName}`,
      email,
      subject,
      message,
    });
    if (!sent) {
      throw new ServiceUnavailableException(
        `We couldn't send your message. Please email ${DEFAULT_INBOX} instead.`,
      );
    }
    return { message: "Thanks for reaching out. We'll get back to you soon." };
  }

  private readText(value: unknown, label: string, maxLength: number) {
    const text = typeof value === 'string' ? value.trim() : '';
    if (!text) throw new BadRequestException(`${label} is required.`);
    if (text.length > maxLength) {
      throw new BadRequestException(
        `${label} must be ${maxLength} characters or fewer.`,
      );
    }
    return text;
  }
}
