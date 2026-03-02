const express = require('express');
const router = express.Router();
const {
  getRooms,
  getFeaturedRooms,
  getRoom,
  createRoom
} = require('../controllers/roomController');

router.get('/', getRooms);
router.get('/featured', getFeaturedRooms);
router.get('/:id', getRoom);
router.post('/', createRoom);

module.exports = router;
