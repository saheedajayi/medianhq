import {
  buildTimeBuckets,
  growthPct,
} from '../../../../../src/modules/admin/common/time-buckets';

describe('buildTimeBuckets', () => {
  // 10:42 in Lagos on Wednesday 7 October 2026
  const now = new Date('2026-10-07T09:42:00.000Z');
  const labels = (period: Parameters<typeof buildTimeBuckets>[0]) =>
    buildTimeBuckets(period, now).map((bucket) => bucket.label);

  it('covers the last seven Lagos days, plus one before to compare against', () => {
    const buckets = buildTimeBuckets('daily', now);

    expect(labels('daily')).toEqual([
      'Sep 30',
      'Oct 1',
      'Oct 2',
      'Oct 3',
      'Oct 4',
      'Oct 5',
      'Oct 6',
      'Oct 7',
    ]);
    // A Lagos day starts at 23:00 UTC the day before
    expect(buckets.at(-1)).toMatchObject({
      from: new Date('2026-10-06T23:00:00.000Z'),
      to: new Date('2026-10-07T23:00:00.000Z'),
    });
  });

  it('labels weeks, months, quarters and years as the charts show them', () => {
    expect(labels('weekly').slice(1)).toEqual([
      'Wk1',
      'Wk2',
      'Wk3',
      'Wk4',
      'Wk5',
      'Wk6',
      'Wk7',
    ]);
    expect(labels('monthly').slice(1)).toEqual([
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
    ]);
    expect(labels('quarterly').slice(1)).toEqual(['Jan', 'Apr', 'Jul', 'Oct']);
    expect(labels('annually').slice(1)).toEqual([
      '2023',
      '2024',
      '2025',
      '2026',
    ]);
  });

  it('leaves no gap between one bucket and the next', () => {
    for (const period of [
      'daily',
      'weekly',
      'monthly',
      'quarterly',
      'annually',
    ] as const) {
      const buckets = buildTimeBuckets(period, now);
      buckets.slice(1).forEach((bucket, index) => {
        expect(bucket.from).toEqual(buckets[index].to);
      });
      // The last bucket is the one that contains now
      expect(buckets.at(-1)!.from <= now && now < buckets.at(-1)!.to).toBe(
        true,
      );
    }
  });

  it('has no growth figure without something to compare with', () => {
    expect(growthPct(150, 100)).toBe(50);
    expect(growthPct(50, 100)).toBe(-50);
    expect(growthPct(150, 0)).toBeNull();
  });
});
