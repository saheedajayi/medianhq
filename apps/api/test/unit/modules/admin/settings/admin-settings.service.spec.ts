import { AdminSettingsService } from '../../../../../src/modules/admin/settings/admin-settings.service';

describe('AdminSettingsService.getAuditLog', () => {
  const at = new Date('2026-10-06T09:36:00.000Z');
  const entry = (id: string, action: string, metadata: unknown) => ({
    id,
    action,
    metadata,
    createdAt: at,
    user: { firstName: 'Kwame', lastName: 'Mensah' },
  });

  it('names the admin behind each action and who it was done to', async () => {
    const repository = {
      findAdminActions: jest.fn().mockResolvedValue([
        entry('a', 'APPLICATION_APPROVED', {
          adminId: 'admin-1',
          adminName: 'Tomi Adebayo',
        }),
        // Account actions store only the admin's ID
        entry('b', 'ACCOUNT_SUSPENDED', {
          adminId: 'admin-2',
          reason: 'Repeated no-shows',
        }),
        entry('c', 'ACCOUNT_FLAGGED', { adminId: null }),
      ]),
      findUserNames: jest
        .fn()
        .mockResolvedValue([
          { id: 'admin-2', firstName: 'Sade', lastName: 'Yusuf' },
        ]),
    };
    const service = new AdminSettingsService(repository as never, {} as never);

    const log = await service.getAuditLog();

    expect(log.map((row) => [row.adminName, row.action, row.details])).toEqual([
      ['Tomi Adebayo', 'Application approved', 'Kwame Mensah'],
      ['Sade Yusuf', 'Account suspended', 'Kwame Mensah · Repeated no-shows'],
      ['Backoffice', 'Account flagged', 'Kwame Mensah'],
    ]);
    // Only the admin whose name wasn't recorded is looked up
    expect(repository.findUserNames).toHaveBeenCalledWith(['admin-2']);
  });
});

describe('AdminSettingsService.updateAdmin', () => {
  const actor = { id: 'admin-1', firstName: 'Tomi', lastName: 'Adebayo' };
  const setup = (superAdmins: number) => {
    const repository = {
      findAdmin: jest.fn().mockResolvedValue({
        id: 'admin-2',
        email: 'ops@medianhq.co',
        adminRole: 'SUPER_ADMIN',
        suspendedAt: null,
      }),
      countActiveSuperAdmins: jest.fn().mockResolvedValue(superAdmins),
      updateAdminRole: jest.fn().mockResolvedValue({}),
      setAdminActive: jest.fn().mockResolvedValue({}),
      findAdmins: jest.fn().mockResolvedValue([]),
    };
    const audit = { record: jest.fn().mockResolvedValue(undefined) };
    return {
      repository,
      service: new AdminSettingsService(repository as never, audit as never),
    };
  };

  it('keeps at least one active super admin', async () => {
    const { repository, service } = setup(1);

    await expect(
      service.updateAdmin('admin-2', { adminRole: 'FINANCE_ADMIN' }, actor),
    ).rejects.toThrow('Median needs at least one active super admin.');
    await expect(
      service.updateAdmin('admin-2', { isActive: false }, actor),
    ).rejects.toThrow('Median needs at least one active super admin.');
    expect(repository.updateAdminRole).not.toHaveBeenCalled();
  });

  it('changes a type when another super admin remains', async () => {
    const { repository, service } = setup(2);

    await service.updateAdmin('admin-2', { adminRole: 'FINANCE_ADMIN' }, actor);

    expect(repository.updateAdminRole).toHaveBeenCalledWith(
      'admin-2',
      'FINANCE_ADMIN',
    );
  });

  it('does not let an admin change their own access', async () => {
    const { service } = setup(2);

    await expect(
      service.updateAdmin('admin-1', { isActive: false }, actor),
    ).rejects.toThrow("You can't change your own admin access.");
  });
});
