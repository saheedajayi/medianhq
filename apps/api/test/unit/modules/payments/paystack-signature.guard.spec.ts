import { UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { createHmac } from 'crypto';
import { PaystackSignatureGuard } from '../../../../src/modules/payments/paystack-signature.guard';

describe('PaystackSignatureGuard', () => {
  const secret = 'sk_test_signature_secret';
  const body = Buffer.from(JSON.stringify({ event: 'charge.success', data: { reference: 'ref' } }));
  const sign = (payload: Buffer, key = secret) => createHmac('sha512', key).update(payload).digest('hex');
  const contextFor = (request: { rawBody?: Buffer; headers: Record<string, string | undefined> }) =>
    ({ switchToHttp: () => ({ getRequest: () => request }) }) as unknown as ExecutionContext;

  let guard: PaystackSignatureGuard;
  const originalSecret = process.env.PAYSTACK_SECRET_KEY;

  beforeEach(() => {
    process.env.PAYSTACK_SECRET_KEY = secret;
    guard = new PaystackSignatureGuard();
  });

  afterAll(() => {
    process.env.PAYSTACK_SECRET_KEY = originalSecret;
  });

  it('accepts a webhook signed with our secret key', () => {
    const context = contextFor({ rawBody: body, headers: { 'x-paystack-signature': sign(body) } });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('rejects a webhook without a signature', () => {
    const context = contextFor({ rawBody: body, headers: {} });
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rejects a signature made with another key', () => {
    const context = contextFor({ rawBody: body, headers: { 'x-paystack-signature': sign(body, 'sk_test_other') } });
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rejects a body changed after signing', () => {
    const tampered = Buffer.from(JSON.stringify({ event: 'refund.processed', data: { id: 1 } }));
    const context = contextFor({ rawBody: tampered, headers: { 'x-paystack-signature': sign(body) } });
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rejects everything when the secret key is not configured', () => {
    delete process.env.PAYSTACK_SECRET_KEY;
    const context = contextFor({ rawBody: body, headers: { 'x-paystack-signature': sign(body) } });
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});
