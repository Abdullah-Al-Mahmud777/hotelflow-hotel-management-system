const Book = require("../models/book");

/**
 * @desc    Create a new booking
 * @route   POST /api/books
 * @access  Private
 */
const createBooking = async (req, res, next) => {
  try {
    const { room, startDate, endDate } = req.body;

    if (!room || !startDate || !endDate) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        message: "End date must be greater than start date"
      });
    }

    const booking = await Book.create({
      user: req.user.id, // auth middleware থেকে আসছে
      room,
      startDate,
      endDate
    }); 

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings
 * @route   GET /api/books
 * @access  Admin / Private
 */
const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Book.find()
      .populate("user", "name email")
      .populate("room", "roomNumber price");

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in user's bookings
 * @route   GET /api/books/my
 * @access  Private
 */
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Book.find({ user: req.user.id })
      .populate("room", "roomNumber price");

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel booking
 * @route   DELETE /api/books/:id
 * @access  Private
 */
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Book.findById(req.params.id);

    if (!booking) { 
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    // user only can delete his own booking
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized to cancel this booking"
      });
    }

    await booking.deleteOne();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getMyBookings,
  cancelBooking
};
