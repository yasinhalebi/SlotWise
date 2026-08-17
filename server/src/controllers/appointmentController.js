const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const User = require('../models/User');
const { getAvailableSlots, isSlotAvailable } = require('../utils/availableSlots');
const {
  dayOfWeekFromDateString,
  dateStringToUTCMidnight,
  todayDateStringUTC,
  nowMinutesUTC,
  timeToMinutes,
  minutesToTime,
} = require('../utils/timeUtils');

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const VALID_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];

async function fetchBookedAppointments(ownerId, dateStr) {
  const dayStart = dateStringToUTCMidnight(dateStr);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  return Appointment.find({
    owner: ownerId,
    date: { $gte: dayStart, $lt: dayEnd },
    status: { $ne: 'cancelled' },
  }).select('startTime endTime');
}

async function availableSlotsHandler(req, res) {
  const { businessSlug, date, serviceId } = req.query;

  if (!businessSlug || !date || !serviceId || !DATE_REGEX.test(date)) {
    return res.status(400).json({ message: 'businessSlug, date (YYYY-MM-DD) and serviceId are required' });
  }

  const owner = await User.findOne({ businessSlug });
  if (!owner) return res.status(404).json({ message: 'Business not found' });

  const service = await Service.findOne({ _id: serviceId, owner: owner._id, isActive: true });
  if (!service) return res.status(404).json({ message: 'Service not found' });

  const workingHours = owner.workingHours[dayOfWeekFromDateString(date)];
  const bookedAppointments = await fetchBookedAppointments(owner._id, date);
  const isToday = date === todayDateStringUTC();

  const slots = getAvailableSlots({
    workingHours,
    duration: service.duration,
    bookedAppointments,
    nowMinutes: isToday ? nowMinutesUTC() : null,
  });

  res.json({
    date,
    service: { id: service._id, name: service.name, duration: service.duration },
    slots,
  });
}

async function createAppointment(req, res) {
  const { businessSlug, serviceId, date, startTime, customerName, customerPhone, customerEmail, notes } = req.body;

  if (!businessSlug || !serviceId || !date || !startTime || !customerName || !customerPhone) {
    return res.status(400).json({
      message: 'businessSlug, serviceId, date, startTime, customerName and customerPhone are required',
    });
  }
  if (!DATE_REGEX.test(date)) {
    return res.status(400).json({ message: 'date must be in YYYY-MM-DD format' });
  }

  const owner = await User.findOne({ businessSlug });
  if (!owner) return res.status(404).json({ message: 'Business not found' });

  const service = await Service.findOne({ _id: serviceId, owner: owner._id, isActive: true });
  if (!service) return res.status(404).json({ message: 'Service not found' });

  const workingHours = owner.workingHours[dayOfWeekFromDateString(date)];
  const bookedAppointments = await fetchBookedAppointments(owner._id, date);

  const available = isSlotAvailable({
    workingHours,
    duration: service.duration,
    bookedAppointments,
    startTime,
  });

  if (!available) {
    return res.status(409).json({ message: 'This time slot is no longer available' });
  }

  const endTime = minutesToTime(timeToMinutes(startTime) + service.duration);

  const appointment = await Appointment.create({
    owner: owner._id,
    service: service._id,
    customerName,
    customerPhone,
    customerEmail,
    date: dateStringToUTCMidnight(date),
    startTime,
    endTime,
    notes,
    status: 'pending',
  });

  res.status(201).json({ appointment });
}

async function getMyAppointments(req, res) {
  const { date, from, to } = req.query;
  const filter = { owner: req.user._id };

  if (date && DATE_REGEX.test(date)) {
    const dayStart = dateStringToUTCMidnight(date);
    filter.date = { $gte: dayStart, $lt: new Date(dayStart.getTime() + 24 * 60 * 60 * 1000) };
  } else if (from && to && DATE_REGEX.test(from) && DATE_REGEX.test(to)) {
    const fromDate = dateStringToUTCMidnight(from);
    const toDate = new Date(dateStringToUTCMidnight(to).getTime() + 24 * 60 * 60 * 1000);
    filter.date = { $gte: fromDate, $lt: toDate };
  }

  const appointments = await Appointment.find(filter)
    .populate('service', 'name duration price')
    .sort({ date: 1, startTime: 1 });

  res.json({ appointments });
}

async function updateStatus(req, res) {
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ message: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  const appointment = await Appointment.findOne({ _id: req.params.id, owner: req.user._id });
  if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

  appointment.status = status;
  await appointment.save();
  res.json({ appointment });
}

async function deleteAppointment(req, res) {
  const appointment = await Appointment.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
  res.json({ message: 'Appointment deleted' });
}

module.exports = {
  availableSlotsHandler,
  createAppointment,
  getMyAppointments,
  updateStatus,
  deleteAppointment,
};
