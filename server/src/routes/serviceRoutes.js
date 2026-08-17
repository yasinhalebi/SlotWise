const express = require('express');
const {
  getMyServices,
  createService,
  updateService,
  deleteService,
  getPublicServices,
} = require('../controllers/serviceController');
const protect = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/public/:businessSlug', asyncHandler(getPublicServices));

router.get('/', protect, asyncHandler(getMyServices));
router.post('/', protect, asyncHandler(createService));
router.put('/:id', protect, asyncHandler(updateService));
router.delete('/:id', protect, asyncHandler(deleteService));

module.exports = router;
