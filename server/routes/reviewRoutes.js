const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middlewares/auth');

// Protected routes
router.post('/', protect, reviewController.createReview);
router.get('/my-reviews', protect, reviewController.getUserReviews);
router.delete('/:id', protect, reviewController.deleteReview);

// Public routes
router.get('/room/:roomId', reviewController.getRoomReviews);
router.get('/approved', reviewController.getAllApprovedReviews);

module.exports = router;
