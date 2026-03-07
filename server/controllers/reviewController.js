const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Room = require('../models/Room');

// Create Review
exports.createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    // Check if booking exists and belongs to user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.guestEmail !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'You can only review your own bookings'
      });
    }

    // Check if booking is approved
    if (booking.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'You can only review approved bookings'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking'
      });
    }

    // Create review
    const review = await Review.create({
      room: booking.room,
      user: req.user.id,
      booking: bookingId,
      rating,
      comment
    });

    await review.populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message
    });
  }
};

// Get Reviews for a Room (only approved)
exports.getRoomReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ 
      room: req.params.roomId,
      status: 'approved' // Only show approved reviews publicly
    })
      .populate('user', 'name avatar')
      .sort('-createdAt');

    // Calculate average rating (only approved reviews)
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    res.status(200).json({
      success: true,
      count: reviews.length,
      avgRating: avgRating.toFixed(1),
      data: reviews
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reviews',
      error: error.message
    });
  }
};

// Get All Approved Reviews (for homepage)
exports.getAllApprovedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ 
      status: 'approved'
    })
      .populate('user', 'name avatar')
      .populate('room', 'name type')
      .sort('-createdAt')
      .limit(10); // Limit to 10 most recent reviews

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Get approved reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reviews',
      error: error.message
    });
  }
};

// Get User's Reviews (all statuses)
exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('room', 'name type image')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reviews',
      error: error.message
    });
  }
};

// Delete Review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns the review or is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
};
