import { BadRequestException } from '@nestjs/common';
import { EarningsService } from '../../../../../src/modules/finance/earnings/earnings.service';
import {
  isSameName,
  MentorPayoutsService,
} from '../../../../../src/modules/finance/earnings/mentor-payouts.service';
import { PaystackError } from '../../../../../src/modules/finance/payouts/paystack-transfers';

describe('isSameName', () => {
  it('accepts the bank adding a middle name or reordering the names', () => {
    expect(isSameName('Emeka Okonkwo', 'OKONKWO EMEKA CHUKWUDI')).toBe(true);
    expect(isSameName('Emeka Okonkwo', 'Emeka  Okonkwo')).toBe(true);
  });

  it("rejects someone else's account", () => {
    expect(isSameName('Emeka Okonkwo', 'James O. Bankole')).toBe(false);
    expect(isSameName('Emeka Okonkwo', 'Emeka Bankole')).toBe(false);
  });
});

describe('MentorPayoutsService', () => {
  const now = new Date('2026-10-26T12:00:00.000Z');
  const mentor = {
    id: 'm1',
    role: 'MENTOR',
    firstName: 'Emeka',
    lastName: 'Okonkwo',
  } as never;
  const account = {
    mentorId: 'm1',
    bankCode: '058',
    bankName: 'Guaranty Trust Bank',
    accountNumber: '0123454421',
    accountName: 'OKONKWO EMEKA',
  };
  const clearedEarning = {
    id: 'e1',
    mentorId: 'm1',
    bookingId: null,
    amount: 142500,
    grossAmount: 150000,
    platformFee: 7500,
    currency: 'NGN',
    createdAt: new Date('2026-10-01T10:00:00.000Z'),
  };

  const setup = (overrides: Record<string, unknown> = {}) => {
    const repository = {
      findEarnings: jest.fn().mockResolvedValue([clearedEarning]),
      findPayouts: jest.fn().mockResolvedValue([]),
      findSessions: jest.fn().mockResolvedValue([]),
      findPayoutAccount: jest.fn().mockResolvedValue(account),
      savePayoutAccount: jest
        .fn()
        .mockImplementation((mentorId: string, data: object) =>
          Promise.resolve({ mentorId, ...data }),
        ),
      createPayout: jest.fn().mockImplementation((data: object) =>
        Promise.resolve({
          id: 'clxpayout00389',
          currency: 'NGN',
          createdAt: now,
          ...data,
        }),
      ),
      withMentorLock: jest
        .fn()
        .mockImplementation(
          (_mentorId: string, work: (db: unknown) => unknown) => work('tx'),
        ),
      ...overrides,
    };
    const payouts = {
      bankNames: jest
        .fn()
        .mockResolvedValue(new Map([['058', 'Guaranty Trust Bank']])),
      resolveAccountName: jest.fn().mockResolvedValue('OKONKWO EMEKA'),
    };
    const auth = { confirmPassword: jest.fn().mockResolvedValue(undefined) };
    const service = new MentorPayoutsService(
      repository as never,
      new EarningsService(repository as never),
      payouts as never,
      auth as never,
    );
    return { repository, payouts, auth, service };
  };

  it('requests everything that has cleared, into the saved account', async () => {
    const { repository, auth, service } = setup();

    const payout = await service.requestPayout(
      mentor,
      { password: 'correct horse' },
      now,
    );

    expect(auth.confirmPassword).toHaveBeenCalledWith('m1', 'correct horse');
    expect(repository.createPayout).toHaveBeenCalledWith(
      {
        mentorId: 'm1',
        amount: 142500,
        accountNumber: '0123454421',
        bankCode: '058',
      },
      'tx',
    );
    expect(payout).toMatchObject({
      amount: 142500,
      reference: 'MDN-2026-PAY-00389',
      bankName: 'Guaranty Trust Bank',
      accountLastFour: '4421',
    });
  });

  it('stops before touching the balance when the password is wrong', async () => {
    const { repository, auth, service } = setup();
    auth.confirmPassword.mockRejectedValue(
      new BadRequestException('Incorrect password.'),
    );

    await expect(
      service.requestPayout(mentor, { password: 'nope' }, now),
    ).rejects.toThrow('Incorrect password.');
    expect(repository.withMentorLock).not.toHaveBeenCalled();
  });

  it('refuses a payout when nothing has cleared or no account is saved', async () => {
    const stillClearing = setup({
      findEarnings: jest.fn().mockResolvedValue([
        {
          ...clearedEarning,
          createdAt: new Date('2026-10-26T00:00:00.000Z'),
        },
      ]),
    });
    await expect(
      stillClearing.service.requestPayout(mentor, { password: 'x' }, now),
    ).rejects.toThrow('nothing available');
    expect(stillClearing.repository.createPayout).not.toHaveBeenCalled();

    const noAccount = setup({
      findPayoutAccount: jest.fn().mockResolvedValue(null),
    });
    await expect(
      noAccount.service.requestPayout(mentor, { password: 'x' }, now),
    ).rejects.toThrow('Add a payout account');
  });

  it("won't save an account in someone else's name", async () => {
    const { repository, payouts, service } = setup();
    payouts.resolveAccountName.mockResolvedValue('James O. Bankole');

    await expect(
      service.saveAccount(mentor, {
        bankCode: '058',
        accountNumber: '0123454421',
      }),
    ).rejects.toThrow('Emeka Okonkwo');
    expect(repository.savePayoutAccount).not.toHaveBeenCalled();
  });

  it('saves a matching account and only hands back its last four digits', async () => {
    const { service } = setup();

    const saved = await service.saveAccount(mentor, {
      bankCode: '058',
      accountNumber: '0123454421',
    });

    expect(saved).toEqual({
      bankCode: '058',
      bankName: 'Guaranty Trust Bank',
      accountName: 'OKONKWO EMEKA',
      accountLastFour: '4421',
    });
  });

  it('explains when the bank has no such account', async () => {
    const { payouts, service } = setup();
    payouts.resolveAccountName.mockRejectedValue(
      new PaystackError('Could not resolve account name'),
    );

    await expect(
      service.resolveAccount(mentor, {
        bankCode: '058',
        accountNumber: '0000000000',
      }),
    ).rejects.toThrow("couldn't find that account");
    await expect(
      service.resolveAccount(mentor, { bankCode: '058', accountNumber: '12' }),
    ).rejects.toThrow('10-digit');
  });

  it('surfaces a service-unavailable error when Paystack rate-limits lookups', async () => {
    const { payouts, service } = setup();
    payouts.resolveAccountName.mockRejectedValue(
      new PaystackError(
        'Your daily limit for resolving account numbers has been exceeded',
        429,
      ),
    );

    await expect(
      service.resolveAccount(mentor, {
        bankCode: '058',
        accountNumber: '0123454421',
      }),
    ).rejects.toThrow('Could not verify your bank account right now');
  });

  it('shows the admin review steps to the mentor as processing', async () => {
    const row = (id: string, status: string) => ({
      id,
      mentorId: 'm1',
      amount: 18600,
      currency: 'NGN',
      status,
      accountNumber: '0123454421',
      bankCode: '058',
      createdAt: now,
      paidAt: null,
    });
    const { service } = setup({
      findPayouts: jest
        .fn()
        .mockResolvedValue([
          row('a', 'PENDING'),
          row('b', 'PROCESSED'),
          row('c', 'REJECTED'),
        ]),
    });

    const page = await service.getPayouts(mentor, {});

    expect(page.items.map((item) => item.status)).toEqual([
      'PROCESSING',
      'COMPLETED',
      'FAILED',
    ]);
    expect(page.items[0]).toMatchObject({
      bankName: 'Guaranty Trust Bank',
      accountLastFour: '4421',
    });
  });
});
