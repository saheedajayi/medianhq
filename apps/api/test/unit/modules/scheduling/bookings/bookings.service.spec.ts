import { BookingStatus, PaymentStatus, UserRole } from '@prisma/client';
import { BookingsService } from '../../../../../src/modules/scheduling/bookings/bookings.service';

const HOUR = 60 * 60 * 1000;

describe('BookingsService money flows', () => {
  let repository: Record<string, jest.Mock>;
  let payments: { refund: jest.Mock };
  let notifications: { notify: jest.Mock };
  let service: BookingsService;

  const paidPayment = {
    amount: 20000,
    currency: 'NGN',
    status: PaymentStatus.SUCCESSFUL,
  };

  beforeEach(() => {
    repository = {
      findExpiredRequests: jest.fn().mockResolvedValue([]),
      findEndedSessions: jest.fn().mockResolvedValue([]),
      transition: jest.fn().mockResolvedValue(true),
      createEarning: jest.fn(),
      recordCompletedSession: jest.fn(),
      findBookingById: jest.fn(),
      findBookingForAction: jest.fn(),
      findUserWithMentorProfile: jest.fn(),
      findMentorSession: jest.fn(),
      findActiveBookingOfSession: jest.fn(),
      createBookingWithPayment: jest.fn(),
    };
    payments = {
      refund: jest
        .fn()
        .mockImplementation((_id, amount) => Promise.resolve(amount)),
    };
    notifications = { notify: jest.fn() };
    service = new BookingsService(
      repository as never,
      {} as never,
      payments as never,
      notifications as never,
      { convertToNgn: jest.fn().mockImplementation((amount) => Promise.resolve({ amount, exchangeRate: null })) } as never,
      { publish: jest.fn() } as never,
    );
  });

  describe('sweep', () => {
    const now = new Date('2026-10-26T12:00:00Z');
    const ended = {
      id: 'b1',
      mentorId: 'mentor',
      startsAt: new Date(now.getTime() - 2 * HOUR),
      durationMinutes: 30,
      payment: paidPayment,
    };

    it('expires unanswered requests with a full refund', async () => {
      repository.findExpiredRequests.mockResolvedValue([
        { id: 'b1', payment: paidPayment },
      ]);
      await service.sweep(now);
      expect(repository.transition).toHaveBeenCalledWith(
        'b1',
        [BookingStatus.PENDING_CONFIRMATION],
        expect.objectContaining({ status: BookingStatus.EXPIRED }),
      );
      expect(payments.refund).toHaveBeenCalledWith('b1', 20000);
      expect(notifications.notify).toHaveBeenCalledWith('b1', 'EXPIRED', {
        refundAmount: 20000,
      });
    });

    it('completes sessions both sides joined and pays the mentor after fees', async () => {
      repository.findEndedSessions.mockResolvedValue([
        { ...ended, mentorJoinedAt: now, menteeJoinedAt: now },
      ]);
      await service.sweep(now);
      expect(repository.transition).toHaveBeenCalledWith(
        'b1',
        [BookingStatus.CONFIRMED],
        { status: BookingStatus.COMPLETED },
      );
      expect(repository.createEarning).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 19100,
          grossAmount: 20000,
          platformFee: 900,
        }),
      );
      expect(payments.refund).not.toHaveBeenCalled();
    });

    it('refunds the mentee in full when the mentor never joined', async () => {
      repository.findEndedSessions.mockResolvedValue([
        { ...ended, menteeJoinedAt: now },
      ]);
      await service.sweep(now);
      expect(repository.transition).toHaveBeenCalledWith(
        'b1',
        [BookingStatus.CONFIRMED],
        { status: BookingStatus.NO_SHOW, noShowParty: 'MENTOR' },
      );
      expect(payments.refund).toHaveBeenCalledWith('b1', 20000);
      expect(repository.createEarning).not.toHaveBeenCalled();
    });

    it('pays the mentor when the mentee never joined', async () => {
      repository.findEndedSessions.mockResolvedValue([
        { ...ended, mentorJoinedAt: now },
      ]);
      await service.sweep(now);
      expect(repository.transition).toHaveBeenCalledWith(
        'b1',
        [BookingStatus.CONFIRMED],
        { status: BookingStatus.NO_SHOW, noShowParty: 'MENTEE' },
      );
      expect(repository.createEarning).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 19100 }),
      );
      expect(payments.refund).not.toHaveBeenCalled();
    });

    it('does nothing when another run already settled the booking', async () => {
      repository.transition.mockResolvedValue(false);
      repository.findEndedSessions.mockResolvedValue([
        { ...ended, mentorJoinedAt: now, menteeJoinedAt: now },
      ]);
      await service.sweep(now);
      expect(repository.createEarning).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    const user = { id: 'mentee' } as never;

    beforeEach(() => {
      repository.findUserWithMentorProfile.mockResolvedValue({
        id: 'mentor',
        mentorProfile: { status: 'APPROVED', pricePerSession: 0, currency: 'NGN' },
      });
      repository.findMentorSession.mockResolvedValue({
        id: 's1',
        isLive: true,
        type: 'ONE_ON_ONE',
        title: 'CV Review',
        durationMinutes: 30,
        price: 0,
        currency: 'NGN',
      });
    });

    it("won't book a session the mentee already has coming up", async () => {
      repository.findActiveBookingOfSession.mockResolvedValue({
        id: 'b0',
        startsAt: new Date(Date.now() + 48 * HOUR),
        durationMinutes: 30,
      });
      await expect(
        service.create(user, {
          mentorId: 'mentor',
          mentorSessionId: 's1',
          startsAt: new Date(Date.now() + 72 * HOUR).toISOString(),
        } as never),
      ).rejects.toThrow('You already have this session booked');
      expect(repository.findActiveBookingOfSession).toHaveBeenCalledWith(
        expect.objectContaining({ menteeId: 'mentee', mentorId: 'mentor', mentorSessionId: 's1' }),
      );
      expect(repository.createBookingWithPayment).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    const user = { id: 'mentee', role: UserRole.MENTEE } as never;

    it('refunds half on a late mentee cancellation and pays the mentor the rest', async () => {
      repository.findBookingForAction.mockResolvedValue({
        id: 'b1',
        mentorId: 'mentor',
        menteeId: 'mentee',
        status: BookingStatus.CONFIRMED,
        startsAt: new Date(Date.now() + 2 * HOUR),
        payment: paidPayment,
      });
      await service.cancel(user, 'b1', 'Emergency');
      expect(payments.refund).toHaveBeenCalledWith('b1', 10000);
      expect(repository.createEarning).toHaveBeenCalledWith(
        expect.objectContaining({ grossAmount: 10000, amount: 9500 }),
      );
      expect(notifications.notify).toHaveBeenCalledWith('b1', 'CANCELLED', {
        reason: 'Emergency',
        refundAmount: 10000,
      });
    });

    it('refuses to cancel a session that already started', async () => {
      repository.findBookingForAction.mockResolvedValue({
        id: 'b1',
        mentorId: 'mentor',
        menteeId: 'mentee',
        status: BookingStatus.CONFIRMED,
        startsAt: new Date(Date.now() - HOUR),
        payment: paidPayment,
      });
      await expect(service.cancel(user, 'b1')).rejects.toThrow('started');
      expect(payments.refund).not.toHaveBeenCalled();
    });
  });
});
