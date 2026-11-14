import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminUsersService } from '../../../../../src/modules/admin/users/admin-users.service';

describe('AdminUsersService account actions', () => {
  const admin = { id: 'admin-1', firstName: 'Tomi', lastName: 'Adebayo' };
  const mentor = {
    id: 'u1',
    email: 'mentor@example.com',
    suspendedAt: null,
    flaggedAt: null,
  };

  const setup = (user: unknown) => {
    const repository = {
      findManagedUser: jest.fn().mockResolvedValue(user),
      suspendUser: jest.fn().mockResolvedValue({}),
      reinstateUser: jest.fn().mockResolvedValue({}),
      setUserFlag: jest.fn().mockResolvedValue({}),
    };
    const audit = { record: jest.fn().mockResolvedValue(undefined) };
    const service = new AdminUsersService(repository as never, audit as never);
    return { repository, audit, service };
  };

  it('suspends with a trimmed reason and records who did it', async () => {
    const { repository, audit, service } = setup(mentor);

    await service.suspend('u1', '  Repeated no-shows ', admin);

    expect(repository.suspendUser).toHaveBeenCalledWith(
      'u1',
      'Repeated no-shows',
    );
    expect(audit.record).toHaveBeenCalledWith({
      userId: 'u1',
      email: 'mentor@example.com',
      action: 'ACCOUNT_SUSPENDED',
      status: 'SUCCESS',
      metadata: { adminId: 'admin-1', reason: 'Repeated no-shows' },
    });
  });

  it('refuses to suspend without a reason', async () => {
    const { repository, service } = setup(mentor);

    await expect(service.suspend('u1', '   ')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repository.suspendUser).not.toHaveBeenCalled();
  });

  it('cannot act on a user the directory does not manage, such as an admin', async () => {
    const { service } = setup(null);

    await expect(service.suspend('admin-2', 'reason')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('reinstates only a suspended account', async () => {
    const active = setup(mentor);
    await expect(active.service.reinstate('u1')).rejects.toBeInstanceOf(
      BadRequestException,
    );

    const suspended = setup({ ...mentor, suspendedAt: new Date() });
    await suspended.service.reinstate('u1', admin);
    expect(suspended.repository.reinstateUser).toHaveBeenCalledWith('u1');
  });

  it('does nothing when the flag is already as asked', async () => {
    const { repository, audit, service } = setup(mentor);

    await service.setFlag('u1', false);

    expect(repository.setUserFlag).not.toHaveBeenCalled();
    expect(audit.record).not.toHaveBeenCalled();
  });
});
