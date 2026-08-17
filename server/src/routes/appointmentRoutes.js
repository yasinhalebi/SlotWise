const express = require('express');
const {
  availableSlotsHandler,
  createAppointment,
  getMyAppointments,
  updateStatus,
  deleteAppointment,
} = require('../controllers/appointmentController');
const protect = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/available-slots', asyncHandler(availableSlotsHandler));
router.post('/', asyncHandler(createAppointment));

router.get('/', protect, asyncHandler(getMyAppointments));
router.put('/:id/status', protect, asyncHandler(updateStatus));
router.delete('/:id', protect, asyncHandler(deleteAppointment));

module.exports = router;
