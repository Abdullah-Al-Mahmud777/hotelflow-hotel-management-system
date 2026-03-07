const Booking = require('../models/Booking');
const Room = require('../models/Room');

// Create booking
exports.createBooking = async (req, res) => {
  try {
    const { room, checkIn, checkOut, guestName, guestEmail, guestPhone, numberOfGuests, specialRequests, totalPrice } = req.body;
    
    // Check if room exists
    const roomData = await Room.findById(room);
    if (!roomData) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    // Check availability
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    const existingBooking = await Booking.findOne({
      room,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { checkIn: { $lte: checkOutDate }, checkOut: { $gte: checkInDate } }
      ]
    });
    
    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available for selected dates. Please choose different dates.'
      });
    }
    
    // Create booking data
    const bookingData = {
      room,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guestName,
      guestEmail,
      guestPhone,
      numberOfGuests: numberOfGuests || 1,
      specialRequests: specialRequests || '',
      totalPrice: totalPrice || (Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)) * roomData.price)
    };
    
    // Link to user if authenticated
    if (req.user) {
      bookingData.user = req.user.id;
    }
    
    const booking = await Booking.create(bookingData);
    await booking.populate('room');
    
    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
};

// Get all bookings
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('room').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
};

// Update booking status (admin)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, adminEmail } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    booking.status = status;
    
    if (status === 'approved') {
      booking.approvedBy = adminEmail || 'admin';
      booking.approvedAt = new Date();
    }
    
    await booking.save();
    await booking.populate('room');
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating booking status',
      error: error.message
    });
  }
};

// Get single booking
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
};

// Delete booking (admin)
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting booking',
      error: error.message
    });
  }
};
