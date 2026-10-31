import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { timingSafeEqual } from 'crypto';
import type { Request } from 'express';
import { AuthService } from '../auth.service';

const BACKOFFICE_KEY_HEADER = 'x-backoffice-key';

/**
 * Allows a signed-in ADMIN, or the backoffice, which has no user accounts and
 * sends the shared BACKOFFICE_ACCESS_KEY in the x-backoffice-key header.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    if (this.hasValidBackofficeKey(request.headers[BACKOFFICE_KEY_HEADER])) {
      return true;
    }

    const token = request.headers.cookie
      ?.split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith('median_session='))
      ?.slice('median_session='.length);

    // Throws 401 when there is no valid session
    const user = await this.authService.getCurrentUser(token);
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required.');
    }

    (request as Request & { user: unknown }).user = user;
    return true;
  }

  private hasValidBackofficeKey(header: string | string[] | undefined) {
    const expected = process.env.BACKOFFICE_ACCESS_KEY;
    const provided = Array.isArray(header) ? header[0] : header;
    if (!expected || !provided) {
      return false;
    }

    const expectedBuffer = Buffer.from(expected);
    const providedBuffer = Buffer.from(provided.trim());
    return (
      expectedBuffer.length === providedBuffer.length &&
      timingSafeEqual(expectedBuffer, providedBuffer)
    );
  }
}
