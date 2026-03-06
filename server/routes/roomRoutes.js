const express = require('express');
const router = express.Router();
const {
  getRooms,
  getFeaturedRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom
} = require('../controllers/roomController');

router.get('/', getRooms);
router.get('/featured', getFeaturedRooms);
router.get('/:id', getRoom);
router.post('/', createRoom);
router.put('/:id', updateRoom);
router.delete('/:id', deleteRoom);

module.exports = router;
