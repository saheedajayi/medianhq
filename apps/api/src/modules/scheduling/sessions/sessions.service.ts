import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, MentorStatus } from '@prisma/client';
import type { AuthUser } from '../../identity/auth/dto/auth.dto';
import type {
  AvailabilityDto,
  CreateMentorSessionDto,
  UpdateMentorSessionDto,
} from './dto';
import { SessionsRepository } from './sessions.repository';

const MIN_PAID_PRICE: Record<string, number> = { NGN: 100, USD: 1 };
const BOOKINGS_PAGE_SIZE = 8;
const MIN_DURATION_MINUTES = 15;
const MAX_DURATION_MINUTES = 240;
/** Group sessions can't be booked yet, so new ones aren't accepted */
const GROUP_SOON = 'Group sessions are coming soon.';

@Injectable()
export class SessionsService {
  constructor(private readonly sessionsRepository: SessionsRepository) {}

  list(user: AuthUser) {
    this.ensureMentor(user);
    return this.sessionsRepository.findMentorSessions(user.id);
  }

  async create(user: AuthUser, dto: CreateMentorSessionDto) {
    this.ensureMentor(user);
    this.ensureApproved(user);
    this.assertValidDuration(dto.durationMinutes);
    this.assertValidPrice(dto.price ?? 0, dto.currency ?? 'NGN');
    if (dto.type === 'GROUP') throw new BadRequestException(GROUP_SOON);

    return this.sessionsRepository.createSession({
      mentorId: user.id,
      title: dto.title,
      description: dto.description,
      durationMinutes: dto.durationMinutes,
      price: dto.price ?? 0,
      currency: dto.currency ?? 'NGN',
      type: dto.type ?? 'ONE_ON_ONE',
      maxCapacity: dto.maxCapacity,
      flyerUrl: dto.flyerUrl,
      isLive: false,
    });
  }

  async update(user: AuthUser, id: string, dto: UpdateMentorSessionDto) {
    this.ensureMentor(user);
    if (dto.isLive === true) this.ensureApproved(user);
    const existing = await this.findOwnSession(user, id);
    if (dto.type === 'GROUP' && existing.type !== 'GROUP') {
      throw new BadRequestException(GROUP_SOON);
    }

    if (dto.durationMinutes !== undefined) {
      this.assertValidDuration(dto.durationMinutes);
    }
    if (dto.price !== undefined || dto.currency !== undefined) {
      this.assertValidPrice(
        dto.price ?? existing.price,
        dto.currency ?? existing.currency,
      );
    }
    return this.sessionsRepository.updateSession(id, dto);
  }

  async stats(user: AuthUser, id: string) {
    this.ensureMentor(user);
    await this.findOwnSession(user, id);

    const bookings = await this.sessionsRepository.findSessionBookings(id);
    const earnings = await this.sessionsRepository.sumEarnings(
      user.id,
      bookings.map((booking) => booking.id),
    );

    return {
      totalBookings: bookings.length,
      completed: bookings.filter(
        (booking) => booking.status === BookingStatus.COMPLETED,
      ).length,
      pending: bookings.filter(
        (booking) => booking.status === BookingStatus.PENDING_CONFIRMATION,
      ).length,
      // Net of Median's fee, in naira because checkout is always in naira
      earnings: earnings._sum.amount ?? 0,
      paidSessions: earnings._count,
      currency: 'NGN',
    };
  }

  /** Everyone who has booked this session, a page at a time */
  async bookings(user: AuthUser, id: string, pageParam?: string) {
    this.ensureMentor(user);
    await this.findOwnSession(user, id);

    const page = Math.max(1, Number.parseInt(pageParam ?? '', 10) || 1);
    const [bookings, total] =
      await this.sessionsRepository.findSessionBookingsPage(
        id,
        (page - 1) * BOOKINGS_PAGE_SIZE,
        BOOKINGS_PAGE_SIZE,
      );

    return {
      items: bookings.map((booking) => ({
        id: booking.id,
        menteeName:
          `${booking.mentee.firstName} ${booking.mentee.lastName}`.trim(),
        date: booking.startsAt,
        status: booking.status,
      })),
      total,
      page,
      pageSize: BOOKINGS_PAGE_SIZE,
    };
  }

  async remove(user: AuthUser, id: string) {
    this.ensureMentor(user);
    await this.findOwnSession(user, id);
    await this.sessionsRepository.deleteSession(id);
    return { id, deleted: true };
  }

  availability(user: AuthUser) {
    this.ensureMentor(user);
    return this.sessionsRepository.findAvailability(user.id);
  }

  async saveAvailability(user: AuthUser, slots: AvailabilityDto[]) {
    this.ensureMentor(user);
    await this.sessionsRepository.saveAvailability(user.id, slots);
    return this.availability(user);
  }

  private async findOwnSession(user: AuthUser, id: string) {
    const session = await this.sessionsRepository.findMentorSession(
      user.id,
      id,
    );
    if (!session) throw new NotFoundException('Session not found.');
    return session;
  }

  private ensureMentor(user: AuthUser) {
    if (user.role !== 'MENTOR') {
      throw new ForbiddenException('Only mentors can manage sessions.');
    }
  }

  private ensureApproved(user: AuthUser) {
    if (user.mentorStatus !== MentorStatus.APPROVED) {
      throw new ForbiddenException(
        'You can create sessions once your mentor application is approved.',
      );
    }
  }

  private assertValidDuration(minutes: unknown) {
    if (
      !Number.isInteger(minutes) ||
      (minutes as number) < MIN_DURATION_MINUTES ||
      (minutes as number) > MAX_DURATION_MINUTES
    ) {
      throw new BadRequestException(
        `Session length must be between ${MIN_DURATION_MINUTES} and ${MAX_DURATION_MINUTES} minutes.`,
      );
    }
  }

  private assertValidPrice(price: unknown, currency: string) {
    const minimum = MIN_PAID_PRICE[currency];
    if (!minimum) throw new BadRequestException('Currency must be NGN or USD.');
    if (!Number.isInteger(price) || (price as number) < 0) {
      throw new BadRequestException('Price must be a whole number.');
    }
    if ((price as number) > 0 && (price as number) < minimum) {
      throw new BadRequestException(
        `Paid sessions must cost at least ${currency === 'NGN' ? '₦' : '$'}${minimum}.`,
      );
    }
  }
}
