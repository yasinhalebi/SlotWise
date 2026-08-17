const { getAvailableSlots, isSlotAvailable } = require('../utils/availableSlots');

describe('getAvailableSlots', () => {
  const workingHours = { start: '09:00', end: '12:00', isOpen: true };

  test('returns all slots at 15-min interval when no bookings exist', () => {
    const slots = getAvailableSlots({ workingHours, duration: 30, bookedAppointments: [] });
    expect(slots[0]).toEqual({ startTime: '09:00', endTime: '09:30' });
    expect(slots[slots.length - 1]).toEqual({ startTime: '11:30', endTime: '12:00' });
    expect(slots).toHaveLength(11);
  });

  test('excludes slots that overlap an existing booking', () => {
    const slots = getAvailableSlots({
      workingHours,
      duration: 30,
      bookedAppointments: [{ startTime: '10:00', endTime: '10:30' }],
    });
    const overlapping = slots.filter((s) => ['09:45', '10:00', '10:15'].includes(s.startTime));
    expect(overlapping).toHaveLength(0);
    expect(slots).toContainEqual({ startTime: '09:30', endTime: '10:00' });
    expect(slots).toContainEqual({ startTime: '10:30', endTime: '11:00' });
  });

  test('back-to-back bookings do not create a false overlap at the boundary', () => {
    const slots = getAvailableSlots({
      workingHours,
      duration: 30,
      bookedAppointments: [{ startTime: '09:00', endTime: '09:30' }],
    });
    expect(slots).toContainEqual({ startTime: '09:30', endTime: '10:00' });
  });

  test('returns empty array when the business is closed that day', () => {
    const slots = getAvailableSlots({
      workingHours: { ...workingHours, isOpen: false },
      duration: 30,
      bookedAppointments: [],
    });
    expect(slots).toEqual([]);
  });

  test('does not return a slot that would run past closing time', () => {
    const slots = getAvailableSlots({
      workingHours: { start: '09:00', end: '09:40', isOpen: true },
      duration: 30,
      bookedAppointments: [],
    });
    expect(slots).toEqual([{ startTime: '09:00', endTime: '09:30' }]);
  });

  test('filters out past slots for the current day when nowMinutes is given', () => {
    const slots = getAvailableSlots({
      workingHours,
      duration: 30,
      bookedAppointments: [],
      nowMinutes: 10 * 60, // 10:00
    });
    expect(slots[0].startTime).toBe('10:15');
    expect(slots.every((s) => s.startTime > '10:00')).toBe(true);
  });
});

describe('isSlotAvailable', () => {
  const workingHours = { start: '09:00', end: '12:00', isOpen: true };

  test('rejects a slot that overlaps an existing booking', () => {
    const result = isSlotAvailable({
      workingHours,
      duration: 30,
      bookedAppointments: [{ startTime: '10:00', endTime: '10:30' }],
      startTime: '10:15',
    });
    expect(result).toBe(false);
  });

  test('accepts a slot that does not overlap', () => {
    const result = isSlotAvailable({
      workingHours,
      duration: 30,
      bookedAppointments: [{ startTime: '10:00', endTime: '10:30' }],
      startTime: '10:30',
    });
    expect(result).toBe(true);
  });

  test('rejects a slot that starts before opening time', () => {
    expect(
      isSlotAvailable({ workingHours, duration: 30, bookedAppointments: [], startTime: '08:45' })
    ).toBe(false);
  });

  test('rejects a slot that would end after closing time', () => {
    expect(
      isSlotAvailable({ workingHours, duration: 30, bookedAppointments: [], startTime: '11:45' })
    ).toBe(false);
  });

  test('rejects when the business is closed that day', () => {
    expect(
      isSlotAvailable({
        workingHours: { ...workingHours, isOpen: false },
        duration: 30,
        bookedAppointments: [],
        startTime: '10:00',
      })
    ).toBe(false);
  });
});
