import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import type { AuthUser } from '../auth/dto/auth.dto';
import type { CreateBookingDto } from './dto/create-booking.dto';

export type ExtendedCreateBookingDto = CreateBookingDto & {
  title?: string;
  price?: number;
  goals?: string[];
};

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthUser, dto: ExtendedCreateBookingDto) {
    if (!dto.mentorId) {
      throw new BadRequestException('mentorId is required.');
    }

    // Resolve mentor user ID (whether ID is a MentorProfile ID or User ID)
    let mentorUser = await this.prisma.user.findUnique({
      where: { id: dto.mentorId },
      include: { mentorProfile: true },
    });

    if (!mentorUser) {
      const profile = await this.prisma.mentorProfile.findUnique({
        where: { id: dto.mentorId },
        include: { user: true },
      });
      if (profile?.user) {
        mentorUser = { ...profile.user, mentorProfile: profile };
      }
    }

    if (!mentorUser) {
      throw new NotFoundException(`Mentor with ID '${dto.mentorId}' not found.`);
    }

    if (mentorUser.id === user.id) {
      throw new BadRequestException('You cannot book a mentorship session with yourself.');
    }

    const price = typeof dto.price === 'number' ? dto.price : (mentorUser.mentorProfile?.pricePerSession ?? 0);
    const isFree = price === 0;
    const initialStatus = isFree ? BookingStatus.CONFIRMED : BookingStatus.PENDING_PAYMENT;

    const startsAtDate = dto.startsAt ? new Date(dto.startsAt) : new Date(Date.now() + 86400000);
    const duration = dto.durationMinutes || 30;

    let notesText = dto.notes || '';
    if (dto.title) {
      notesText = `[${dto.title}] ${notesText}`.trim();
    }
    if (dto.goals && dto.goals.length > 0) {
      notesText += ` (Goals: ${dto.goals.join(', ')})`;
    }

    const booking = await this.prisma.booking.create({
      data: {
        mentorId: mentorUser.id,
        menteeId: user.id,
        startsAt: startsAtDate,
        durationMinutes: duration,
        status: initialStatus,
        notes: notesText,
        meetingUrl: `/mentee/booking-session`,
      },
      include: {
        mentor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            mentorProfile: true,
          },
        },
        mentee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            menteeProfile: true,
          },
        },
      },
    });

    // Create payment record if paid
    let payment = null;
    if (!isFree) {
      payment = await this.prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: price,
          currency: mentorUser.mentorProfile?.currency || 'NGN',
          status: PaymentStatus.PENDING,
          provider: 'PAYSTACK',
        },
      });
    }

    return {
      success: true,
      booking: {
        ...booking,
        payment,
      },
    };
  }

  async mine(user: AuthUser) {
    const rawBookings = await this.prisma.booking.findMany({
      where: {
        OR: [{ menteeId: user.id }, { mentorId: user.id }],
      },
      include: {
        mentor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            mentorProfile: true,
          },
        },
        mentee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            menteeProfile: true,
          },
        },
        payment: true,
        review: true,
        session: true,
      },
      orderBy: {
        startsAt: 'desc',
      },
    });

    const now = new Date();

    return rawBookings.map((b) => {
      const isMentee = b.menteeId === user.id;
      const startsAt = new Date(b.startsAt);
      const isPast = startsAt < now || b.status === BookingStatus.COMPLETED;
      const isCancelled = b.status === BookingStatus.CANCELLED;
      const isPending = b.status === BookingStatus.PENDING_PAYMENT;

      let tab = 'upcoming';
      if (isCancelled) {
        tab = 'cancelled';
      } else if (isPending) {
        tab = 'pending';
      } else if (isPast) {
        tab = 'past';
      }

      const mentorName = `${b.mentor.firstName} ${b.mentor.lastName}`.trim() || 'Mentor';
      const mentorRole = `${b.mentor.mentorProfile?.jobTitle || 'Mentor'} @ ${b.mentor.mentorProfile?.company || 'Median'}`;
      const priceFormatted = b.payment?.amount ? `₦${b.payment.amount.toLocaleString()}` : 'Free';

      return {
        id: b.id,
        title: b.notes?.startsWith('[') ? b.notes.slice(1, b.notes.indexOf(']')) : '1:1 Mentorship Session',
        mentorName,
        mentorRole,
        mentorAvatar: `https://i.pravatar.cc/150?u=${b.mentor.id}`,
        linkedinUrl: b.mentor.mentorProfile?.linkedinUrl,
        timeFormatted: startsAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        relativeDate: startsAt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        fullDateTime: `${startsAt.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })} · ${startsAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`,
        duration: `${b.durationMinutes}mins`,
        durationMinutes: b.durationMinutes,
        price: priceFormatted,
        status: b.status.toLowerCase(),
        tab,
        note: b.notes,
        meetingUrl: b.meetingUrl,
        isReadyToJoin: !isCancelled && !isPast && !isPending,
        rating: b.review?.rating,
        review: b.review?.comment,
        hasMenteeReviewed: !!b.review,
        payment: b.payment,
        isMentee,
      };
    });
  }

  async getById(user: AuthUser, id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        mentor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            mentorProfile: true,
          },
        },
        mentee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            menteeProfile: true,
          },
        },
        payment: true,
        review: true,
        session: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID '${id}' not found.`);
    }

    if (booking.mentorId !== user.id && booking.menteeId !== user.id) {
      throw new ForbiddenException('You do not have permission to view this booking.');
    }

    return booking;
  }

  async cancel(user: AuthUser, id: string, reason?: string) {
    const booking = await this.getById(user, id);

    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        notes: reason ? `${booking.notes || ''} [Cancelled: ${reason}]`.trim() : booking.notes,
      },
    });

    return {
      success: true,
      booking: updated,
    };
  }

  async reschedule(user: AuthUser, id: string, newStartsAt: string) {
    await this.getById(user, id);

    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        startsAt: new Date(newStartsAt),
      },
    });

    return {
      success: true,
      booking: updated,
    };
  }
}
