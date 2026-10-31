import { BookingStatus, MentorStatus } from '@prisma/client';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { AuthUser } from '../auth/dto/auth.dto';
import type { AvailabilityDto, CreateMentorSessionDto, UpdateMentorSessionDto } from './dto';

const MIN_PAID_PRICE: Record<string, number> = { NGN: 100, USD: 1 };
const MIN_DURATION_MINUTES = 15;
const MAX_DURATION_MINUTES = 240;

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}
  private ensureMentor(user: AuthUser) { if (user.role !== 'MENTOR') throw new ForbiddenException('Only mentors can manage sessions.'); }
  private ensureApproved(user: AuthUser) {
    if (user.mentorStatus !== MentorStatus.APPROVED) {
      throw new ForbiddenException('You can create sessions once your mentor application is approved.');
    }
  }
  private assertValidDuration(minutes: unknown) {
    if (!Number.isInteger(minutes) || (minutes as number) < MIN_DURATION_MINUTES || (minutes as number) > MAX_DURATION_MINUTES) {
      throw new BadRequestException(`Session length must be between ${MIN_DURATION_MINUTES} and ${MAX_DURATION_MINUTES} minutes.`);
    }
  }
  private assertValidPrice(price: unknown, currency: string) {
    const minimum = MIN_PAID_PRICE[currency];
    if (!minimum) throw new BadRequestException('Currency must be NGN or USD.');
    if (!Number.isInteger(price) || (price as number) < 0) throw new BadRequestException('Price must be a whole number.');
    if ((price as number) > 0 && (price as number) < minimum) {
      throw new BadRequestException(`Paid sessions must cost at least ${currency === 'NGN' ? '₦' : '$'}${minimum}.`);
    }
  }
  list(user: AuthUser) { this.ensureMentor(user); return this.prisma.mentorSession.findMany({ where: { mentorId: user.id }, orderBy: { createdAt: 'asc' } }); }
  async create(user: AuthUser, dto: CreateMentorSessionDto) { this.ensureMentor(user); this.ensureApproved(user); this.assertValidDuration(dto.durationMinutes); this.assertValidPrice(dto.price ?? 0, dto.currency ?? 'NGN'); return this.prisma.mentorSession.create({ data: { mentorId: user.id, title: dto.title, description: dto.description, durationMinutes: dto.durationMinutes, price: dto.price ?? 0, currency: dto.currency ?? 'NGN', type: dto.type ?? 'ONE_ON_ONE', maxCapacity: dto.maxCapacity, flyerUrl: dto.flyerUrl, isLive: false } }); }
  async update(user: AuthUser, id: string, dto: UpdateMentorSessionDto) { this.ensureMentor(user); if (dto.isLive === true) this.ensureApproved(user); const existing = await this.prisma.mentorSession.findFirst({ where: { id, mentorId: user.id } }); if (!existing) throw new NotFoundException('Session not found.'); if (dto.durationMinutes !== undefined) this.assertValidDuration(dto.durationMinutes); if (dto.price !== undefined || dto.currency !== undefined) this.assertValidPrice(dto.price ?? existing.price, dto.currency ?? existing.currency); return this.prisma.mentorSession.update({ where: { id }, data: dto }); }
  async stats(user: AuthUser, id: string) {
    this.ensureMentor(user);
    const session = await this.prisma.mentorSession.findFirst({ where: { id, mentorId: user.id }, select: { id: true } });
    if (!session) throw new NotFoundException('Session not found.');

    // Unpaid checkouts never reached the mentor, so they aren't bookings yet
    const bookings = await this.prisma.booking.findMany({
      where: { mentorSessionId: id, status: { not: BookingStatus.PENDING_PAYMENT } },
      select: { id: true, status: true },
    });
    const earnings = await this.prisma.mentorEarning.aggregate({
      where: { mentorId: user.id, bookingId: { in: bookings.map((booking) => booking.id) } },
      _sum: { amount: true },
      _count: true,
    });

    return {
      totalBookings: bookings.length,
      completed: bookings.filter((booking) => booking.status === BookingStatus.COMPLETED).length,
      pending: bookings.filter((booking) => booking.status === BookingStatus.PENDING_CONFIRMATION).length,
      // Net of Median's fee, in naira because checkout is always in naira
      earnings: earnings._sum.amount ?? 0,
      paidSessions: earnings._count,
      currency: 'NGN',
    };
  }
  async remove(user: AuthUser, id: string) { this.ensureMentor(user); const existing = await this.prisma.mentorSession.findFirst({ where: { id, mentorId: user.id } }); if (!existing) throw new NotFoundException('Session not found.'); await this.prisma.mentorSession.delete({ where: { id } }); return { id, deleted: true }; }
  availability(user: AuthUser) { this.ensureMentor(user); return this.prisma.weeklyAvailability.findMany({ where: { mentorId: user.id }, orderBy: { dayOfWeek: 'asc' } }); }
  async saveAvailability(user: AuthUser, slots: AvailabilityDto[]) { this.ensureMentor(user); await this.prisma.$transaction(slots.map((slot) => this.prisma.weeklyAvailability.upsert({ where: { mentorId_dayOfWeek: { mentorId: user.id, dayOfWeek: slot.dayOfWeek } }, create: { mentorId: user.id, ...slot }, update: { startTime: slot.startTime, endTime: slot.endTime, isActive: slot.isActive ?? true } }))); return this.availability(user); }
}
