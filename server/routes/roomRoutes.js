const express = require('express');
const router = express.Router();
const {
  getRooms,
  getFeaturedRooms,
  getRoom,
  getRoomAvailability,
  createRoom,
  updateRoom,
  deleteRoom
} = require('../controllers/roomController');
const { protect, restrictTo } = require('../middlewares/auth');

// Public read routes
router.get('/', getRooms);
router.get('/featured', getFeaturedRooms);
router.get('/:id/availability', getRoomAvailability);
router.get('/:id', getRoom);

// Inventory writes are admin-only
router.post('/', protect, restrictTo('admin'), createRoom);
router.put('/:id', protect, restrictTo('admin'), updateRoom);
router.delete('/:id', protect, restrictTo('admin'), deleteRoom);

module.exports = router;
