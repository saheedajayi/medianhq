import { UserRole } from '@prisma/client';
import {
  getCancellationRefund,
  getEarningsBreakdown,
  getRespondBy,
} from '../../../../src/modules/bookings/booking-policy';

const HOUR = 60 * 60 * 1000;

describe('booking policy', () => {
  const now = new Date('2026-10-26T10:00:00Z');

  describe('getRespondBy', () => {
    it('gives the mentor 24 hours', () => {
      const startsAt = new Date(now.getTime() + 72 * HOUR);
      expect(getRespondBy(now, startsAt)).toEqual(
        new Date(now.getTime() + 24 * HOUR),
      );
    });

    it('never runs past the session start', () => {
      const startsAt = new Date(now.getTime() + 3 * HOUR);
      expect(getRespondBy(now, startsAt)).toEqual(startsAt);
    });
  });

  describe('getCancellationRefund', () => {
    const early = new Date(now.getTime() + 48 * HOUR);
    const late = new Date(now.getTime() + 2 * HOUR);

    it('refunds mentees in full with more than 24 hours notice', () => {
      expect(
        getCancellationRefund({
          amount: 20000,
          cancelledBy: UserRole.MENTEE,
          wasConfirmed: true,
          now,
          startsAt: early,
        }),
      ).toBe(20000);
    });

    it('refunds mentees half with less than 24 hours notice', () => {
      expect(
        getCancellationRefund({
          amount: 20000,
          cancelledBy: UserRole.MENTEE,
          wasConfirmed: true,
          now,
          startsAt: late,
        }),
      ).toBe(10000);
    });

    it('refunds in full when the mentor had not accepted yet', () => {
      expect(
        getCancellationRefund({
          amount: 20000,
          cancelledBy: UserRole.MENTEE,
          wasConfirmed: false,
          now,
          startsAt: late,
        }),
      ).toBe(20000);
    });

    it('always refunds in full when the mentor cancels', () => {
      expect(
        getCancellationRefund({
          amount: 20000,
          cancelledBy: UserRole.MENTOR,
          wasConfirmed: true,
          now,
          startsAt: late,
        }),
      ).toBe(20000);
    });
  });

  describe('getEarningsBreakdown', () => {
    it('takes 4% plus ₦100 from the mentor', () => {
      expect(getEarningsBreakdown(20000)).toEqual({
        grossAmount: 20000,
        platformFee: 900,
        netAmount: 19100,
      });
    });

    it('never takes more than the price', () => {
      expect(getEarningsBreakdown(50).netAmount).toBe(0);
    });

    it('earns nothing on free sessions', () => {
      expect(getEarningsBreakdown(0)).toEqual({
        grossAmount: 0,
        platformFee: 0,
        netAmount: 0,
      });
    });
  });
});
