const { timeToMinutes, minutesToTime } = require('./timeUtils');

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

// Pure function: computes free slots for one day given working hours,
// service duration, and already-booked ranges. No DB/Express involved,
// so it can be unit tested directly.
function getAvailableSlots({ workingHours, duration, bookedAppointments = [], interval = 15, nowMinutes = null }) {
  if (!workingHours || !workingHours.isOpen) return [];
  if (!duration || duration <= 0) return [];

  const dayStart = timeToMinutes(workingHours.start);
  const dayEnd = timeToMinutes(workingHours.end);

  const booked = bookedAppointments.map((a) => ({
    start: timeToMinutes(a.startTime),
    end: timeToMinutes(a.endTime),
  }));

  const slots = [];
  for (let slotStart = dayStart; slotStart + duration <= dayEnd; slotStart += interval) {
    if (nowMinutes !== null && slotStart <= nowMinutes) continue;

    const slotEnd = slotStart + duration;
    const isBooked = booked.some((b) => overlaps(slotStart, slotEnd, b.start, b.end));

    if (!isBooked) {
      slots.push({ startTime: minutesToTime(slotStart), endTime: minutesToTime(slotEnd) });
    }
  }

  return slots;
}

// Re-validates a single requested startTime server-side (used when actually
// creating a booking) so a race condition or a direct API call can't bypass
// the slots the client was shown.
function isSlotAvailable({ workingHours, duration, bookedAppointments = [], startTime }) {
  if (!workingHours || !workingHours.isOpen) return false;
  if (!duration || duration <= 0) return false;

  const dayStart = timeToMinutes(workingHours.start);
  const dayEnd = timeToMinutes(workingHours.end);
  const slotStart = timeToMinutes(startTime);
  const slotEnd = slotStart + duration;

  if (slotStart < dayStart || slotEnd > dayEnd) return false;

  const booked = bookedAppointments.map((a) => ({
    start: timeToMinutes(a.startTime),
    end: timeToMinutes(a.endTime),
  }));

  return !booked.some((b) => overlaps(slotStart, slotEnd, b.start, b.end));
}

module.exports = { getAvailableSlots, isSlotAvailable, overlaps };
