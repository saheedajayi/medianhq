import { Injectable } from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import type { AvailabilityDto } from './dto';

@Injectable()
export class SessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMentorSessions(mentorId: string) {
    return this.prisma.mentorSession.findMany({
      where: { mentorId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /** The session, only if it belongs to this mentor */
  findMentorSession(mentorId: string, sessionId: string) {
    return this.prisma.mentorSession.findFirst({
      where: { id: sessionId, mentorId },
    });
  }

  createSession(data: Prisma.MentorSessionUncheckedCreateInput) {
    return this.prisma.mentorSession.create({ data });
  }

  updateSession(sessionId: string, data: Prisma.MentorSessionUpdateInput) {
    return this.prisma.mentorSession.update({ where: { id: sessionId }, data });
  }

  deleteSession(sessionId: string) {
    return this.prisma.mentorSession.delete({ where: { id: sessionId } });
  }

  /** Unpaid checkouts never reached the mentor, so they aren't bookings yet */
  findSessionBookings(sessionId: string) {
    return this.prisma.booking.findMany({
      where: {
        mentorSessionId: sessionId,
        status: { not: BookingStatus.PENDING_PAYMENT },
      },
      select: { id: true, status: true },
    });
  }

  sumEarnings(mentorId: string, bookingIds: string[]) {
    return this.prisma.mentorEarning.aggregate({
      where: { mentorId, bookingId: { in: bookingIds } },
      _sum: { amount: true },
      _count: true,
    });
  }

  findAvailability(mentorId: string) {
    return this.prisma.weeklyAvailability.findMany({
      where: { mentorId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  saveAvailability(mentorId: string, slots: AvailabilityDto[]) {
    return this.prisma.$transaction(
      slots.map((slot) =>
        this.prisma.weeklyAvailability.upsert({
          where: {
            mentorId_dayOfWeek: { mentorId, dayOfWeek: slot.dayOfWeek },
          },
          create: { mentorId, ...slot },
          update: {
            startTime: slot.startTime,
            endTime: slot.endTime,
            isActive: slot.isActive ?? true,
          },
        }),
      ),
    );
  }
}
