import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { AccessToken } from 'livekit-server-sdk';
import { BookingsRepository } from './bookings.repository';
import type { AuthUser } from '../auth/dto/auth.dto';
import type { CreateBookingDto } from './dto/create-booking.dto';

export type ExtendedCreateBookingDto = CreateBookingDto & {
  title?: string;
  price?: number;
  goals?: string[];
};

@Injectable()
export class BookingsService {
  constructor(
    private readonly bookingsRepository: BookingsRepository,
    private readonly configService: ConfigService,
  ) {}

  async create(user: AuthUser, dto: ExtendedCreateBookingDto) {
    if (!dto.mentorId) {
      throw new BadRequestException('mentorId is required.');
    }

    // Resolve mentor user ID (whether ID is a MentorProfile ID or User ID)
    let mentorUser = await this.bookingsRepository.findUserWithMentorProfile(dto.mentorId);

    if (!mentorUser) {
      const profile = await this.bookingsRepository.findMentorProfileWithUser(dto.mentorId);
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

    const { booking, payment } = await this.bookingsRepository.createBookingWithPayment(
      {
        mentorId: mentorUser.id,
        menteeId: user.id,
        startsAt: startsAtDate,
        durationMinutes: duration,
        status: initialStatus,
        notes: notesText,
        meetingUrl: `/mentee/booking-session`,
      },
      !isFree
        ? {
            amount: price,
            currency: mentorUser.mentorProfile?.currency || 'NGN',
            status: PaymentStatus.PENDING,
            provider: 'PAYSTACK',
          }
        : undefined,
    );

    return {
      success: true,
      booking: {
        ...booking,
        payment,
      },
    };
  }

  async mine(user: AuthUser) {
    const rawBookings = await this.bookingsRepository.findUserBookings(user.id);

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

      const startsAtFormatted = startsAt.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const timeFormatted = startsAt.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const endsAt = new Date(startsAt.getTime() + b.durationMinutes * 60000);
      const endsAtFormatted = endsAt.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const diffTime = startsAt.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      let relativeDate = startsAtFormatted;
      if (diffDays === 0) relativeDate = 'Today';
      else if (diffDays === 1) relativeDate = 'Tomorrow';
      else if (diffDays === -1) relativeDate = 'Yesterday';
      else if (diffDays > 1 && diffDays < 7) relativeDate = `In ${diffDays} days`;

      const otherUser = isMentee ? b.mentor : b.mentee;
      const otherRole = isMentee ? (b.mentor.mentorProfile?.headline || 'Mentor') : 'Mentee';
      const otherAvatar = isMentee
        ? `https://i.pravatar.cc/150?u=${b.mentor.id}`
        : (b.mentee.menteeProfile?.avatarUrl || '');

      let title = 'Mentorship Session';
      let note = b.notes || '';
      const titleMatch = note.match(/^\[(.*?)\]\s*(.*)/);
      if (titleMatch) {
        title = titleMatch[1];
        note = titleMatch[2];
      }

      const amount = b.payment?.amount ?? b.mentor.mentorProfile?.pricePerSession ?? 0;
      const currency = b.payment?.currency ?? b.mentor.mentorProfile?.currency ?? 'NGN';
      const priceFormatted = amount === 0 ? 'Free' : `${currency} ${amount.toLocaleString()}`;

      const readyThresholdMinutes = 15;
      const minutesUntilStart = (startsAt.getTime() - now.getTime()) / 60000;
      const isReadyToJoin =
        b.status === BookingStatus.CONFIRMED &&
        minutesUntilStart <= readyThresholdMinutes &&
        now < endsAt;

      return {
        id: b.id,
        title,
        mentorName: `${otherUser.firstName} ${otherUser.lastName}`.trim(),
        mentorRole: otherRole,
        mentorAvatar: otherAvatar,
        linkedinUrl: isMentee ? b.mentor.mentorProfile?.linkedinUrl : undefined,
        timeFormatted: `${timeFormatted} - ${endsAtFormatted}`,
        relativeDate,
        fullDateTime: `${startsAtFormatted} · ${timeFormatted} - ${endsAtFormatted}`,
        duration: `${b.durationMinutes} mins`,
        durationMinutes: b.durationMinutes,
        price: priceFormatted,
        status: b.status,
        tab,
        note,
        meetingUrl: b.meetingUrl,
        isReadyToJoin,
        rating: b.review?.rating,
        review: b.review?.comment,
        hasMenteeReviewed: !!b.review,
        payment: b.payment,
        isMentee,
      };
    });
  }

  async getById(user: AuthUser, id: string) {
    const booking = await this.bookingsRepository.findBookingById(id);

    if (!booking) {
      throw new NotFoundException(`Booking with ID '${id}' not found.`);
    }

    if (booking.mentorId !== user.id && booking.menteeId !== user.id) {
      throw new ForbiddenException('You do not have permission to view this booking.');
    }

    return booking;
  }

  async getRoomToken(user: AuthUser, id: string) {
    const booking = await this.bookingsRepository.findBookingById(id);

    if (!booking) {
      throw new NotFoundException(`Booking with ID '${id}' not found.`);
    }

    if (booking.mentorId !== user.id && booking.menteeId !== user.id) {
      throw new ForbiddenException('You do not have permission to join this session.');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Cannot join a cancelled booking.');
    }

    if (booking.status === BookingStatus.PENDING_PAYMENT) {
      throw new BadRequestException('Booking is pending payment. Please complete payment first.');
    }

    const key = this.configService.getOrThrow<string>('LIVEKIT_API_KEY');
    const secret = this.configService.getOrThrow<string>('LIVEKIT_API_SECRET');
    const serverUrl = this.configService.getOrThrow<string>('LIVEKIT_URL');

    const participantName =
      `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() ||
      (user.id === booking.mentorId ? 'Mentor' : 'Mentee');
    const roomName = `median-session-${booking.id}`;

    const at = new AccessToken(key, secret, {
      identity: user.id,
      name: participantName,
      ttl: '3h',
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    return {
      token,
      roomName,
      serverUrl,
    };
  }

  async cancel(user: AuthUser, id: string, reason?: string) {
    const booking = await this.getById(user, id);

    const updated = await this.bookingsRepository.updateBooking(id, {
      status: BookingStatus.CANCELLED,
      notes: reason ? `${booking.notes || ''} [Cancelled: ${reason}]`.trim() : booking.notes,
    });

    return {
      success: true,
      booking: updated,
    };
  }

  async reschedule(user: AuthUser, id: string, newStartsAt: string) {
    await this.getById(user, id);

    const updated = await this.bookingsRepository.updateBooking(id, {
      startsAt: new Date(newStartsAt),
    });

    return {
      success: true,
      booking: updated,
    };
  }
}
