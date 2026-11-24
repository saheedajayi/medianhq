import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminUsersService } from '../../../../../src/modules/admin/users/admin-users.service';

describe('AdminUsersService account actions', () => {
  const admin = { id: 'admin-1', firstName: 'Tomi', lastName: 'Adebayo' };
  const mentor = {
    id: 'u1',
    email: 'mentor@example.com',
    firstName: 'Ada',
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
    const emailService = {
      sendAdminMessage: jest.fn().mockResolvedValue(true),
    };
    const service = new AdminUsersService(
      repository as never,
      audit as never,
      emailService as never,
    );
    return { repository, audit, emailService, service };
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

  const body = [
    {
      type: 'paragraph',
      spans: [{ text: 'Hello ' }, { text: 'Ada', bold: true }, { text: '.' }],
    },
    {
      type: 'bullets',
      items: [
        [{ text: 'Check <your> payout' }],
        [{ text: 'Read the guide', link: 'https://medianhq.co/guide' }],
      ],
    },
  ];

  it('emails the user a formatted message and notes it on their activity log', async () => {
    const { audit, emailService, service } = setup(mentor);

    await service.email('u1', { subject: ' Your payout ', body }, admin);

    const text =
      'Hello Ada.\n\n- Check <your> payout\n- Read the guide (https://medianhq.co/guide)';
    expect(emailService.sendAdminMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'mentor@example.com',
        firstName: 'Ada',
        subject: 'Your payout',
        bodyHtml:
          '<p>Hello <strong>Ada</strong>.</p><br>' +
          '<ul style="margin:0;padding:0 0 0 24px;">' +
          '<li>Check &lt;your&gt; payout</li>' +
          '<li><a href="https://medianhq.co/guide" style="color:#FF5514;text-decoration:underline;">Read the guide</a></li>' +
          '</ul><br>',
        bodyText: text,
      }),
    );
    expect(audit.record).toHaveBeenCalledWith({
      userId: 'u1',
      email: 'mentor@example.com',
      action: 'EMAIL_SENT_BY_ADMIN',
      status: 'SUCCESS',
      metadata: { adminId: 'admin-1', reason: 'Your payout', message: text },
    });
  });

  it('refuses an email without a subject or a message', async () => {
    const { emailService, service } = setup(mentor);
    const blank = [{ type: 'paragraph', spans: [{ text: '  ' }] }];

    await expect(
      service.email('u1', { subject: 'Hi', body: blank }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.email('u1', { subject: '', body }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(emailService.sendAdminMessage).not.toHaveBeenCalled();
  });

  it('refuses unsafe links and anything that is not a formatted message', async () => {
    const { emailService, service } = setup(mentor);
    const withLink = (link: string) => [
      { type: 'paragraph', spans: [{ text: 'Click', link }] },
    ];

    for (const bad of [
      withLink('javascript:alert(1)'),
      withLink('data:text/html,hi'),
      '<p>Hello</p>',
      [{ type: 'script', spans: [{ text: 'x' }] }],
    ]) {
      await expect(
        service.email('u1', { subject: 'Hi', body: bad }),
      ).rejects.toBeInstanceOf(BadRequestException);
    }
    expect(emailService.sendAdminMessage).not.toHaveBeenCalled();
  });

  it("says so, and logs a failure, when the email can't be sent", async () => {
    const { audit, emailService, service } = setup(mentor);
    emailService.sendAdminMessage.mockRejectedValue(new Error('down'));

    await expect(
      service.email('u1', { subject: 'Hi', body }, admin),
    ).rejects.toThrow("couldn't be sent");
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'EMAIL_SENT_BY_ADMIN',
        status: 'FAILURE',
      }),
    );
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
