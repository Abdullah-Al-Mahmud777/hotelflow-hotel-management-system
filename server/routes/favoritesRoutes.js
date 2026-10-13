const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { protect } = require('../middlewares/auth');

router.get('/', protect, wishlistController.listFavorites);
router.post('/', protect, wishlistController.addFavorite);
router.delete('/:roomId', protect, wishlistController.removeFavorite);

module.exports = router;
