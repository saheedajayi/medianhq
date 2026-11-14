import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SessionsService } from '../../../../../src/modules/scheduling/sessions/sessions.service';

describe('SessionsService.stats', () => {
  const user = { id: 'mentor-1', role: 'MENTOR' } as never;
  const setup = (session: unknown) => {
    const repository = {
      findMentorSession: jest.fn().mockResolvedValue(session),
      findSessionBookings: jest.fn().mockResolvedValue([
        { id: 'a', status: 'COMPLETED' },
        { id: 'b', status: 'COMPLETED' },
        { id: 'c', status: 'PENDING_CONFIRMATION' },
        { id: 'd', status: 'CANCELLED' },
      ]),
      sumEarnings: jest
        .fn()
        .mockResolvedValue({ _sum: { amount: 9000 }, _count: 2 }),
    };
    return { repository, service: new SessionsService(repository as never) };
  };

  it('counts bookings by status and totals net earnings', async () => {
    const { service } = setup({ id: 's1' });

    await expect(service.stats(user, 's1')).resolves.toEqual({
      totalBookings: 4,
      completed: 2,
      pending: 1,
      earnings: 9000,
      paidSessions: 2,
      currency: 'NGN',
    });
  });

  it('only totals that mentor and session', async () => {
    const { repository, service } = setup({ id: 's1' });
    await service.stats(user, 's1');

    expect(repository.findMentorSession).toHaveBeenCalledWith('mentor-1', 's1');
    expect(repository.findSessionBookings).toHaveBeenCalledWith('s1');
    expect(repository.sumEarnings).toHaveBeenCalledWith('mentor-1', [
      'a',
      'b',
      'c',
      'd',
    ]);
  });

  it("refuses another mentor's session", async () => {
    const { service } = setup(null);
    await expect(service.stats(user, 'other')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('shows zero earnings when there are none', async () => {
    const { repository, service } = setup({ id: 's1' });
    repository.sumEarnings.mockResolvedValue({
      _sum: { amount: null },
      _count: 0,
    });

    await expect(service.stats(user, 's1')).resolves.toMatchObject({
      earnings: 0,
      paidSessions: 0,
    });
  });
});

describe('SessionsService approval rule', () => {
  const dto = {
    title: 'CV review',
    description: 'Review',
    durationMinutes: 30,
  };
  const setup = () => {
    const repository = {
      createSession: jest.fn().mockResolvedValue({ id: 's1' }),
      updateSession: jest.fn().mockResolvedValue({ id: 's1' }),
      findMentorSession: jest
        .fn()
        .mockResolvedValue({ id: 's1', price: 0, currency: 'NGN' }),
    };
    return { repository, service: new SessionsService(repository as never) };
  };
  const mentor = (mentorStatus: string) =>
    ({ id: 'm1', role: 'MENTOR', mentorStatus }) as never;

  it.each(['PENDING_REVIEW', 'REJECTED', 'DRAFT', undefined])(
    'refuses to create a session when the application is %s',
    async (status) => {
      const { repository, service } = setup();

      await expect(
        service.create(mentor(status as string), dto),
      ).rejects.toThrow(ForbiddenException);
      expect(repository.createSession).not.toHaveBeenCalled();
    },
  );

  it('lets an approved mentor create a session', async () => {
    const { repository, service } = setup();
    await service.create(mentor('APPROVED'), dto);

    expect(repository.createSession).toHaveBeenCalled();
  });

  it('refuses to put a session live before approval', async () => {
    const { repository, service } = setup();

    await expect(
      service.update(mentor('PENDING_REVIEW'), 's1', { isLive: true }),
    ).rejects.toThrow(ForbiddenException);
    expect(repository.updateSession).not.toHaveBeenCalled();
  });

  it('still lets an unapproved mentor take a session offline', async () => {
    const { repository, service } = setup();
    await service.update(mentor('PENDING_REVIEW'), 's1', { isLive: false });

    expect(repository.updateSession).toHaveBeenCalled();
  });
});
