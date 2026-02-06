const Book = require("../models/book");

const checkBooking = async (req, res, next) => {
  const { room, startDate, endDate } = req.body;

  try {
    const isBooked = await Book.findOne({
      room,
      $or: [
        {
          startDate: { $lt: endDate },
          endDate: { $gt: startDate }
        }
      ]
    });

    if (isBooked) {
      return res.status(400).json({
        message: "Room already booked for this date"
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      message: "Booking check failed",
      error: error.message
    });
  }
};

module.exports = checkBooking;
