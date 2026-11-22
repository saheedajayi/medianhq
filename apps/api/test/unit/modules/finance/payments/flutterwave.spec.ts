import { UnauthorizedException } from '@nestjs/common';
import { convertBetween } from '../../../../../src/modules/finance/exchange-rates/exchange-rates.service';
import {
  isFlutterwaveCurrency,
  isPaidTransaction,
  refundStatusFor,
} from '../../../../../src/modules/finance/payments/flutterwave';
import { FlutterwaveSignatureGuard } from '../../../../../src/modules/finance/payments/flutterwave-signature.guard';

describe('Flutterwave helpers', () => {
  const transaction = {
    id: 9001,
    tx_ref: 'MEDIAN_b1_1',
    status: 'successful',
    amount: 300,
    currency: 'GHS',
  };
  const expected = { reference: 'MEDIAN_b1_1', amount: 300, currency: 'GHS' };

  it('accepts only a successful charge for the right reference, currency and amount', () => {
    expect(isPaidTransaction(transaction, expected)).toBe(true);
    expect(
      isPaidTransaction({ ...transaction, amount: '300.00' }, expected),
    ).toBe(true);
    expect(
      isPaidTransaction({ ...transaction, status: 'failed' }, expected),
    ).toBe(false);
    expect(
      isPaidTransaction({ ...transaction, currency: 'NGN' }, expected),
    ).toBe(false);
    expect(isPaidTransaction({ ...transaction, amount: 299 }, expected)).toBe(
      false,
    );
    expect(
      isPaidTransaction({ ...transaction, tx_ref: 'other' }, expected),
    ).toBe(false);
  });

  it("reads Flutterwave's refund statuses", () => {
    expect(refundStatusFor('completed')).toBe('PROCESSED');
    expect(refundStatusFor('completed-momo')).toBe('PROCESSED');
    expect(refundStatusFor('pending-bank-transfer')).toBe('PENDING');
    expect(refundStatusFor('processing')).toBe('PENDING');
    expect(refundStatusFor('failed')).toBe('FAILED');
  });

  it('keeps naira on Paystack', () => {
    expect(isFlutterwaveCurrency('GHS')).toBe(true);
    expect(isFlutterwaveCurrency('USD')).toBe(true);
    expect(isFlutterwaveCurrency('NGN')).toBe(false);
    expect(isFlutterwaveCurrency('CAD')).toBe(false);
  });

  it('converts through the dollar and rounds to a whole unit', () => {
    const rates = { NGN: 1500, GHS: 15, KES: 130 };
    // ₦30,000 is $20, which is GH₵300
    expect(convertBetween(30000, 'NGN', 'GHS', rates)).toBe(300);
    expect(convertBetween(20, 'USD', 'KES', rates)).toBe(2600);
    expect(convertBetween(20, 'USD', 'USD', rates)).toBe(20);
    expect(convertBetween(20, 'USD', 'XOF', rates)).toBeNull();
  });
});

describe('FlutterwaveSignatureGuard', () => {
  const contextWith = (headers: Record<string, string>) =>
    ({
      switchToHttp: () => ({ getRequest: () => ({ headers }) }),
    }) as never;

  afterEach(() => delete process.env.FLUTTERWAVE_SECRET_HASH);

  it("accepts the dashboard's secret hash and rejects anything else", () => {
    process.env.FLUTTERWAVE_SECRET_HASH = 'median-hash';
    const guard = new FlutterwaveSignatureGuard();

    expect(
      guard.canActivate(contextWith({ 'verif-hash': 'median-hash' })),
    ).toBe(true);
    expect(() =>
      guard.canActivate(contextWith({ 'verif-hash': 'wrong' })),
    ).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(contextWith({}))).toThrow(
      UnauthorizedException,
    );
  });

  it('rejects every webhook when no secret hash is set', () => {
    expect(() =>
      new FlutterwaveSignatureGuard().canActivate(
        contextWith({ 'verif-hash': '' }),
      ),
    ).toThrow(UnauthorizedException);
  });
});
