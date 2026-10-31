import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  BookingStatus,
  MentorStatus,
  PaymentStatus,
  UserRole,
} from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { AccessToken } from 'livekit-server-sdk';
import type { AuthUser } from '../../identity/auth/dto/auth.dto';
import type { CreateBookingDto } from './dto/create-booking.dto';
import {
  BookingsRepository,
  type BookingWithDetails,
} from './bookings.repository';
import { PaymentsService } from '../../finance/payments/payments.service';
import { BookingNotificationsService } from '../booking-notifications/booking-notifications.service';
import { BookingEventsService } from '../booking-notifications/booking-events.service';
import { ExchangeRatesService } from '../../finance/exchange-rates/exchange-rates.service';
import { buildAvailableDays, type AvailableDay } from './availability-slots';
import {
  JOIN_WINDOW_MS,
  MIN_LEAD_TIME_MS,
  getCancellationRefund,
  getEarningsBreakdown,
  getEndsAt,
  getRespondBy,
  isLateCancellation,
} from './booking-policy';

export type ExtendedCreateBookingDto = CreateBookingDto & {
  /** The mentor's session being booked; when omitted, their standard 1:1 at profile price */
  mentorSessionId?: string;
  goals?: string[];
  /** Ignored: the price always comes from the mentor's session or profile */
  price?: number;
  title?: string;
};

export type MenteeFeedbackDto = {
  rating: number;
  comment?: string;
  actionItems?: { id?: string; text: string; completed?: boolean }[];
  followUpNotes?: string;
};

const DEFAULT_SESSION_TITLE = '1:1 Mentorship Session';
const DEFAULT_DURATION_MINUTES = 30;
const AVAILABILITY_DAYS = 14;
/** Booking times are shown in the mentors' time zone (see availability-slots.ts) */
const DISPLAY_TIME_ZONE = 'Africa/Lagos';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private readonly bookingsRepository: BookingsRepository,
    private readonly configService: ConfigService,
    private readonly paymentsService: PaymentsService,
    private readonly bookingNotifications: BookingNotificationsService,
    private readonly exchangeRates: ExchangeRatesService,
    private readonly bookingEvents: BookingEventsService,
  ) {}

  // ---------------------------------------------------------------------------
  // Availability
  // ---------------------------------------------------------------------------

  async getAvailableDays(params: {
    mentorId: string;
    durationMinutes?: number;
    excludeBookingId?: string;
    /** Skip the lookup when the caller already has the mentor's user ID */
    mentorUserId?: string;
  }): Promise<AvailableDay[]> {
    const mentor = params.mentorUserId
      ? { id: params.mentorUserId }
      : await this.resolveMentor(params.mentorId);
    const now = new Date();
    const to = new Date(
      now.getTime() + (AVAILABILITY_DAYS + 1) * 24 * 60 * 60 * 1000,
    );
    const [windows, busy] = await Promise.all([
      this.bookingsRepository.findWeeklyAvailability(mentor.id),
      this.bookingsRepository.findBusyRanges({
        mentorId: mentor.id,
        from: now,
        to,
        now,
        excludeBookingId: params.excludeBookingId,
      }),
    ]);

    return buildAvailableDays({
      windows,
      busy,
      durationMinutes: params.durationMinutes || DEFAULT_DURATION_MINUTES,
      from: now,
      days: AVAILABILITY_DAYS,
      earliestStart: new Date(now.getTime() + MIN_LEAD_TIME_MS),
    });
  }

  private async assertSlotAvailable(params: {
    mentorId: string;
    startsAt: Date;
    durationMinutes: number;
    excludeBookingId?: string;
  }) {
    if (Number.isNaN(params.startsAt.getTime())) {
      throw new BadRequestException('Please pick a valid session time.');
    }
    // Callers pass the mentor's user ID, so no second mentor lookup is needed
    const days = await this.getAvailableDays({
      ...params,
      mentorUserId: params.mentorId,
    });
    const wanted = params.startsAt.toISOString();
    const isOpen = days.some((day) => day.slots.includes(wanted));
    if (!isOpen) {
      throw new ConflictException(
        'That time is no longer available. Please pick another slot.',
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Creating and listing
  // ---------------------------------------------------------------------------

  async create(user: AuthUser, dto: ExtendedCreateBookingDto) {
    if (!dto.mentorId) {
      throw new BadRequestException('mentorId is required.');
    }

    const mentorUser = await this.resolveMentor(dto.mentorId);
    if (mentorUser.id === user.id) {
      throw new BadRequestException(
        'You cannot book a mentorship session with yourself.',
      );
    }
    if (mentorUser.mentorProfile?.status !== MentorStatus.APPROVED) {
      throw new BadRequestException('This mentor is not taking bookings yet.');
    }

    // Price, duration and title come from the server, never from the request
    let title = DEFAULT_SESSION_TITLE;
    let durationMinutes = DEFAULT_DURATION_MINUTES;
    let price = mentorUser.mentorProfile?.pricePerSession ?? 0;
    let currency = mentorUser.mentorProfile?.currency || 'NGN';
    let mentorSessionId: string | undefined;

    if (dto.mentorSessionId) {
      const session = await this.bookingsRepository.findMentorSession(
        dto.mentorSessionId,
        mentorUser.id,
      );
      if (!session || !session.isLive || session.type !== 'ONE_ON_ONE') {
        throw new BadRequestException('This session is not available to book.');
      }
      title = session.title;
      durationMinutes = session.durationMinutes;
      price = session.price;
      currency = session.currency;
      mentorSessionId = session.id;
    }

    // One booking of the same session at a time: book it again once this one has ended
    const active = await this.bookingsRepository.findActiveBookingOfSession({
      menteeId: user.id,
      mentorId: mentorUser.id,
      mentorSessionId: mentorSessionId ?? null,
      now: new Date(),
    });
    if (active) {
      const when = active.startsAt.toLocaleString('en-US', {
        timeZone: DISPLAY_TIME_ZONE,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
      throw new ConflictException(
        `You already have this session booked for ${when}. You can book it again after it ends.`,
      );
    }

    const startsAt = new Date(dto.startsAt);
    await this.assertSlotAvailable({
      mentorId: mentorUser.id,
      startsAt,
      durationMinutes,
    });

    const isFree = price <= 0;
    // Checkout is in NGN, so the charge is fixed now and every later step uses it
    const charge = isFree ? null : await this.exchangeRates.convertToNgn(price, currency);
    let notes = dto.notes?.trim() || '';
    if (dto.goals && dto.goals.length > 0) {
      notes = `${notes} (Goals: ${dto.goals.join(', ')})`.trim();
    }

    const { booking, payment } =
      await this.bookingsRepository.createBookingWithPayment(
        {
          mentorId: mentorUser.id,
          menteeId: user.id,
          startsAt,
          durationMinutes,
          title,
          mentorSessionId,
          // Free sessions skip checkout and go straight to the mentor
          status: isFree
            ? BookingStatus.PENDING_CONFIRMATION
            : BookingStatus.PENDING_PAYMENT,
          respondBy: isFree ? getRespondBy(new Date(), startsAt) : undefined,
          notes,
          meetingUrl: `/mentee/booking-session`,
        },
        !isFree
          ? {
              amount: charge!.amount,
              currency: 'NGN',
              ...(charge!.exchangeRate && {
                listedAmount: price,
                listedCurrency: currency,
                exchangeRate: charge!.exchangeRate,
              }),
              status: PaymentStatus.PENDING,
              provider: 'PAYSTACK',
            }
          : undefined,
      );

    if (isFree) {
      void this.bookingNotifications.notify(booking.id, 'REQUESTED');
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
    const rawBookings = await this.bookingsRepository.findUserBookings(user.id);
    const now = new Date();
    return rawBookings.map((b) => this.toBookingView(b, user, now));
  }

  async getById(user: AuthUser, id: string) {
    const booking = await this.bookingsRepository.findBookingById(id);

    if (!booking) {
      throw new NotFoundException(`Booking with ID '${id}' not found.`);
    }

    if (booking.mentorId !== user.id && booking.menteeId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to view this booking.',
      );
    }

    return booking;
  }

  /** Lighter lookup for actions, with the same permission check as getById */
  private async getForAction(user: AuthUser, id: string) {
    const booking = await this.bookingsRepository.findBookingForAction(id);
    if (!booking) {
      throw new NotFoundException(`Booking with ID '${id}' not found.`);
    }
    if (booking.mentorId !== user.id && booking.menteeId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to change this booking.',
      );
    }
    return booking;
  }

  // ---------------------------------------------------------------------------
  // Joining the video room
  // ---------------------------------------------------------------------------

  async getRoomToken(user: AuthUser, id: string) {
    const booking = await this.getForAction(user, id);
    const now = new Date();
    const endsAt = getEndsAt(booking.startsAt, booking.durationMinutes);

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Only confirmed sessions can be joined.');
    }
    if (now.getTime() < booking.startsAt.getTime() - JOIN_WINDOW_MS) {
      throw new BadRequestException(
        'You can join 15 minutes before the session starts.',
      );
    }
    if (now >= endsAt) {
      throw new BadRequestException('This session has already ended.');
    }

    // First join per side is what no-show detection looks at
    const isMentor = user.id === booking.mentorId;
    if (isMentor && !booking.mentorJoinedAt) {
      await this.bookingsRepository.updateBooking(id, { mentorJoinedAt: now });
    } else if (!isMentor && !booking.menteeJoinedAt) {
      await this.bookingsRepository.updateBooking(id, { menteeJoinedAt: now });
    }

    const key = this.configService.getOrThrow<string>('LIVEKIT_API_KEY');
    const secret = this.configService.getOrThrow<string>('LIVEKIT_API_SECRET');
    const serverUrl = this.configService.getOrThrow<string>('LIVEKIT_URL');

    const participantName =
      `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() ||
      (isMentor ? 'Mentor' : 'Mentee');
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

    return {
      token: await at.toJwt(),
      roomName,
      serverUrl,
    };
  }

  // ---------------------------------------------------------------------------
  // Mentor responses
  // ---------------------------------------------------------------------------

  async accept(user: AuthUser, id: string) {
    const booking = await this.getForAction(user, id);
    if (booking.mentorId !== user.id) {
      throw new ForbiddenException('Only the mentor can accept this booking.');
    }
    const now = new Date();
    if (booking.respondBy && booking.respondBy <= now) {
      throw new BadRequestException('This request has expired.');
    }

    const accepted = await this.bookingsRepository.transition(
      id,
      [BookingStatus.PENDING_CONFIRMATION],
      { status: BookingStatus.CONFIRMED, confirmedAt: now },
    );
    if (!accepted) {
      throw new ConflictException(
        'This booking is no longer waiting for a response.',
      );
    }

    // Emails go out in the background; notify never throws
    void this.bookingNotifications.notify(id, 'ACCEPTED');
    return { success: true };
  }

  async decline(user: AuthUser, id: string, reason?: string) {
    const booking = await this.getForAction(user, id);
    if (booking.mentorId !== user.id) {
      throw new ForbiddenException('Only the mentor can decline this booking.');
    }

    const declined = await this.bookingsRepository.transition(
      id,
      [BookingStatus.PENDING_CONFIRMATION],
      {
        status: BookingStatus.DECLINED,
        cancelledAt: new Date(),
        cancelledBy: UserRole.MENTOR,
        cancellationReason: reason?.trim() || null,
      },
    );
    if (!declined) {
      throw new ConflictException(
        'This booking is no longer waiting for a response.',
      );
    }

    const refundAmount = await this.paymentsService.refund(
      id,
      booking.payment?.amount ?? 0,
    );
    void this.bookingNotifications.notify(id, 'DECLINED', {
      reason,
      refundAmount,
    });
    return { success: true, refundAmount };
  }

  // ---------------------------------------------------------------------------
  // Cancelling and rescheduling
  // ---------------------------------------------------------------------------

  async cancel(user: AuthUser, id: string, reason?: string) {
    const booking = await this.getForAction(user, id);
    const now = new Date();

    if (booking.startsAt <= now) {
      throw new BadRequestException(
        'Sessions can no longer be cancelled once they have started.',
      );
    }

    const cancelledBy =
      booking.mentorId === user.id ? UserRole.MENTOR : UserRole.MENTEE;
    const wasConfirmed = booking.status === BookingStatus.CONFIRMED;
    const cancelled = await this.bookingsRepository.transition(
      id,
      [
        BookingStatus.PENDING_PAYMENT,
        BookingStatus.PENDING_CONFIRMATION,
        BookingStatus.CONFIRMED,
      ],
      {
        status: BookingStatus.CANCELLED,
        cancelledAt: now,
        cancelledBy,
        cancellationReason: reason?.trim() || null,
      },
    );
    if (!cancelled) {
      throw new ConflictException('This booking can no longer be cancelled.');
    }

    const paid =
      booking.payment?.status === PaymentStatus.SUCCESSFUL
        ? booking.payment.amount
        : 0;
    const refundDue = getCancellationRefund({
      amount: paid,
      cancelledBy,
      wasConfirmed,
      now,
      startsAt: booking.startsAt,
    });
    const refundAmount = await this.paymentsService.refund(id, refundDue);

    // On a late mentee cancellation the mentor keeps the part that wasn't refunded
    const retained = paid - refundDue;
    if (retained > 0 && booking.payment) {
      await this.recordEarning(booking, retained, booking.payment.currency);
    }

    void this.bookingNotifications.notify(id, 'CANCELLED', {
      reason,
      refundAmount,
    });
    return { success: true, refundAmount };
  }

  async reschedule(
    user: AuthUser,
    id: string,
    newStartsAt: string,
    reason?: string,
  ) {
    const booking = await this.getForAction(user, id);
    const now = new Date();

    if (
      booking.status !== BookingStatus.PENDING_CONFIRMATION &&
      booking.status !== BookingStatus.CONFIRMED
    ) {
      throw new BadRequestException(
        'Only upcoming sessions can be rescheduled.',
      );
    }
    if (booking.startsAt <= now) {
      throw new BadRequestException(
        'Sessions can no longer be moved once they have started.',
      );
    }

    const startsAt = new Date(newStartsAt);
    await this.assertSlotAvailable({
      mentorId: booking.mentorId,
      startsAt,
      durationMinutes: booking.durationMinutes,
      excludeBookingId: id,
    });

    const updated = await this.bookingsRepository.updateBooking(id, {
      startsAt,
      // A pending request still can't be accepted after the new start time
      ...(booking.status === BookingStatus.PENDING_CONFIRMATION &&
      booking.respondBy
        ? {
            respondBy: new Date(
              Math.min(booking.respondBy.getTime(), startsAt.getTime()),
            ),
          }
        : {}),
    });

    void this.bookingNotifications.notify(id, 'RESCHEDULED', { reason });
    return { success: true, booking: updated };
  }

  // ---------------------------------------------------------------------------
  // Mentor feedback on the mentee
  // ---------------------------------------------------------------------------

  async submitFeedback(user: AuthUser, id: string, dto: MenteeFeedbackDto) {
    const booking = await this.getForAction(user, id);
    if (booking.mentorId !== user.id) {
      throw new ForbiddenException('Only the mentor can review this session.');
    }
    const hasStarted = booking.startsAt <= new Date();
    const canReview =
      booking.status === BookingStatus.COMPLETED ||
      (booking.status === BookingStatus.CONFIRMED && hasStarted);
    if (!canReview) {
      throw new BadRequestException(
        'You can review a session once it has taken place.',
      );
    }

    const rating = Math.round(Number(dto.rating));
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5.');
    }

    const actionItems = (dto.actionItems ?? [])
      .filter((item) => item?.text?.trim())
      .slice(0, 20)
      .map((item, index) => ({
        id: item.id || `item-${index + 1}`,
        text: item.text.trim().slice(0, 300),
        completed: !!item.completed,
      }));

    const feedback = await this.bookingsRepository.upsertFeedback({
      bookingId: id,
      authorId: user.id,
      rating,
      comment: dto.comment?.trim().slice(0, 2000) || undefined,
      actionItems,
      followUpNotes: dto.followUpNotes?.trim().slice(0, 4000) || undefined,
    });

    const earning = await this.bookingsRepository.findEarningForBooking(id);
    return { success: true, feedback, earning };
  }

  // ---------------------------------------------------------------------------
  // Background sweep: expiries and session outcomes
  // ---------------------------------------------------------------------------

  /** Expires unanswered requests and settles finished sessions; safe to run repeatedly */
  async sweep(now = new Date()) {
    for (const booking of await this.bookingsRepository.findExpiredRequests(
      now,
    )) {
      const expired = await this.bookingsRepository.transition(
        booking.id,
        [BookingStatus.PENDING_CONFIRMATION],
        { status: BookingStatus.EXPIRED, cancelledAt: now },
      );
      if (!expired) continue;
      const refundAmount = await this.paymentsService.refund(
        booking.id,
        booking.payment?.amount ?? 0,
      );
      await this.bookingNotifications.notify(booking.id, 'EXPIRED', {
        refundAmount,
      });
    }

    for (const booking of await this.bookingsRepository.findEndedSessions(
      now,
    )) {
      const mentorJoined = !!booking.mentorJoinedAt;
      const menteeJoined = !!booking.menteeJoinedAt;
      const paid =
        booking.payment?.status === PaymentStatus.SUCCESSFUL
          ? booking.payment.amount
          : 0;
      const currency = booking.payment?.currency ?? 'NGN';

      if (mentorJoined && menteeJoined) {
        const completed = await this.bookingsRepository.transition(
          booking.id,
          [BookingStatus.CONFIRMED],
          { status: BookingStatus.COMPLETED },
        );
        if (!completed) continue;
        await this.bookingsRepository.recordCompletedSession(
          booking.id,
          getEndsAt(booking.startsAt, booking.durationMinutes),
          booking.durationMinutes,
        );
        if (paid > 0) await this.recordEarning(booking, paid, currency);
        // No email for these outcomes, so notify() won't reach open dashboards
        this.bookingEvents.publish(booking.mentorId, booking.menteeId);
        continue;
      }

      // Missing mentor (or nobody): full refund, no payout. Missing mentee: the mentor is paid.
      const noShowParty =
        !mentorJoined && !menteeJoined
          ? 'BOTH'
          : mentorJoined
            ? 'MENTEE'
            : 'MENTOR';
      const marked = await this.bookingsRepository.transition(
        booking.id,
        [BookingStatus.CONFIRMED],
        { status: BookingStatus.NO_SHOW, noShowParty },
      );
      if (!marked) continue;
      if (noShowParty === 'MENTEE') {
        if (paid > 0) await this.recordEarning(booking, paid, currency);
      } else {
        await this.paymentsService.refund(booking.id, paid);
      }
      this.bookingEvents.publish(booking.mentorId, booking.menteeId);
    }
  }

  private recordEarning(
    booking: { id: string; mentorId: string },
    gross: number,
    currency: string,
  ) {
    const { grossAmount, platformFee, netAmount } = getEarningsBreakdown(gross);
    return this.bookingsRepository.createEarning({
      mentorId: booking.mentorId,
      bookingId: booking.id,
      amount: netAmount,
      grossAmount,
      platformFee,
      currency,
    });
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /** Accepts either the mentor's user ID or their MentorProfile ID */
  private async resolveMentor(id: string) {
    let mentorUser =
      await this.bookingsRepository.findUserWithMentorProfile(id);

    if (!mentorUser?.mentorProfile) {
      const profile =
        await this.bookingsRepository.findMentorProfileWithUser(id);
      if (profile?.user) {
        mentorUser = { ...profile.user, mentorProfile: profile };
      }
    }

    if (!mentorUser?.mentorProfile) {
      throw new NotFoundException(`Mentor with ID '${id}' not found.`);
    }
    return mentorUser;
  }

  private formatMoney(amount: number, currency: string) {
    const symbol = currency === 'NGN' ? '₦' : `${currency} `;
    return `${symbol}${amount.toLocaleString('en-NG')}`;
  }

  /** Shapes a booking for whichever side is looking at it */
  private toBookingView(b: BookingWithDetails, user: AuthUser, now: Date) {
    const isMentee = b.menteeId === user.id;
    const startsAt = b.startsAt;
    const endsAt = getEndsAt(startsAt, b.durationMinutes);

    const dateFormat = (date: Date, options: Intl.DateTimeFormatOptions) =>
      date.toLocaleString('en-US', { timeZone: DISPLAY_TIME_ZONE, ...options });
    const startsAtFormatted = dateFormat(startsAt, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeFormatted = dateFormat(startsAt, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const endsAtFormatted = dateFormat(endsAt, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const localDay = (date: Date) =>
      new Date(
        date.toLocaleDateString('en-CA', { timeZone: DISPLAY_TIME_ZONE }),
      ).getTime();
    const diffDays = Math.round(
      (localDay(startsAt) - localDay(now)) / (24 * 60 * 60 * 1000),
    );
    let relativeDate = startsAtFormatted;
    if (diffDays === 0) relativeDate = 'Today';
    else if (diffDays === 1) relativeDate = 'Tomorrow';
    else if (diffDays === -1) relativeDate = 'Yesterday';
    else if (diffDays > 1 && diffDays < 7) relativeDate = `In ${diffDays} days`;

    const otherUser = isMentee ? b.mentor : b.mentee;
    const otherName = `${otherUser.firstName} ${otherUser.lastName}`.trim();
    const otherRole = isMentee
      ? b.mentor.mentorProfile?.headline || 'Mentor'
      : b.mentee.menteeProfile?.currentRole || 'Mentee';
    const otherAvatar = isMentee
      ? b.mentor.mentorProfile?.avatarUrl || ''
      : b.mentee.menteeProfile?.avatarUrl || '';
    const mentorName = `${b.mentor.firstName} ${b.mentor.lastName}`.trim();
    const menteeName = `${b.mentee.firstName} ${b.mentee.lastName}`.trim();

    // Older bookings stored the title as a "[Title] note" prefix
    let title = b.title || 'Mentorship Session';
    let note = b.notes || '';
    const titleMatch = note.match(/^\[(.*?)\]\s*(.*)/);
    if (titleMatch) {
      if (!b.title) title = titleMatch[1];
      note = titleMatch[2];
    }

    const currency =
      b.payment?.currency ?? b.mentor.mentorProfile?.currency ?? 'NGN';
    const amount = b.payment?.amount ?? 0;
    const price = amount === 0 ? 'Free' : this.formatMoney(amount, currency);

    const tab = (() => {
      switch (b.status) {
        case BookingStatus.PENDING_CONFIRMATION:
          return 'pending';
        case BookingStatus.CONFIRMED:
          return endsAt > now ? 'upcoming' : 'past';
        case BookingStatus.COMPLETED:
          return 'past';
        default:
          return 'cancelled';
      }
    })();

    const status =
      b.status === BookingStatus.PENDING_CONFIRMATION
        ? 'awaiting_confirmation'
        : b.status.toLowerCase();
    const statusLabel = {
      PENDING_PAYMENT: 'Awaiting payment',
      PENDING_CONFIRMATION: 'Awaiting mentor',
      CONFIRMED: 'Confirmed',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
      DECLINED: 'Declined',
      EXPIRED: 'Expired',
      NO_SHOW: 'No-show',
    }[b.status];

    const describeParty = (role: UserRole | null) => {
      if (!role) return undefined;
      const viewerRole = isMentee ? UserRole.MENTEE : UserRole.MENTOR;
      if (role === viewerRole) return 'You';
      return role === UserRole.MENTOR
        ? `Mentor - ${mentorName}`
        : `Mentee - ${menteeName}`;
    };

    let cancellationNotice: string | undefined;
    if (b.status === BookingStatus.DECLINED)
      cancellationNotice = 'Declined by the mentor';
    else if (b.status === BookingStatus.EXPIRED)
      cancellationNotice = "The mentor didn't respond in time";
    else if (b.status === BookingStatus.CANCELLED && b.cancelledAt) {
      cancellationNotice = isLateCancellation(b.cancelledAt, startsAt)
        ? 'Less than 24 hours before session'
        : 'More than 24 hours before session';
    }

    const absentee =
      b.noShowParty === 'BOTH'
        ? 'Both mentor and mentee'
        : b.noShowParty === 'MENTOR'
          ? `Mentor - ${mentorName}`
          : b.noShowParty === 'MENTEE'
            ? `Mentee - ${menteeName}`
            : undefined;

    let refundAmount: string | undefined;
    if (b.payment?.refundAmount) {
      const suffix =
        b.payment.refundStatus === 'PROCESSED'
          ? ' refunded'
          : b.payment.refundStatus === 'FAILED'
            ? ' (delayed, our team is on it)'
            : ' (processing)';
      refundAmount = `${this.formatMoney(b.payment.refundAmount, currency)}${suffix}`;
    } else if (tab === 'cancelled') {
      refundAmount = amount === 0 ? 'No payment was taken' : 'No refund due';
    }

    // What the mentor earns from this booking, before or after it happens
    const paid =
      b.payment?.status === PaymentStatus.SUCCESSFUL ||
      b.payment?.status === PaymentStatus.REFUNDED
        ? amount
        : 0;
    const keptAmount = paid - (b.payment?.refundAmount ?? 0);
    const earningBasis =
      b.status === BookingStatus.CANCELLED || b.status === BookingStatus.NO_SHOW
        ? keptAmount
        : b.status === BookingStatus.DECLINED ||
            b.status === BookingStatus.EXPIRED
          ? 0
          : amount;
    const earnings = getEarningsBreakdown(earningBasis);

    const feedback = b.feedback
      ? {
          rating: b.feedback.rating,
          comment: b.feedback.comment ?? undefined,
          actionItems: (b.feedback.actionItems ?? []) as {
            id: string;
            text: string;
            completed: boolean;
          }[],
          followUpNotes: b.feedback.followUpNotes ?? undefined,
        }
      : null;

    return {
      id: b.id,
      title,
      // The other person in the booking: the mentor for a mentee, the mentee for a mentor
      participantId: otherUser.id,
      participantName: otherName,
      participantRole: otherRole,
      participantAvatar: otherAvatar,
      /** @deprecated Use participantName/participantRole/participantAvatar; kept until the web app no longer reads them */
      mentorName: otherName,
      mentorRole: otherRole,
      mentorAvatar: otherAvatar,
      mentorId: b.mentorId,
      // Which of the mentor's sessions this is; null for their standard 1:1
      mentorSessionId: b.mentorSessionId,
      goals: b.mentee.menteeProfile?.goals ?? [],
      linkedinUrl: isMentee ? b.mentor.mentorProfile?.linkedinUrl : undefined,
      startsAt: startsAt.toISOString(),
      timeFormatted: `${timeFormatted} - ${endsAtFormatted}`,
      relativeDate,
      fullDateTime: `${startsAtFormatted} · ${timeFormatted} - ${endsAtFormatted}`,
      duration: `${b.durationMinutes} mins`,
      durationMinutes: b.durationMinutes,
      price,
      status,
      statusLabel,
      tab,
      note,
      meetingUrl: b.meetingUrl,
      respondBy: b.respondBy?.toISOString(),
      requestedAt: b.createdAt.toISOString(),
      isReadyToJoin:
        b.status === BookingStatus.CONFIRMED &&
        now.getTime() >= startsAt.getTime() - JOIN_WINDOW_MS &&
        now < endsAt,
      rating: b.review?.rating,
      review: b.review?.comment,
      hasMenteeReviewed: !!b.review,
      feedback,
      hasMentorReviewed: !!feedback,
      actionItems: feedback?.actionItems ?? [],
      sessionNotes: feedback?.followUpNotes,
      cancelledBy: describeParty(b.cancelledBy),
      cancellationNotice,
      cancellationReason: b.cancellationReason ?? undefined,
      refundAmount,
      absentee,
      isNoShow: b.status === BookingStatus.NO_SHOW,
      ...(isMentee
        ? {}
        : {
            payout: this.formatMoney(earnings.netAmount, currency),
            earnings: {
              gross: this.formatMoney(earnings.grossAmount, currency),
              platformFee: this.formatMoney(earnings.platformFee, currency),
              net: this.formatMoney(earnings.netAmount, currency),
            },
          }),
      isMentee,
    };
  }
}
