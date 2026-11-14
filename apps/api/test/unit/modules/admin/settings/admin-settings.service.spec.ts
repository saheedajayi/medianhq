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
    const service = new AdminSettingsService(repository as never);

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
