import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminModerationRepository } from '../../../../../src/modules/admin/moderation/admin-moderation.repository';
import { AdminModerationService } from '../../../../../src/modules/admin/moderation/admin-moderation.service';

describe('AdminModerationService', () => {
  const admin = { id: 'admin-1', firstName: 'Tomi', lastName: 'Adebayo' };
  const setup = () => {
    const repository = new AdminModerationRepository();
    return { repository, service: new AdminModerationService(repository) };
  };

  it('counts flags by type and pages the queue', () => {
    const { service } = setup();
    const flags = service.getFlags({});

    expect(flags.counts).toEqual({
      all: 50,
      forumPost: 30,
      message: 10,
      profileText: 10,
    });
    expect(flags.items).toHaveLength(10);
  });

  it('narrows the queue by type and search', () => {
    const { service } = setup();

    expect(service.getFlags({ type: 'MESSAGE' }).total).toBe(10);
    expect(service.getFlags({ search: 'spiritual healer' }).total).toBe(5);
    // An unknown type is ignored rather than matching nothing
    expect(service.getFlags({ type: 'VIDEO' }).total).toBe(50);
  });

  it('records a reviewer action on the flag and in the history', () => {
    const { service } = setup();
    const [flag] = service.getFlags({ type: 'FORUM_POST' }).items;
    const historyBefore = service.getHistory({}).total;

    const updated = service.takeAction(flag.id, { action: 'ESCALATE' }, admin);

    expect(updated.status).toBe('ESCALATED');
    expect(updated.auditTrail.at(-1)).toMatchObject({
      label: 'Reviewed by Tomi Adebayo',
      detail: 'Escalated',
    });
    const history = service.getHistory({});
    expect(history.total).toBe(historyBefore + 1);
    expect(history.items[0]).toMatchObject({
      outcome: 'ESCALATED',
      reviewer: { name: 'Tomi Adebayo' },
    });
  });

  it('rejects an unknown action or flag', () => {
    const { service } = setup();
    const [flag] = service.getFlags({}).items;

    expect(() => service.takeAction(flag.id, { action: 'DELETE' })).toThrow(
      BadRequestException,
    );
    expect(() => service.takeAction('missing', { action: 'APPROVE' })).toThrow(
      NotFoundException,
    );
  });
});
