const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBooking,
  updateBookingStatus,
  deleteBooking
} = require('../controllers/bookingController');
const { optionalAuth } = require('../middlewares/auth');

// Use optional auth for booking creation - links to user if logged in
router.post('/', optionalAuth, createBooking);
router.get('/', getBookings);
router.get('/:id', getBooking);
router.put('/:id/status', updateBookingStatus);
router.delete('/:id', deleteBooking);

module.exports = router;
