import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { BookingsService } from '../../scheduling/bookings/bookings.service';
import { AuthService } from '../auth/auth.service';
import type { AuthUser } from '../auth/dto/auth.dto';
import { AccountRepository } from './account.repository';
import { DELETION_GRACE_DAYS, type DeleteAccountDto } from './dto/account.dto';

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly bookingsService: BookingsService,
    private readonly authService: AuthService,
  ) {}

  /**
   * Pauses the account: upcoming sessions are cancelled, the profile is hidden
   * and every device is signed out. Signing in again brings it back.
   */
  async deactivate(user: AuthUser) {
    this.assertCanLeave(user);
    await this.cancelUpcomingSessions(user, 'Account deactivated');
    await this.accountRepository.deactivate(user.id);
    return { success: true };
  }

  /**
   * Books the account for deletion after the grace period. Until then it is
   * hidden, and signing in again (or cancelling) calls the deletion off.
   */
  async scheduleDeletion(
    user: AuthUser,
    dto: DeleteAccountDto,
    now = new Date(),
  ) {
    this.assertCanLeave(user);
    if (dto?.acknowledged !== true) {
      throw new BadRequestException(
        'Confirm that you understand this is permanent after the grace period.',
      );
    }
    await this.authService.assertCurrentPassword(user.id, dto.password);
    if (
      user.role === UserRole.MENTOR &&
      (await this.accountRepository.countPayoutsInFlight(user.id)) > 0
    ) {
      throw new ConflictException(
        'You have a payout on its way. Delete your account once it has been paid.',
      );
    }

    await this.cancelUpcomingSessions(user, 'Account scheduled for deletion');
    const scheduledFor = new Date(now.getTime() + DELETION_GRACE_DAYS * DAY_MS);
    await this.accountRepository.scheduleDeletion(user.id, scheduledFor);
    return { success: true, scheduledFor, graceDays: DELETION_GRACE_DAYS };
  }

  async confirmDeletion(user: AuthUser) {
    const signedOut = await this.accountRepository.signOutIfLeaving(user.id);
    if (!signedOut) {
      throw new ConflictException(
        'This account is not scheduled for deletion.',
      );
    }
    return { success: true };
  }

  async cancelDeletion(user: AuthUser) {
    await this.accountRepository.cancelDeletion(user.id);
    return { success: true };
  }

  /** Erases every account whose grace period has run out; safe to run repeatedly */
  async sweep(now = new Date()) {
    for (const account of await this.accountRepository.findDueForDeletion(
      now,
    )) {
      try {
        await this.accountRepository.erase(account.id, account.email);
      } catch (err) {
        // One account failing must not hold up the rest
        this.logger.error(`Couldn't erase account ${account.id}`, err);
      }
    }
  }

  private assertCanLeave(user: AuthUser) {
    if (user.role !== UserRole.MENTEE && user.role !== UserRole.MENTOR) {
      throw new ForbiddenException(
        'Admin accounts are closed by another admin, not from settings.',
      );
    }
  }

  /** Uses the normal cancellation, so refunds and the other person's email work as usual */
  private async cancelUpcomingSessions(user: AuthUser, reason: string) {
    const bookingIds = await this.accountRepository.findUpcomingBookingIds(
      user.id,
      new Date(),
    );
    for (const id of bookingIds) {
      try {
        await this.bookingsService.cancel(user, id, reason);
      } catch (err) {
        // Already cancelled or just started: nothing left for us to cancel
        if (
          err instanceof ConflictException ||
          err instanceof BadRequestException
        ) {
          continue;
        }
        throw err;
      }
    }
  }
}
