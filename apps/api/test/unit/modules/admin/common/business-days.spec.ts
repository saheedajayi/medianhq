import {
  addBusinessDays,
  businessDaysBetween,
} from '../../../../../src/modules/admin/common/business-days';

describe('business days', () => {
  // Thursday 1 October 2026, 14:22 in Lagos
  const submitted = new Date('2026-10-01T13:22:00.000Z');

  it('skips the weekend when counting an application age', () => {
    // Wednesday 7 October: Fri, Mon, Tue, Wed
    expect(
      businessDaysBetween(submitted, new Date('2026-10-07T09:00:00.000Z')),
    ).toBe(4);
  });

  it('is zero on the day of submission and over a weekend', () => {
    expect(businessDaysBetween(submitted, submitted)).toBe(0);
    const friday = new Date('2026-10-02T20:00:00.000Z');
    expect(
      businessDaysBetween(friday, new Date('2026-10-04T20:00:00.000Z')),
    ).toBe(0);
  });

  it('sets the review target five weekdays later', () => {
    expect(addBusinessDays(submitted, 5).toISOString()).toBe(
      '2026-10-08T13:22:00.000Z',
    );
  });
});
