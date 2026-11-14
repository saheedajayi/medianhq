import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminGuard } from '../../../../../src/modules/identity/auth/guards/admin.guard';

describe('AdminGuard', () => {
  const contextFor = (method: string) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ method, headers: { cookie: 'median_session=t' } }),
      }),
      getHandler: () => undefined,
      getClass: () => undefined,
    }) as never;

  const guardFor = (adminRole: string | null, section?: string) => {
    const auth = {
      getCurrentUser: jest.fn().mockResolvedValue({ role: 'ADMIN', adminRole }),
    };
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(section),
    } as unknown as Reflector;
    return new AdminGuard(auth as never, reflector);
  };

  it('lets a finance admin into finance but not into users', async () => {
    await expect(
      guardFor('FINANCE_ADMIN', 'finance').canActivate(contextFor('POST')),
    ).resolves.toBe(true);
    await expect(
      guardFor('FINANCE_ADMIN', 'users').canActivate(contextFor('GET')),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('lets a support agent read users but not change them', async () => {
    await expect(
      guardFor('SUPPORT_AGENT', 'users').canActivate(contextFor('GET')),
    ).resolves.toBe(true);
    await expect(
      guardFor('SUPPORT_AGENT', 'users').canActivate(contextFor('PATCH')),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('keeps settings, including invites, for super admins', async () => {
    await expect(
      guardFor('OPERATIONS_ADMIN', 'settings').canActivate(contextFor('POST')),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      guardFor('SUPER_ADMIN', 'settings').canActivate(contextFor('POST')),
    ).resolves.toBe(true);
  });

  it('gives an admin from before roles full access', async () => {
    await expect(
      guardFor(null, 'finance').canActivate(contextFor('POST')),
    ).resolves.toBe(true);
  });
});
