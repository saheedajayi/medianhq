import { BackofficeWaitlistService } from '../../../../../src/modules/backoffice/waitlist/backoffice-waitlist.service';

describe('BackofficeWaitlistService', () => {
  it('pages the entries and totals them by audience', async () => {
    const repository = {
      count: jest.fn().mockResolvedValue(45),
      countByAudience: jest.fn().mockResolvedValue([
        { audience: 'MENTEE', _count: { _all: 30 } },
        { audience: 'MENTOR', _count: { _all: 15 } },
      ]),
      findLatest: jest
        .fn()
        .mockResolvedValue({ createdAt: new Date('2026-11-14T10:00:00Z') }),
      findMany: jest.fn().mockResolvedValue([]),
    };
    const service = new BackofficeWaitlistService(repository as never);

    const dashboard = await service.getDashboard({ page: '9', limit: '20' });

    // Page 9 doesn't exist, so the last page is shown
    expect(repository.findMany).toHaveBeenCalledWith({ skip: 40, take: 20 });
    expect(dashboard.summary).toMatchObject({
      total: 45,
      mentees: 30,
      mentors: 15,
    });
    expect(dashboard.pagination).toMatchObject({ page: 3, totalPages: 3 });
  });
});
