import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import type { Request } from 'express';

const SIGNATURE_HEADER = 'x-paystack-signature';

/**
 * Accepts only webhooks Paystack signed: an HMAC-SHA512 of the raw request
 * body keyed with our secret key, sent in the x-paystack-signature header.
 * Needs the app created with rawBody: true so the exact bytes are kept.
 */
@Injectable()
export class PaystackSignatureGuard implements CanActivate {
  private readonly logger = new Logger(PaystackSignatureGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<RawBodyRequest<Request>>();
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret || !request.rawBody) {
      this.logger.error(
        `Can't check Paystack webhook: ${!secret ? 'PAYSTACK_SECRET_KEY is missing' : 'raw body is not available'}.`,
      );
      throw new UnauthorizedException('Invalid webhook signature.');
    }

    const header = request.headers[SIGNATURE_HEADER];
    const provided = Array.isArray(header) ? header[0] : header;
    const expected = createHmac('sha512', secret)
      .update(request.rawBody)
      .digest('hex');

    const providedBuffer = Buffer.from(provided ?? '', 'utf8');
    const expectedBuffer = Buffer.from(expected, 'utf8');
    if (
      providedBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(providedBuffer, expectedBuffer)
    ) {
      this.logger.warn('Rejected a Paystack webhook with a bad signature.');
      throw new UnauthorizedException('Invalid webhook signature.');
    }
    return true;
  }
}
