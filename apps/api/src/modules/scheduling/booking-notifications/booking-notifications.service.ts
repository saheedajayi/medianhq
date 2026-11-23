import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { EmailService } from '../../platform/email/email.service';
import { BookingEventsService } from './booking-events.service';
import { MENTOR_UTC_OFFSET_MINUTES } from '../bookings/availability-slots';

export type BookingEvent =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'RESCHEDULED'
  | 'REMINDER_1H'
  | 'REMINDER_15M'
  | 'ACTION_ITEMS';

type Person = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

// Which notification preference controls each email; new requests have no toggle
// because mentors must always hear about them before the 24-hour deadline
const EVENT_PREFERENCE: Partial<Record<BookingEvent, string>> = {
  ACCEPTED: 'bookingUpdates',
  DECLINED: 'bookingUpdates',
  EXPIRED: 'bookingUpdates',
  RESCHEDULED: 'bookingUpdates',
  CANCELLED: 'cancellations',
  REMINDER_1H: 'sessionReminders',
  REMINDER_15M: 'sessionReminders',
  ACTION_ITEMS: 'actionItems',
};

/**
 * Emails the other person when a booking changes. Failures are logged, never
 * thrown: a missed email must not undo the booking change that caused it.
 */
@Injectable()
export class BookingNotificationsService {
  private readonly logger = new Logger(BookingNotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly bookingEvents: BookingEventsService,
  ) {}

  async notify(
    bookingId: string,
    event: BookingEvent,
    extra: {
      reason?: string | null;
      refundAmount?: number | null;
      actionItemCount?: number;
    } = {},
  ) {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          mentor: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
          mentee: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
          payment: { select: { currency: true } },
        },
      });
      if (!booking) return;

      // Before the emails, so a slow or failed send can't hold up open dashboards
      this.bookingEvents.publish(booking.mentor.id, booking.mentee.id);

      const title = booking.title || 'Mentorship session';
      const when = this.formatWhen(booking.startsAt, booking.durationMinutes);
      const details = [
        { label: 'Session', value: title },
        { label: 'When', value: when },
      ];
      const currency = booking.payment?.currency ?? 'NGN';
      const refundLine =
        extra.refundAmount && extra.refundAmount > 0
          ? `A refund of ${currency} ${extra.refundAmount.toLocaleString()} is on its way and usually arrives within 3-5 business days.`
          : null;
      const reasonLine = extra.reason ? `Reason given: ${extra.reason}` : null;
      const fullName = (person: Person) =>
        `${person.firstName} ${person.lastName}`.trim();

      const isReminder = event === 'REMINDER_1H' || event === 'REMINDER_15M';

      const send = async (
        to: Person,
        subject: string,
        paragraphs: (string | null)[],
        ctaLabel: string,
        ctaPath: string,
      ) => {
        if (!(await this.wantsEmail(to.id, event))) return;
        await this.emailService.sendBookingUpdate({
          email: to.email,
          firstName: to.firstName,
          subject,
          paragraphs: paragraphs.filter((p): p is string => !!p),
          details,
          ctaLabel,
          ctaPath,
          // Reminders are keyed on the start time: joining the call updates the booking,
          // and a rescheduled session should be reminded again
          idempotencyKey: `booking:${booking.id}:${event}:${
            isReminder
              ? booking.startsAt.getTime()
              : booking.updatedAt.getTime()
          }:${to.email}`,
        });
      };

      switch (event) {
        case 'REQUESTED':
          await send(
            booking.mentor,
            `New session request from ${fullName(booking.mentee)}`,
            [
              `${fullName(booking.mentee)} would like to book a session with you.`,
              "Please accept or decline within 24 hours. If you don't respond, the request expires and the mentee is refunded.",
            ],
            'Review request',
            '/mentor/bookings?tab=pending',
          );
          return;
        case 'ACCEPTED':
          await send(
            booking.mentee,
            `${fullName(booking.mentor)} accepted your session`,
            [
              `Good news: ${fullName(booking.mentor)} has confirmed your session.`,
            ],
            'View booking',
            '/mentee/booking-session?tab=upcoming',
          );
          return;
        case 'DECLINED':
          await send(
            booking.mentee,
            `${fullName(booking.mentor)} couldn't take your session`,
            [
              `${fullName(booking.mentor)} declined your session request.`,
              reasonLine,
              refundLine,
            ],
            'Find another mentor',
            '/explore',
          );
          return;
        case 'EXPIRED':
          await send(
            booking.mentee,
            'Your session request expired',
            [
              `${fullName(booking.mentor)} didn't respond to your request in time, so it has expired.`,
              refundLine,
            ],
            'Find another mentor',
            '/explore',
          );
          return;
        case 'CANCELLED': {
          const cancelledByMentor = booking.cancelledBy === 'MENTOR';
          const recipient = cancelledByMentor ? booking.mentee : booking.mentor;
          const canceller = cancelledByMentor ? booking.mentor : booking.mentee;
          await send(
            recipient,
            `${fullName(canceller)} cancelled your session`,
            [
              `${fullName(canceller)} cancelled the session below.`,
              reasonLine,
              cancelledByMentor ? refundLine : null,
            ],
            'View bookings',
            cancelledByMentor
              ? '/mentee/booking-session?tab=cancelled'
              : '/mentor/bookings?tab=cancelled',
          );
          return;
        }
        case 'RESCHEDULED':
          await Promise.all([
            send(
              booking.mentor,
              'Your session was rescheduled',
              ['The session below has a new time.', reasonLine],
              'View booking',
              '/mentor/bookings',
            ),
            send(
              booking.mentee,
              'Your session was rescheduled',
              ['The session below has a new time.', reasonLine],
              'View booking',
              '/mentee/booking-session',
            ),
          ]);
          return;
        case 'REMINDER_1H':
        case 'REMINDER_15M': {
          if (booking.status !== 'CONFIRMED') return;
          const soon = event === 'REMINDER_15M';
          const remind = (to: Person, other: Person, ctaPath: string) =>
            send(
              to,
              soon
                ? `Your session with ${fullName(other)} starts in 15 minutes`
                : `Your session with ${fullName(other)} starts in 1 hour`,
              [
                soon
                  ? `Your session with ${fullName(other)} starts in 15 minutes. The room is open now, so you can join and check your camera and microphone.`
                  : `Your session with ${fullName(other)} starts in 1 hour. You can join from your bookings 15 minutes before it starts.`,
              ],
              soon ? 'Join session' : 'View booking',
              ctaPath,
            );
          // Someone already in the room doesn't need telling it's about to start
          await Promise.all([
            booking.mentorJoinedAt
              ? null
              : remind(
                  booking.mentor,
                  booking.mentee,
                  '/mentor/bookings?tab=upcoming',
                ),
            booking.menteeJoinedAt
              ? null
              : remind(
                  booking.mentee,
                  booking.mentor,
                  '/mentee/booking-session?tab=upcoming',
                ),
          ]);
          return;
        }
        case 'ACTION_ITEMS': {
          const count = extra.actionItemCount ?? 0;
          if (count < 1) return;
          const items = count === 1 ? '1 action item' : `${count} action items`;
          await send(
            booking.mentee,
            `${fullName(booking.mentor)} left you ${items}`,
            [
              `${fullName(booking.mentor)} left you ${items} after the session below. You can find them on your dashboard.`,
            ],
            'View action items',
            '/dashboard',
          );
          return;
        }
      }
    } catch (err) {
      this.logger.error(
        `Failed to send ${event} email for booking ${bookingId}`,
        err,
      );
    }
  }

  private async wantsEmail(userId: string, event: BookingEvent) {
    const preference = EVENT_PREFERENCE[event];
    if (!preference) return true;

    const settings = await this.prisma.userSettings.findUnique({
      where: { userId },
      select: { notificationPreferences: true },
    });
    const preferences = (settings?.notificationPreferences ?? {}) as Record<
      string,
      { email?: boolean } | undefined
    >;
    return preferences[preference]?.email !== false;
  }

  /** "Tue, 27 Oct 2026, 3:00 PM - 3:30 PM WAT" in the mentor's time zone */
  private formatWhen(startsAt: Date, durationMinutes: number) {
    const shift = (date: Date) =>
      new Date(date.getTime() + MENTOR_UTC_OFFSET_MINUTES * 60 * 1000);
    const start = shift(startsAt);
    const end = shift(
      new Date(startsAt.getTime() + durationMinutes * 60 * 1000),
    );
    const date = start.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
    const time = (d: Date) =>
      d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'UTC',
      });
    return `${date}, ${time(start)} - ${time(end)} WAT`;
  }
}
