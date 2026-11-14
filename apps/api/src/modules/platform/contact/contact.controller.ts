import { Body, Controller, HttpCode, Ip, Post } from '@nestjs/common';
import { AuthRateLimiterService } from '../../identity/auth/auth-rate-limiter.service';
import { ContactService } from './contact.service';
import type { ContactMessageDto } from './dto/contact.dto';

const CONTACT_LIMIT = 5;
const CONTACT_WINDOW_MS = 60 * 60 * 1000;

@Controller('contact')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private readonly rateLimiter: AuthRateLimiterService,
  ) {}

  /** The Contact Us form; open to signed-out visitors, a few messages an hour each */
  @Post()
  @HttpCode(200)
  send(@Ip() ip: string, @Body() dto: ContactMessageDto) {
    this.rateLimiter.checkLimit(
      `contact:${ip}`,
      CONTACT_LIMIT,
      CONTACT_WINDOW_MS,
      "You've sent several messages already. Please try again in an hour.",
    );
    return this.contactService.send(dto);
  }
}
