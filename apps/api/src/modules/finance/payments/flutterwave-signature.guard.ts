import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'crypto';
import type { Request } from 'express';

const SIGNATURE_HEADER = 'verif-hash';

/**
 * Accepts only webhooks from Flutterwave: its v3 webhooks carry the secret
 * hash set in the Flutterwave dashboard in the verif-hash header. The
 * dashboard must be on v3 webhooks for this header to be sent.
 */
@Injectable()
export class FlutterwaveSignatureGuard implements CanActivate {
  private readonly logger = new Logger(FlutterwaveSignatureGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
    if (!secretHash) {
      this.logger.error(
        "Can't check Flutterwave webhook: FLUTTERWAVE_SECRET_HASH is missing.",
      );
      throw new UnauthorizedException('Invalid webhook signature.');
    }

    const header = request.headers[SIGNATURE_HEADER];
    const provided = Buffer.from(
      (Array.isArray(header) ? header[0] : header) ?? '',
      'utf8',
    );
    const expected = Buffer.from(secretHash, 'utf8');
    if (
      provided.length !== expected.length ||
      !timingSafeEqual(provided, expected)
    ) {
      this.logger.warn('Rejected a Flutterwave webhook with a bad signature.');
      throw new UnauthorizedException('Invalid webhook signature.');
    }
    return true;
  }
}
