const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins) {
  const h = Math.floor(mins / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

// Day-of-week and "today" are derived from UTC so they stay consistent with
// how `date` is stored (UTC midnight) — see dateStringToUTCMidnight below.
function dayOfWeekFromDateString(dateStr) {
  const utcDate = new Date(`${dateStr}T00:00:00.000Z`);
  return DAY_NAMES[utcDate.getUTCDay()];
}

function dateStringToUTCMidnight(dateStr) {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

function todayDateStringUTC() {
  return new Date().toISOString().slice(0, 10);
}

function nowMinutesUTC() {
  const now = new Date();
  return now.getUTCHours() * 60 + now.getUTCMinutes();
}

module.exports = {
  DAY_NAMES,
  timeToMinutes,
  minutesToTime,
  dayOfWeekFromDateString,
  dateStringToUTCMidnight,
  todayDateStringUTC,
  nowMinutesUTC,
};
