import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminModerationService } from '../../../../../src/modules/admin/moderation/admin-moderation.service';

describe('AdminModerationService', () => {
  const admin = { id: 'admin-1', firstName: 'Tomi', lastName: 'Adebayo' };
  const flaggedAt = new Date('2026-11-14T08:00:00.000Z');
  const person = {
    id: 'u1',
    firstName: 'Kwame',
    lastName: 'Mensah',
    role: 'MENTOR',
    createdAt: flaggedAt,
    suspendedAt: null,
    mentorProfile: { avatarUrl: null, location: 'Lagos, Nigeria' },
    menteeProfile: null,
  };
  const flag = (overrides: Record<string, unknown> = {}) => ({
    id: 'flag-1',
    contentType: 'FORUM_POST',
    contentId: 'post-1',
    contentField: 'Post',
    content: 'Check out my store',
    authorId: 'u1',
    author: person,
    recipient: null,
    reason: 'Spam/Self Promotion',
    matchedTerms: ['check out my'],
    status: 'PENDING',
    flaggedAt,
    reviewedAt: null,
    actions: [],
    ...overrides,
  });

  const setup = () => {
    const repository = {
      findFlagById: jest.fn().mockResolvedValue(flag()),
      removeContent: jest.fn().mockResolvedValue(undefined),
      findAuthorEmail: jest
        .fn()
        .mockResolvedValue({ email: 'kwame@example.com', firstName: 'Kwame' }),
      recordAction: jest
        .fn()
        .mockImplementation(
          (_id: string, status: string, action: Record<string, unknown>) =>
            Promise.resolve(
              flag({ status, actions: [{ ...action, createdAt: flaggedAt }] }),
            ),
        ),
      upsertBlockedTerm: jest
        .fn()
        .mockImplementation((term: string, reason: string) =>
          Promise.resolve({ id: 't1', term, reason, createdAt: flaggedAt }),
        ),
    };
    const scanner = { clearCache: jest.fn() };
    const email = { sendBookingUpdate: jest.fn().mockResolvedValue(undefined) };
    const service = new AdminModerationService(
      repository as never,
      scanner as never,
      email as never,
    );
    return { repository, scanner, email, service };
  };

  it('removes the content only when the action is Remove', async () => {
    const { repository, service } = setup();

    const removed = await service.takeAction(
      'flag-1',
      { action: 'REMOVE' },
      admin,
    );
    expect(repository.removeContent).toHaveBeenCalledTimes(1);
    expect(removed.status).toBe('REMOVED');
    expect(removed.auditTrail.at(-1)).toMatchObject({
      label: 'Reviewed by Tomi Adebayo',
      detail: 'Content removed',
    });

    await service.takeAction('flag-1', { action: 'APPROVE' }, admin);
    expect(repository.removeContent).toHaveBeenCalledTimes(1);
  });

  it('emails the author when they are warned', async () => {
    const { email, service } = setup();

    const warned = await service.takeAction(
      'flag-1',
      { action: 'WARN_USER' },
      admin,
    );

    expect(warned.status).toBe('FLAGGED');
    expect(email.sendBookingUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'kwame@example.com' }),
    );
  });

  it('rejects an unknown action or flag', async () => {
    const { repository, service } = setup();

    await expect(
      service.takeAction('flag-1', { action: 'DELETE' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    repository.findFlagById.mockResolvedValue(null);
    await expect(
      service.takeAction('missing', { action: 'APPROVE' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('stores blocklist terms in lower case and refreshes the scanner', async () => {
    const { repository, scanner, service } = setup();

    await service.addBlockedTerm(
      { term: '  Quick Cash ', reason: 'Suspicious and potential scam' },
      admin,
    );

    expect(repository.upsertBlockedTerm).toHaveBeenCalledWith(
      'quick cash',
      'Suspicious and potential scam',
      'admin-1',
    );
    expect(scanner.clearCache).toHaveBeenCalled();
  });
});
