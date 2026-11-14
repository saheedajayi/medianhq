import { BadRequestException } from '@nestjs/common';
import { OnboardingEmailsService } from '../../../../../src/modules/platform/onboarding-emails/onboarding-emails.service';
import { signUnsubscribeToken } from '../../../../../src/modules/platform/email/unsubscribe-token';

const DAY_MS = 24 * 60 * 60 * 1000;

describe('OnboardingEmailsService', () => {
  let repository: Record<string, jest.Mock>;
  let emailService: { sendLetter: jest.Mock };
  let service: OnboardingEmailsService;
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env, EMAIL_LINK_SECRET: 'secret' };
    jest.useFakeTimers({ doNotFake: ['Date'] });
    repository = {
      findMentorsApprovedBetween: jest.fn().mockResolvedValue([]),
      findMenteesJoinedBetween: jest.fn().mockResolvedValue([]),
      findSettings: jest.fn().mockResolvedValue(null),
      saveNotificationPreferences: jest.fn().mockResolvedValue({}),
      userExists: jest.fn().mockResolvedValue(1),
    };
    emailService = { sendLetter: jest.fn().mockResolvedValue(undefined) };
    service = new OnboardingEmailsService(
      repository as never,
      emailService as never,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
    process.env = env;
  });

  /** sendDue waits between emails, so the timers are run alongside it */
  const run = async (from: Date, to: Date) => {
    const promise = service.sendDue(from, to);
    await jest.runAllTimersAsync();
    return promise;
  };

  it('looks for mentors approved 1–5 days ago and mentees who joined 0–4 days ago', async () => {
    const to = new Date('2026-11-14T12:00:00Z');
    const from = new Date(to.getTime() - 30 * 60 * 1000);
    await run(from, to);

    const mentorWindows = repository.findMentorsApprovedBetween.mock.calls.map(
      ([start, end]: [Date, Date]) => [
        to.getTime() - end.getTime(),
        end.getTime() - start.getTime(),
      ],
    );
    expect(mentorWindows).toEqual(
      [1, 2, 3, 4, 5].map((day) => [day * DAY_MS, 30 * 60 * 1000]),
    );
    const menteeOffsets = repository.findMenteesJoinedBetween.mock.calls.map(
      ([, end]: [Date, Date]) => to.getTime() - end.getTime(),
    );
    expect(menteeOffsets).toEqual([0, 1, 2, 3, 4].map((day) => day * DAY_MS));
  });

  it('sends the step with a key per day and person, and an unsubscribe link', async () => {
    repository.findMenteesJoinedBetween.mockImplementation(
      (_from: Date, to: Date) =>
        Promise.resolve(
          to.getTime() > Date.now() - DAY_MS
            ? [
                {
                  id: 'u1',
                  email: 'a@x.co',
                  firstName: 'Aisha',
                  settings: null,
                },
              ]
            : [],
        ),
    );
    const sent = await run(new Date(Date.now() - 1000), new Date());

    expect(sent).toBe(1);
    expect(emailService.sendLetter).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'a@x.co',
        idempotencyKey: 'onboarding:mentee:day1:u1',
        unsubscribeUserId: 'u1',
      }),
    );
  });

  it('skips people who turned tips off', async () => {
    repository.findMentorsApprovedBetween.mockResolvedValue([
      {
        id: 'u1',
        email: 'a@x.co',
        firstName: 'Jola',
        settings: { notificationPreferences: { tips: { email: false } } },
      },
    ]);
    const sent = await run(new Date(Date.now() - 1000), new Date());
    expect(sent).toBe(0);
    expect(emailService.sendLetter).not.toHaveBeenCalled();
  });

  it('keeps going when one email fails', async () => {
    repository.findMentorsApprovedBetween.mockResolvedValueOnce([
      { id: 'u1', email: 'a@x.co', firstName: 'A', settings: null },
      { id: 'u2', email: 'b@x.co', firstName: 'B', settings: null },
    ]);
    emailService.sendLetter.mockRejectedValueOnce(new Error('down'));
    const sent = await run(new Date(Date.now() - 1000), new Date());
    expect(sent).toBe(1);
  });

  it('unsubscribes with a valid link and keeps other preferences', async () => {
    repository.findSettings.mockResolvedValue({
      notificationPreferences: { messages: { email: false } },
    });
    await service.unsubscribe('u1', signUnsubscribeToken('u1'));
    expect(repository.saveNotificationPreferences).toHaveBeenCalledWith('u1', {
      messages: { email: false },
      tips: { email: false },
    });
  });

  it('refuses a link signed for someone else', async () => {
    await expect(
      service.unsubscribe('u2', signUnsubscribeToken('u1')),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.saveNotificationPreferences).not.toHaveBeenCalled();
  });
});
