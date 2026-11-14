import { BadRequestException, ConflictException } from '@nestjs/common';
import { createHash } from 'crypto';
import { AdminInvitesService } from '../../../../../src/modules/admin/invites/admin-invites.service';

describe('AdminInvitesService', () => {
  const now = new Date('2026-11-14T10:00:00.000Z');
  const admin = { id: 'admin-1', firstName: 'Tomi', lastName: 'Adebayo' };
  const invite = (overrides: Record<string, unknown> = {}) => ({
    id: 'invite-1',
    email: 'ops@medianhq.co',
    role: 'OPERATIONS_ADMIN',
    tokenHash: 'hash',
    invitedById: 'admin-1',
    invitedBy: { firstName: 'Tomi', lastName: 'Adebayo' },
    expiresAt: new Date('2026-11-21T10:00:00.000Z'),
    acceptedAt: null,
    revokedAt: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  });

  const setup = () => {
    const repository = {
      findUserIdByEmail: jest.fn().mockResolvedValue(null),
      findOpenInviteForEmail: jest.fn().mockResolvedValue(null),
      findUnusedInviteByTokenHash: jest.fn().mockResolvedValue(invite()),
      findUnusedInviteById: jest.fn().mockResolvedValue(invite()),
      createInvite: jest
        .fn()
        .mockImplementation((data: Record<string, unknown>) =>
          Promise.resolve(invite(data)),
        ),
      replaceToken: jest.fn().mockResolvedValue(invite()),
      acceptInvite: jest
        .fn()
        .mockResolvedValue({ id: 'new-admin', email: 'ops@medianhq.co' }),
    };
    const auth = {
      hashNewPassword: jest.fn().mockResolvedValue('scrypt:salt:hash'),
      issueTokensForUser: jest.fn().mockResolvedValue({
        sessionToken: 's',
        refreshToken: 'r',
        user: { id: 'new-admin' },
      }),
      setAuthCookies: jest.fn(),
    };
    const email = { sendBookingUpdate: jest.fn().mockResolvedValue(undefined) };
    const audit = { record: jest.fn().mockResolvedValue(undefined) };
    const service = new AdminInvitesService(
      repository as never,
      auth as never,
      email as never,
      audit as never,
    );
    return { repository, auth, email, audit, service };
  };

  it('stores only a hash of the link, expiring in 7 days, and emails the link', async () => {
    const { repository, email, audit, service } = setup();

    const created = await service.create(
      { email: '  Ops@MedianHQ.co ', role: 'OPERATIONS_ADMIN' },
      admin,
      now,
    );

    const [[stored]] = repository.createInvite.mock.calls as [
      [{ tokenHash: string }],
    ];
    expect(stored).toMatchObject({
      email: 'ops@medianhq.co',
      role: 'OPERATIONS_ADMIN',
      invitedById: 'admin-1',
      expiresAt: new Date('2026-11-21T10:00:00.000Z'),
    });
    const [[sent]] = email.sendBookingUpdate.mock.calls as [
      [{ ctaPath: string; paragraphs: string[] }],
    ];
    const token = sent.ctaPath.replace('/admin-invite/', '');
    expect(createHash('sha256').update(token).digest('hex')).toBe(
      stored.tokenHash,
    );
    expect(stored.tokenHash).not.toBe(token);
    expect(sent.paragraphs[0]).toBe(
      'Tomi Adebayo has invited you to join Median as a Operations Admin.',
    );
    expect(created.status).toBe('PENDING');
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ADMIN_INVITED' }),
    );
  });

  it('refuses an email that already has an account or a waiting invite', async () => {
    const taken = setup();
    taken.repository.findUserIdByEmail.mockResolvedValue({ id: 'mentor-1' });
    await expect(
      taken.service.create(
        { email: 'a@medianhq.co', role: 'SUPER_ADMIN' },
        admin,
        now,
      ),
    ).rejects.toBeInstanceOf(ConflictException);

    const waiting = setup();
    waiting.repository.findOpenInviteForEmail.mockResolvedValue(invite());
    await expect(
      waiting.service.create(
        { email: 'a@medianhq.co', role: 'SUPER_ADMIN' },
        admin,
        now,
      ),
    ).rejects.toBeInstanceOf(ConflictException);

    const badRole = setup();
    await expect(
      badRole.service.create(
        { email: 'a@medianhq.co', role: 'OWNER' },
        admin,
        now,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('only invites @medianhq.co addresses', async () => {
    const { repository, service } = setup();

    await expect(
      service.create(
        { email: 'ops@gmail.com', role: 'SUPER_ADMIN' },
        admin,
        now,
      ),
    ).rejects.toThrow('Admins must use an @medianhq.co email address.');
    expect(repository.createInvite).not.toHaveBeenCalled();
  });

  it('will not open an older invite to another domain', async () => {
    const { repository, service } = setup();
    repository.findUnusedInviteByTokenHash.mockResolvedValue(
      invite({ email: 'ops@gmail.com' }),
    );

    await expect(service.getByToken('token', now)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects an expired link', async () => {
    const { repository, service } = setup();
    repository.findUnusedInviteByTokenHash.mockResolvedValue(
      invite({ expiresAt: new Date('2026-11-14T09:59:00.000Z') }),
    );

    await expect(service.getByToken('token', now)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('creates the admin with the invited role and signs them in', async () => {
    const { repository, auth, service } = setup();
    const response = {};

    await service.accept(
      'token',
      { firstName: ' Ada ', lastName: 'Obi', password: 'Str0ng!pass' },
      response as never,
      now,
    );

    expect(repository.acceptInvite).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'invite-1', role: 'OPERATIONS_ADMIN' }),
      { firstName: 'Ada', lastName: 'Obi', passwordHash: 'scrypt:salt:hash' },
    );
    expect(auth.setAuthCookies).toHaveBeenCalledWith(
      response,
      expect.anything(),
    );
  });

  it('does not sign anyone in when the link was already used', async () => {
    const { repository, auth, service } = setup();
    repository.acceptInvite.mockResolvedValue(null);

    await expect(
      service.accept(
        'token',
        { firstName: 'Ada', lastName: 'Obi', password: 'Str0ng!pass' },
        {} as never,
        now,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(auth.setAuthCookies).not.toHaveBeenCalled();
  });
});
