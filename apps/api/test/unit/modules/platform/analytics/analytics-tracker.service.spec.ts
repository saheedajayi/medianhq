import { AnalyticsTrackerService } from '../../../../../src/modules/platform/analytics/analytics-tracker.service';
import { searchEventFor } from '../../../../../src/modules/platform/analytics/search-event';

const flush = () => new Promise((resolve) => setImmediate(resolve));

describe('AnalyticsTrackerService', () => {
  const setup = (user: { id: string } | null = null) => {
    const repository = { createEvent: jest.fn().mockResolvedValue({}) };
    const authService = {
      getCurrentUser: user
        ? jest.fn().mockResolvedValue(user)
        : jest.fn().mockRejectedValue(new Error('signed out')),
    };
    const tracker = new AnalyticsTrackerService(
      repository as never,
      authService as never,
    );
    return { repository, authService, tracker };
  };
  const request = (headers: Record<string, string>) => ({ headers }) as never;

  it('logs a signed-out visitor by their browser id', async () => {
    const { repository, tracker } = setup();

    tracker.track(request({ 'x-median-visitor': 'visitor-1234' }), {
      type: 'PAGE_VIEW',
      path: '/mentors?search=design',
    });
    await flush();

    expect(repository.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'PAGE_VIEW',
        userId: null,
        visitorId: 'visitor-1234',
        // The query string is dropped, so nothing typed into the URL is kept
        path: '/mentors',
      }),
    );
  });

  it('attaches the signed-in person and counts a repeated search once', async () => {
    const { repository, tracker } = setup({ id: 'mentee-1' });
    const signedIn = request({ cookie: 'median_session=token' });
    const event = { type: 'SEARCH' as const, query: ' Design ', filters: [] };

    tracker.track(signedIn, event);
    await flush();
    tracker.track(signedIn, event);
    await flush();

    expect(repository.createEvent).toHaveBeenCalledTimes(1);
    expect(repository.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'mentee-1', query: 'design' }),
    );
  });

  it('ignores requests it cannot attribute to anyone', async () => {
    const { repository, tracker } = setup();

    tracker.track(request({ 'x-median-visitor': 'bad id!' }), {
      type: 'PAGE_VIEW',
      path: '/',
    });
    await flush();

    expect(repository.createEvent).not.toHaveBeenCalled();
  });
});

describe('searchEventFor', () => {
  it('skips the plain explore page and later pages of results', () => {
    expect(
      searchEventFor({ category: 'All', priceType: 'all' }, 40),
    ).toBeNull();
    expect(searchEventFor({ search: 'design', page: '2' }, 40)).toBeNull();
  });

  it('names the filters a search used', () => {
    expect(
      searchEventFor(
        { search: 'design', priceType: 'free', location: 'Lagos' },
        3,
      ),
    ).toEqual({
      type: 'SEARCH',
      query: 'design',
      filters: ['Price', 'Location'],
      resultCount: 3,
    });
  });
});
