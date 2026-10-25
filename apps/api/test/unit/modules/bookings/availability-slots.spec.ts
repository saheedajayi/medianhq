import {
  buildAvailableDays,
  parseTimeOfDay,
} from '../../../../src/modules/bookings/availability-slots';

describe('availability slots', () => {
  describe('parseTimeOfDay', () => {
    it.each([
      ['9:00 AM', 540],
      ['2:00 pm', 840],
      ['12:00 PM', 720],
      ['12:30 am', 30],
      ['14:30', 870],
    ])('reads %s', (input, minutes) => {
      expect(parseTimeOfDay(input)).toBe(minutes);
    });

    it('rejects nonsense', () => {
      expect(parseTimeOfDay('noon')).toBeNull();
      expect(parseTimeOfDay('25:00')).toBeNull();
    });
  });

  describe('buildAvailableDays', () => {
    // Monday 26 Oct 2026, 06:00 WAT
    const from = new Date('2026-10-26T05:00:00Z');
    const mondayWindow = {
      dayOfWeek: 1,
      startTime: '9:00 AM',
      endTime: '11:00 AM',
      isActive: true,
    };

    it('turns a WAT window into UTC slots every 30 minutes', () => {
      const [monday] = buildAvailableDays({
        windows: [mondayWindow],
        busy: [],
        durationMinutes: 30,
        from,
        days: 1,
        earliestStart: from,
      });
      expect(monday.date).toBe('2026-10-26');
      expect(monday.slots).toEqual([
        '2026-10-26T08:00:00.000Z',
        '2026-10-26T08:30:00.000Z',
        '2026-10-26T09:00:00.000Z',
        '2026-10-26T09:30:00.000Z',
      ]);
    });

    it('only offers starts where the whole session fits', () => {
      const [monday] = buildAvailableDays({
        windows: [mondayWindow],
        busy: [],
        durationMinutes: 60,
        from,
        days: 1,
        earliestStart: from,
      });
      expect(monday.slots).toHaveLength(3);
      expect(monday.slots.at(-1)).toBe('2026-10-26T09:00:00.000Z');
    });

    it('skips slots that overlap a booking or are too soon', () => {
      const [monday] = buildAvailableDays({
        windows: [mondayWindow],
        busy: [
          {
            startsAt: new Date('2026-10-26T08:30:00Z'),
            endsAt: new Date('2026-10-26T09:00:00Z'),
          },
        ],
        durationMinutes: 30,
        from,
        days: 1,
        earliestStart: new Date('2026-10-26T08:15:00Z'),
      });
      expect(monday.slots).toEqual([
        '2026-10-26T09:00:00.000Z',
        '2026-10-26T09:30:00.000Z',
      ]);
    });

    it('ignores inactive days', () => {
      const [monday] = buildAvailableDays({
        windows: [{ ...mondayWindow, isActive: false }],
        busy: [],
        durationMinutes: 30,
        from,
        days: 1,
        earliestStart: from,
      });
      expect(monday.slots).toEqual([]);
    });
  });
});
