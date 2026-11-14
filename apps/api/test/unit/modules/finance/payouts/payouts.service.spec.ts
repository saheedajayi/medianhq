import { BadRequestException } from '@nestjs/common';
import { PaystackTransfers } from '../../../../../src/modules/finance/payouts/paystack-transfers';
import { PayoutsService } from '../../../../../src/modules/finance/payouts/payouts.service';

describe('PayoutsService.approve', () => {
  const payout = {
    id: 'po-1',
    mentorId: 'm1',
    amount: 120000,
    accountNumber: '0123456789',
    bankCode: '058',
    status: 'PENDING',
    transferReference: null,
    mentor: {
      firstName: 'Kwame',
      lastName: 'Mensah',
      email: 'kwame@example.com',
    },
  };

  const setup = (transferStatus: string, claimed = true) => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_x';
    const repository = {
      findById: jest.fn().mockResolvedValue(payout),
      claim: jest.fn().mockResolvedValue(claimed),
      update: jest
        .fn()
        .mockImplementation((_id: string, data: Record<string, unknown>) =>
          Promise.resolve({ ...payout, ...data }),
        ),
    };
    const email = { sendBookingUpdate: jest.fn().mockResolvedValue(undefined) };
    jest
      .spyOn(PaystackTransfers.prototype, 'createRecipient')
      .mockResolvedValue('RCP_1');
    const initiate = jest
      .spyOn(PaystackTransfers.prototype, 'initiateTransfer')
      .mockResolvedValue({
        status: transferStatus as never,
        transfer_code: 'TRF_1',
      });
    return {
      repository,
      email,
      initiate,
      service: new PayoutsService(repository as never, email as never),
    };
  };

  afterEach(() => jest.restoreAllMocks());

  it('marks the payout paid when Paystack confirms the transfer', async () => {
    const { repository, initiate, email, service } = setup('success');

    const paid = await service.approve('po-1');

    expect(initiate).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 120000, recipientCode: 'RCP_1' }),
    );
    expect(paid.status).toBe('PROCESSED');
    expect(repository.update).toHaveBeenCalledWith(
      'po-1',
      expect.objectContaining({ paidAt: expect.any(Date) as Date }),
    );
    expect(email.sendBookingUpdate).toHaveBeenCalled();
  });

  it('leaves a pending transfer in flight for the webhook to settle', async () => {
    const { service } = setup('pending');

    expect((await service.approve('po-1')).status).toBe('PROCESSING');
  });

  it('fails with a clear reason when Paystack wants an OTP', async () => {
    const { service } = setup('otp');

    const failed = await service.approve('po-1');

    expect(failed.status).toBe('FAILED');
    expect(failed.failureReason).toContain('Turn off OTP');
  });

  it('never sends a payout someone else already took', async () => {
    const { initiate, service } = setup('success', false);

    await expect(service.approve('po-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(initiate).not.toHaveBeenCalled();
  });
});
