import { PaymentStatus } from '@prisma/client';
import { FlutterwaveClient } from '../../../../../src/modules/finance/payments/flutterwave';
import { PaymentsService } from '../../../../../src/modules/finance/payments/payments.service';

describe('PaymentsService with Flutterwave', () => {
  const mentee = {
    id: 'mentee-1',
    email: 'mentee@medianhq.co',
    firstName: 'Ama',
    lastName: 'Mensah',
  } as never;
  // A ₦30,000 session listed in naira
  const payment = {
    id: 'pay-1',
    bookingId: 'b1',
    amount: 30000,
    currency: 'NGN',
    listedAmount: null,
    listedCurrency: null,
    status: PaymentStatus.PENDING,
    provider: 'PAYSTACK',
    providerReference: null,
    chargeAmount: null,
    chargeCurrency: null,
    refundStatus: null,
    refundAmount: null,
  };
  const booking = {
    id: 'b1',
    menteeId: 'mentee-1',
    mentorId: 'mentor-1',
    status: 'PENDING_PAYMENT',
    startsAt: new Date('2026-12-01T10:00:00Z'),
    payment,
  };

  const setup = () => {
    process.env.FLUTTERWAVE_SECRET_KEY = 'FLWSECK_TEST-x';
    process.env.WEB_ORIGIN = 'https://dev.medianhq.co';
    const repository = {
      findBookingById: jest.fn().mockResolvedValue(booking),
      upsertPayment: jest
        .fn()
        .mockImplementation((_id: string, data: object) =>
          Promise.resolve({ ...payment, ...data }),
        ),
      findPaymentByBookingId: jest.fn(),
      findPaymentByReference: jest.fn(),
      confirmPaymentAndRequestMentor: jest.fn(),
      updatePayment: jest.fn().mockResolvedValue(undefined),
    };
    // One dollar buys ₦1,500 or GH₵15
    const exchangeRates = {
      convert: jest.fn((amount: number, from: string, to: string) => {
        const rates: Record<string, number> = { USD: 1, NGN: 1500, GHS: 15 };
        return Promise.resolve(Math.round((amount / rates[from]) * rates[to]));
      }),
    };
    const notifications = { notify: jest.fn() };
    const service = new PaymentsService(
      repository as never,
      notifications as never,
      {} as never,
      exchangeRates as never,
    );
    return { repository, notifications, service };
  };

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.FLUTTERWAVE_SECRET_KEY;
  });

  it('quotes and charges the converted price in the chosen currency', async () => {
    const { repository, service } = setup();
    const checkout = jest
      .spyOn(FlutterwaveClient.prototype, 'createCheckout')
      .mockResolvedValue('https://checkout.flutterwave.com/pay/abc');

    await expect(service.quote(mentee, 'b1', 'GHS')).resolves.toEqual({
      amount: 300,
      currency: 'GHS',
      provider: 'FLUTTERWAVE',
    });
    const result = await service.initialize(mentee, 'b1', 'GHS');

    expect(checkout).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 300, currency: 'GHS' }),
    );
    expect(result).toMatchObject({
      authorizationUrl: 'https://checkout.flutterwave.com/pay/abc',
      amount: 300,
      currency: 'GHS',
    });
    // The naira price stays as the payment's amount, so earnings don't change
    expect(repository.upsertPayment).toHaveBeenCalledWith(
      'b1',
      expect.objectContaining({
        amount: 30000,
        currency: 'NGN',
        provider: 'FLUTTERWAVE',
        chargeAmount: 300,
        chargeCurrency: 'GHS',
      }),
    );
  });

  it('charges a session listed in dollars its exact listed price in dollars', async () => {
    const { service, repository } = setup();
    repository.findBookingById.mockResolvedValue({
      ...booking,
      payment: { ...payment, listedAmount: 20, listedCurrency: 'USD' },
    });

    await expect(service.quote(mentee, 'b1', 'USD')).resolves.toMatchObject({
      amount: 20,
    });
  });

  it("refuses currencies Flutterwave doesn't take for us", async () => {
    const { service } = setup();

    await expect(service.initialize(mentee, 'b1', 'CAD')).rejects.toThrow(
      "can't take payments in CAD",
    );
  });

  it('confirms a Flutterwave payment only once Flutterwave reports it paid', async () => {
    const { repository, notifications, service } = setup();
    const paid = {
      ...payment,
      provider: 'FLUTTERWAVE',
      providerReference: 'MEDIAN_b1_1',
      chargeAmount: 300,
      chargeCurrency: 'GHS',
      booking,
    };
    repository.findPaymentByReference.mockResolvedValue(paid);
    repository.confirmPaymentAndRequestMentor.mockResolvedValue({
      payment: { ...paid, status: PaymentStatus.SUCCESSFUL },
      booking: { ...booking, status: 'PENDING_CONFIRMATION' },
      movedToMentor: true,
    });
    const find = jest
      .spyOn(FlutterwaveClient.prototype, 'findTransaction')
      .mockResolvedValue({
        id: 9001,
        tx_ref: 'MEDIAN_b1_1',
        status: 'successful',
        amount: 300,
        currency: 'GHS',
      });

    const result = await service.verify('MEDIAN_b1_1');

    expect(find).toHaveBeenCalledWith('MEDIAN_b1_1');
    expect(result.verified).toBe(true);
    expect(notifications.notify).toHaveBeenCalledWith('b1', 'REQUESTED');

    find.mockResolvedValue({
      id: 9001,
      tx_ref: 'MEDIAN_b1_1',
      status: 'successful',
      amount: 300,
      currency: 'NGN',
    });
    repository.confirmPaymentAndRequestMentor.mockClear();
    await expect(service.verify('MEDIAN_b1_1')).resolves.toMatchObject({
      verified: false,
    });
    expect(repository.confirmPaymentAndRequestMentor).not.toHaveBeenCalled();
  });

  it('refunds and tells the mentee when the time was taken before they paid', async () => {
    const { repository, notifications, service } = setup();
    const paid = {
      ...payment,
      provider: 'FLUTTERWAVE',
      providerReference: 'MEDIAN_b1_1',
      chargeAmount: 300,
      chargeCurrency: 'GHS',
      booking,
    };
    repository.findPaymentByReference.mockResolvedValue(paid);
    repository.confirmPaymentAndRequestMentor.mockResolvedValue({
      payment: { ...paid, status: PaymentStatus.SUCCESSFUL },
      booking: { ...booking, status: 'CANCELLED' },
      movedToMentor: false,
      slotTaken: true,
    });
    jest
      .spyOn(FlutterwaveClient.prototype, 'findTransaction')
      .mockResolvedValue({
        id: 9001,
        tx_ref: 'MEDIAN_b1_1',
        status: 'successful',
        amount: 300,
        currency: 'GHS',
      });
    const refund = jest.spyOn(service, 'refund').mockResolvedValue(30000);

    await service.verify('MEDIAN_b1_1');

    expect(refund).toHaveBeenCalledWith('b1', 30000);
    expect(notifications.notify.mock.calls).toEqual([
      ['b1', 'SLOT_TAKEN', { refundAmount: 30000 }],
    ]);
  });

  it('refunds the same share of what was paid, in that currency', async () => {
    const { repository, service } = setup();
    repository.findPaymentByBookingId.mockResolvedValue({
      ...payment,
      status: PaymentStatus.SUCCESSFUL,
      provider: 'FLUTTERWAVE',
      providerReference: 'MEDIAN_b1_1',
      chargeAmount: 300,
      chargeCurrency: 'GHS',
    });
    jest
      .spyOn(FlutterwaveClient.prototype, 'findTransaction')
      .mockResolvedValue({
        id: 9001,
        tx_ref: 'MEDIAN_b1_1',
        status: 'successful',
        amount: 300,
        currency: 'GHS',
      });
    const refund = jest
      .spyOn(FlutterwaveClient.prototype, 'refund')
      .mockResolvedValue({ id: 77, status: 'completed' });

    // Half of the naira price back, for a late cancellation
    const refunded = await service.refund('b1', 15000);

    expect(refunded).toBe(15000);
    expect(refund).toHaveBeenCalledWith(9001, 150);
    expect(repository.updatePayment).toHaveBeenCalledWith(
      'pay-1',
      expect.objectContaining({
        refundAmount: 15000,
        refundStatus: 'PROCESSED',
        refundReference: '77',
        status: PaymentStatus.REFUNDED,
      }),
    );
  });

  it('records a refund Flutterwave refuses as failed, so admins can retry it', async () => {
    const { repository, service } = setup();
    repository.findPaymentByBookingId.mockResolvedValue({
      ...payment,
      status: PaymentStatus.SUCCESSFUL,
      provider: 'FLUTTERWAVE',
      providerReference: 'MEDIAN_b1_1',
      chargeAmount: 300,
      chargeCurrency: 'GHS',
    });
    jest
      .spyOn(FlutterwaveClient.prototype, 'findTransaction')
      .mockRejectedValue(new Error('down'));

    await service.refund('b1', 30000);

    expect(repository.updatePayment).toHaveBeenCalledWith('pay-1', {
      refundAmount: 30000,
      refundStatus: 'FAILED',
    });
  });
});
