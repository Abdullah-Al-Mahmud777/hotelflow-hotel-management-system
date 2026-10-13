const express = require('express');
const router = express.Router();
const { getHotels, getHotel } = require('../controllers/hotelController');

// Public hotel directory (bookings stay behind auth in bookingRoutes).
router.get('/', getHotels);
router.get('/:id', getHotel);

module.exports = router;
