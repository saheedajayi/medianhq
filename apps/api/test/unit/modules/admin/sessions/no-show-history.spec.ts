import {
  buildNoShowHistories,
  noShowRisk,
  noShowStatus,
} from '../../../../../src/modules/admin/sessions/no-show-history';

describe('buildNoShowHistories', () => {
  const day = (date: number) =>
    new Date(`2026-10-${String(date).padStart(2, '0')}T09:00:00.000Z`);
  const session = (mentorId: string, date: number, mentorMissed: boolean) => ({
    mentorId,
    startsAt: day(date),
    mentorMissed,
  });

  // Newest first, as the repository returns them
  const sessions = [
    session('streak', 7, true),
    session('streak', 6, true),
    session('recovered', 6, false),
    session('streak', 3, false),
    session('recovered', 2, true),
    session('streak', 1, true),
  ];

  it('counts misses in a row back from the latest session only', () => {
    const { get } = buildNoShowHistories(sessions, day(1));

    expect(get('streak')).toEqual({
      recentMisses: 3,
      consecutiveMisses: 2,
      lastMissAt: day(7),
    });
    // Turned up to their latest session, so the earlier miss is not a streak
    expect(get('recovered').consecutiveMisses).toBe(0);
    expect(get('recovered').lastMissAt).toEqual(day(2));
  });

  it('only counts recent misses from the cutoff', () => {
    const { get } = buildNoShowHistories(sessions, day(5));

    expect(get('streak').recentMisses).toBe(2);
    expect(get('recovered').recentMisses).toBe(0);
  });

  it('has a clean record for a mentor with no sessions', () => {
    const { get } = buildNoShowHistories(sessions, day(1));

    expect(get('unknown')).toEqual({
      recentMisses: 0,
      consecutiveMisses: 0,
      lastMissAt: null,
    });
  });

  it('flags two in a row and warns at one', () => {
    expect([0, 1, 2, 3].map(noShowStatus)).toEqual([
      'CLEAR',
      'WARNING',
      'ALERT',
      'ALERT',
    ]);
    expect([0, 1, 2].map(noShowRisk)).toEqual(['LOW', 'MEDIUM', 'HIGH']);
  });
});
