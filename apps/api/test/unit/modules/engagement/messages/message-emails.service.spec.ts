import {
  MessageEmailsService,
  QUIET_WINDOW_MS,
  UNREAD_WAIT_MS,
} from '../../../../../src/modules/engagement/messages/message-emails.service';

describe('MessageEmailsService', () => {
  let repository: Record<string, jest.Mock>;
  let emailService: { sendBookingUpdate: jest.Mock };
  let service: MessageEmailsService;

  const to = new Date('2026-11-23T12:00:00Z');
  const from = new Date(to.getTime() - 60 * 1000);
  const sentAt = new Date(to.getTime() - UNREAD_WAIT_MS - 30 * 1000);

  const person = (id: string, extra: Record<string, unknown> = {}) => ({
    id,
    email: `${id}@medianhq.co`,
    firstName: id,
    lastName: 'Obi',
    role: 'MENTEE',
    suspendedAt: null,
    settings: null,
    ...extra,
  });
  const message = (recipient = person('bola', { role: 'MENTOR' })) => ({
    id: 'm1',
    conversationId: 'c1',
    senderId: 'ada',
    createdAt: sentAt,
    conversation: {
      participants: [{ user: person('ada') }, { user: recipient }],
    },
  });

  beforeEach(() => {
    repository = {
      findUnreadSentBetween: jest.fn().mockResolvedValue([message()]),
      countUnreadBefore: jest.fn().mockResolvedValue(0),
    };
    emailService = {
      sendBookingUpdate: jest.fn().mockResolvedValue(undefined),
    };
    service = new MessageEmailsService(
      repository as never,
      emailService as never,
    );
  });

  it('emails the recipient about a message left unread for 10 minutes', async () => {
    expect(await service.sendDue(from, to)).toBe(1);

    expect(repository.findUnreadSentBetween).toHaveBeenCalledWith(
      new Date(from.getTime() - UNREAD_WAIT_MS),
      new Date(to.getTime() - UNREAD_WAIT_MS),
    );
    expect(emailService.sendBookingUpdate).toHaveBeenCalledTimes(1);
    expect(emailService.sendBookingUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'bola@medianhq.co',
        subject: 'New message from ada Obi',
        ctaPath: '/mentor/messages?with=ada',
        idempotencyKey: 'message:m1',
      }),
    );
  });

  it('stays quiet when an earlier message in the chat is still unread', async () => {
    repository.countUnreadBefore.mockResolvedValue(1);

    expect(await service.sendDue(from, to)).toBe(0);
    expect(repository.countUnreadBefore).toHaveBeenCalledWith(
      'c1',
      'bola',
      new Date(sentAt.getTime() - QUIET_WINDOW_MS),
      sentAt,
    );
    expect(emailService.sendBookingUpdate).not.toHaveBeenCalled();
  });

  it('respects the New messages email setting', async () => {
    repository.findUnreadSentBetween.mockResolvedValue([
      message(
        person('bola', {
          settings: {
            notificationPreferences: { messages: { email: false } },
          },
        }),
      ),
    ]);

    expect(await service.sendDue(from, to)).toBe(0);
    expect(emailService.sendBookingUpdate).not.toHaveBeenCalled();
  });

  it("doesn't email suspended people", async () => {
    repository.findUnreadSentBetween.mockResolvedValue([
      message(person('bola', { suspendedAt: new Date() })),
    ]);

    expect(await service.sendDue(from, to)).toBe(0);
  });

  it('carries on when one email fails', async () => {
    emailService.sendBookingUpdate.mockRejectedValue(new Error('down'));
    jest.spyOn(service['logger'], 'error').mockImplementation(() => undefined);

    expect(await service.sendDue(from, to)).toBe(0);
  });
});
