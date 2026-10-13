const Booking = require('../models/Booking');
const Room = require('../models/Room');
const mongoose = require('mongoose');
const { validateStayDates, quotePrice, overlaps } = require('../utils/policies');
const { findActiveCoupon, checkCouponEligibility, applyCouponAtomic } = require('./couponService');

// Create booking (supports optional couponCode — validated + applied transactionally)
exports.createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { room, checkIn, checkOut, guestName, guestEmail, guestPhone, numberOfGuests, specialRequests, totalPrice, couponCode } = req.body;

    // Check if room exists
    const roomData = await Room.findById(room);
    if (!roomData) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Validate dates + capacity with shared policy helpers
    const v = validateStayDates(checkIn, checkOut);
    if (!v.ok) {
      return res.status(400).json({ success: false, message: v.message });
    }
    const checkInDate = v.checkIn;
    const checkOutDate = v.checkOut;

    const existingBooking = await Booking.findOne({
      room,
      status: { $in: ['pending', 'approved'] },
      ...overlaps(checkInDate, checkOutDate),
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available for selected dates. Please choose different dates.'
      });
    }

    const q = quotePrice(roomData.price, v.nights, numberOfGuests || 1, roomData.capacity);
    if (!q.ok) {
      return res.status(400).json({ success: false, message: q.message });
    }
    const baseTotal = totalPrice || q.total;

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
      totalPrice: baseTotal,
    };

    // Link to user if authenticated
    if (req.user) {
      bookingData.user = req.user.id;
    }

    // Optional coupon: validate + apply inside a transaction
    let coupon = null;
    let discount = 0;
    if (couponCode) {
      coupon = await findActiveCoupon(couponCode);
      const userId = req.user ? req.user.id : null;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Sign in to use a coupon code' });
      }
      const check = await checkCouponEligibility(coupon, userId, baseTotal);
      if (!check.ok) {
        return res.status(400).json({ success: false, message: check.message });
      }
      discount = check.discount;
      bookingData.couponCode = coupon.code;
      bookingData.discount = discount;
      bookingData.totalPrice = check.total;
    }

    let booking;
    if (coupon) {
      let createdId = null;
      await session.withTransaction(async () => {
        const [doc] = await Booking.create([bookingData], { session });
        createdId = doc._id;
        await applyCouponAtomic({ coupon, userId: req.user.id, bookingId: createdId, discount, session });
      });
      booking = await Booking.findById(createdId);
    } else {
      booking = await Booking.create(bookingData);
    }
    await booking.populate('room');

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    await session.abortTransaction().catch(() => {});
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Coupon was just used — please retry' });
    }
    res.status(400).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  } finally {
    await session.endSession();
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

    // Earn loyalty once per approved booking (idempotencyKey blocks duplicates)
    if (status === 'approved') {
      try {
        const LoyaltyTransaction = require('../models/LoyaltyTransaction');
        const { loyaltyEarned } = require('../utils/policies');
        const { notify } = require('../utils/notify');
        const pts = loyaltyEarned(booking.totalPrice);
        const ownerId = booking.user || null;
        if (ownerId && pts > 0) {
          await LoyaltyTransaction.create({
            user: ownerId, kind: 'earn', points: pts,
            ref: String(booking._id), idempotencyKey: `earn:${String(booking._id)}`,
          });
          await notify(ownerId, 'loyalty', `+${pts} loyalty points earned: ${booking.room?.name || 'your stay'}`);
        }
        if (ownerId) await notify(ownerId, 'booking-approved', `Booking approved: ${booking.room?.name || 'Room'}`);
      } catch (earnErr) {
        // Duplicate earn (11000) or notify failure must never fail approval
        if (earnErr.code !== 11000) console.error('[loyalty-earn]', earnErr.message);
      }
    }
    
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
