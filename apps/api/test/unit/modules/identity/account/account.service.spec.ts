import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { AccountService } from '../../../../../src/modules/identity/account/account.service';

describe('AccountService', () => {
  const now = new Date('2026-11-20T09:00:00.000Z');
  const mentee = {
    id: 'u1',
    email: 'ada@medianhq.co',
    role: 'MENTEE',
  } as never;
  const mentor = {
    id: 'm1',
    email: 'emeka@medianhq.co',
    role: 'MENTOR',
  } as never;
  const admin = { id: 'a1', email: 'ops@medianhq.co', role: 'ADMIN' } as never;

  const setup = (overrides: Record<string, unknown> = {}) => {
    const repository = {
      findUpcomingBookingIds: jest.fn().mockResolvedValue([]),
      countPayoutsInFlight: jest.fn().mockResolvedValue(0),
      deactivate: jest.fn().mockResolvedValue(undefined),
      scheduleDeletion: jest.fn().mockResolvedValue(undefined),
      cancelDeletion: jest.fn().mockResolvedValue(undefined),
      signOutIfLeaving: jest.fn().mockResolvedValue(true),
      findDueForDeletion: jest.fn().mockResolvedValue([]),
      erase: jest.fn().mockResolvedValue(undefined),
      ...overrides,
    };
    const bookings = { cancel: jest.fn().mockResolvedValue({ success: true }) };
    const auth = {
      assertCurrentPassword: jest.fn().mockResolvedValue(undefined),
    };
    const service = new AccountService(
      repository as never,
      bookings as never,
      auth as never,
    );
    return { repository, bookings, auth, service };
  };

  describe('deactivate', () => {
    it('cancels upcoming sessions, then pauses the account', async () => {
      const { service, repository, bookings } = setup({
        findUpcomingBookingIds: jest.fn().mockResolvedValue(['b1', 'b2']),
      });

      await expect(service.deactivate(mentor)).resolves.toEqual({
        success: true,
      });

      expect(bookings.cancel).toHaveBeenCalledWith(
        mentor,
        'b1',
        'Account deactivated',
      );
      expect(bookings.cancel).toHaveBeenCalledWith(
        mentor,
        'b2',
        'Account deactivated',
      );
      expect(repository.deactivate).toHaveBeenCalledWith('m1');
    });

    it('carries on when a session was already cancelled or has started', async () => {
      const { service, repository, bookings } = setup({
        findUpcomingBookingIds: jest.fn().mockResolvedValue(['b1', 'b2']),
      });
      bookings.cancel
        .mockRejectedValueOnce(new ConflictException('gone'))
        .mockRejectedValueOnce(new BadRequestException('started'));

      await service.deactivate(mentee);

      expect(repository.deactivate).toHaveBeenCalledWith('u1');
    });

    it('stays active when a session could not be cancelled', async () => {
      const { service, repository, bookings } = setup({
        findUpcomingBookingIds: jest.fn().mockResolvedValue(['b1']),
      });
      bookings.cancel.mockRejectedValueOnce(new Error('refund provider down'));

      await expect(service.deactivate(mentee)).rejects.toThrow(
        'refund provider down',
      );
      expect(repository.deactivate).not.toHaveBeenCalled();
    });

    it('is not offered to admins', async () => {
      const { service, repository } = setup();
      await expect(service.deactivate(admin)).rejects.toThrow(
        ForbiddenException,
      );
      expect(repository.deactivate).not.toHaveBeenCalled();
    });
  });

  describe('scheduleDeletion', () => {
    it('books the deletion 14 days out once the password checks out', async () => {
      const { service, repository, auth, bookings } = setup({
        findUpcomingBookingIds: jest.fn().mockResolvedValue(['b1']),
      });

      const result = await service.scheduleDeletion(
        mentee,
        { acknowledged: true, password: 'hunter22!' },
        now,
      );

      const scheduledFor = new Date('2026-12-04T09:00:00.000Z');
      expect(result).toEqual({ success: true, scheduledFor, graceDays: 14 });
      expect(auth.assertCurrentPassword).toHaveBeenCalledWith(
        'u1',
        'hunter22!',
      );
      expect(bookings.cancel).toHaveBeenCalledWith(
        mentee,
        'b1',
        'Account scheduled for deletion',
      );
      expect(repository.scheduleDeletion).toHaveBeenCalledWith(
        'u1',
        scheduledFor,
      );
    });

    it('needs the permanence tick', async () => {
      const { service, repository, auth } = setup();
      await expect(
        service.scheduleDeletion(mentee, { password: 'hunter22!' }, now),
      ).rejects.toThrow(BadRequestException);
      expect(auth.assertCurrentPassword).not.toHaveBeenCalled();
      expect(repository.scheduleDeletion).not.toHaveBeenCalled();
    });

    it('changes nothing when the password is wrong', async () => {
      const { service, repository, auth, bookings } = setup({
        findUpcomingBookingIds: jest.fn().mockResolvedValue(['b1']),
      });
      auth.assertCurrentPassword.mockRejectedValueOnce(
        new BadRequestException('That password is incorrect.'),
      );

      await expect(
        service.scheduleDeletion(
          mentee,
          { acknowledged: true, password: 'nope' },
          now,
        ),
      ).rejects.toThrow('That password is incorrect.');
      expect(bookings.cancel).not.toHaveBeenCalled();
      expect(repository.scheduleDeletion).not.toHaveBeenCalled();
    });

    it('makes a mentor wait for a payout that is on its way', async () => {
      const { service, repository, bookings } = setup({
        countPayoutsInFlight: jest.fn().mockResolvedValue(1),
        findUpcomingBookingIds: jest.fn().mockResolvedValue(['b1']),
      });

      await expect(
        service.scheduleDeletion(
          mentor,
          { acknowledged: true, password: 'x' },
          now,
        ),
      ).rejects.toThrow(ConflictException);
      expect(bookings.cancel).not.toHaveBeenCalled();
      expect(repository.scheduleDeletion).not.toHaveBeenCalled();
    });
  });

  describe('confirmDeletion', () => {
    it('signs a leaving account out everywhere', async () => {
      const { service, repository } = setup();
      await expect(service.confirmDeletion(mentee)).resolves.toEqual({
        success: true,
      });
      expect(repository.signOutIfLeaving).toHaveBeenCalledWith('u1');
    });

    it('refuses an account that is not scheduled for deletion', async () => {
      const { service } = setup({
        signOutIfLeaving: jest.fn().mockResolvedValue(false),
      });
      await expect(service.confirmDeletion(mentee)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('sweep', () => {
    it('erases every account past its grace period, even if one fails', async () => {
      const erase = jest
        .fn()
        .mockRejectedValueOnce(new Error('db hiccup'))
        .mockResolvedValueOnce(undefined);
      const { service, repository } = setup({
        erase,
        findDueForDeletion: jest.fn().mockResolvedValue([
          { id: 'u1', email: 'ada@medianhq.co' },
          { id: 'u2', email: 'bola@medianhq.co' },
        ]),
      });

      await service.sweep(now);

      expect(repository.findDueForDeletion).toHaveBeenCalledWith(now);
      expect(erase).toHaveBeenCalledWith('u1', 'ada@medianhq.co');
      expect(erase).toHaveBeenCalledWith('u2', 'bola@medianhq.co');
    });
  });
});
