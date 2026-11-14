import { computeTrustScore } from '../../../../../src/modules/admin/users/trust-score';

describe('computeTrustScore', () => {
  const none = {
    ratingSum: 0,
    ratingCount: 0,
    attended: 0,
    missed: 0,
    responded: 0,
    expired: 0,
  };

  it('weights reviews 40%, attendance 35% and response rate 25%', () => {
    const trust = computeTrustScore({
      ratingSum: 48, // 4.8 average: 96
      ratingCount: 10,
      attended: 23, // 92
      missed: 2,
      responded: 47, // 94
      expired: 3,
    });

    // 96 * 0.4 + 92 * 0.35 + 94 * 0.25
    expect(trust).toMatchObject({ weighted: 94.1, score: 94, label: 'Strong' });
    expect(trust?.components.map((part) => part.value)).toEqual([96, 92, 94]);
  });

  it('has no score until there is a review or a booking', () => {
    expect(computeTrustScore(none)).toBeNull();
  });

  it('scales the remaining weights up when a part has nothing to measure', () => {
    const trust = computeTrustScore({ ...none, attended: 3, missed: 1 });

    expect(trust).toMatchObject({ score: 75, label: 'Good' });
    expect(trust?.components.map((part) => part.value)).toEqual([
      null,
      75,
      null,
    ]);
  });
});
