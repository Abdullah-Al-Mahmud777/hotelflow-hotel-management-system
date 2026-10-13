const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getMyBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus,
  deleteBooking
} = require('../controllers/bookingController');
const { protect, restrictTo } = require('../middlewares/auth');

// NOTE: "/my" must be registered BEFORE "/:id" or "my" matches :id.
// - Booking requires login (JWT); the owner always comes from the token.
// - Reading/updating one booking is owner-or-admin; listing, status changes
//   and deletes are admin-only.
router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.patch('/:id/cancel', protect, cancelBooking);
router.get('/', protect, restrictTo('admin'), getBookings);
router.put('/:id/status', protect, restrictTo('admin'), updateBookingStatus);
router.delete('/:id', protect, restrictTo('admin'), deleteBooking);

module.exports = router;
