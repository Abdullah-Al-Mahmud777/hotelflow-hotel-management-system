const Booking = require('../models/Booking');
const Room = require('../models/Room');
const mongoose = require('mongoose');

// Units of a room occupied by pending/approved bookings overlapping the
// given dates. Sums the per-booking `rooms` field (default 1), so inventory
// accounting stays correct when one booking takes several units.
async function bookedUnits(roomId, checkIn, checkOut, session = null) {
  let q = Booking.aggregate([
    {
      $match: {
        room: new mongoose.Types.ObjectId(roomId),
        status: { $in: ['pending', 'approved'] },
        checkIn: { $lte: new Date(checkOut) },
        checkOut: { $gte: new Date(checkIn) },
      },
    },
    { $group: { _id: null, used: { $sum: { $ifNull: ['$rooms', 1] } } } },
  ]);
  if (session) q = q.session(session);
  const rows = await q;
  return rows[0]?.used || 0;
}
exports.bookedUnits = bookedUnits;

const { validateStayDates, quotePrice, overlaps } = require('../utils/policies');
const { findActiveCoupon, checkCouponEligibility, applyCouponAtomic } = require('./couponService');

// Create booking (supports optional couponCode — validated + applied transactionally)
// Protected: only logged-in users can book; the owner is ALWAYS taken from
// the JWT (never the request body). Nights + total are computed on the
// SERVER — any client-supplied totalPrice is ignored. Overlap is checked
// twice (fast pre-check + atomic re-check inside the write transaction) so
// two concurrent requests cannot double-book the same dates.
exports.createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Please log in to book a room' });
    }
    const { room, checkIn, checkOut, guestName, guestEmail, guestPhone, numberOfGuests, specialRequests, couponCode, paymentMethod, arrivalTime } = req.body;
    const roomsQty = Math.max(1, Math.floor(Number(req.body.rooms) || 1));

    if (!room || !checkIn || !checkOut || !guestName || !guestEmail || !guestPhone) {
      return res.status(400).json({ success: false, message: 'Missing required booking fields' });
    }

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

    // Fast inventory pre-check (authoritative re-check happens inside the
    // write transaction). A room with totalRooms units can host that many
    // overlapping bookings; anything beyond is rejected.
    const totalUnits = roomData.totalRooms || 1;
    const usedUnits = await bookedUnits(room, checkInDate, checkOutDate);
    const remainingUnits = totalUnits - usedUnits;
    if (roomsQty > remainingUnits) {
      return res.status(400).json({
        success: false,
        message:
          remainingUnits <= 0
            ? 'This room is not available for the selected dates. Please choose different dates.'
            : `Only ${remainingUnits} room(s) left for these dates.`,
      });
    }

    // SERVER-computed total — the client's totalPrice is never trusted.
    const q = quotePrice(roomData.price, v.nights, numberOfGuests || 1, roomData.capacity);
    if (!q.ok) {
      return res.status(400).json({ success: false, message: q.message });
    }
    const serverTotal = q.total * roomsQty;

    // Create booking data (owner comes from the JWT, not the body)
    const bookingData = {
      room,
      user: req.user.id || req.user._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guestName,
      guestEmail,
      guestPhone,
      numberOfGuests: numberOfGuests || 1,
      rooms: roomsQty,
      specialRequests: specialRequests || '',
      totalPrice: serverTotal,
      paymentMethod: ['bKash', 'Nagad', 'Rocket', 'Card', 'Cash at hotel'].includes(paymentMethod)
        ? paymentMethod
        : 'Cash at hotel',
      arrivalTime: arrivalTime || '',
    };

    // Optional coupon: validate + apply inside a transaction
    let coupon = null;
    let discount = 0;
    if (couponCode) {
      coupon = await findActiveCoupon(couponCode);
      const check = await checkCouponEligibility(coupon, String(bookingData.user), serverTotal);
      if (!check.ok) {
        return res.status(400).json({ success: false, message: check.message });
      }
      discount = check.discount;
      bookingData.couponCode = coupon.code;
      bookingData.discount = discount;
      bookingData.totalPrice = check.total;
    }

    // Atomic write: re-check overlap + insert in one transaction so a race
    // between two concurrent requests cannot double-book. Falls back to a
    // direct write (with the same re-check) on standalone mongod servers
    // that do not support transactions.
    const writeOnce = async (sess) => {
      const raceUsed = await bookedUnits(room, checkInDate, checkOutDate, sess);
      if (roomsQty > totalUnits - raceUsed) {
        const left = totalUnits - raceUsed;
        const err = new Error(
          left <= 0
            ? 'This room is not available for the selected dates. Please choose different dates.'
            : `Only ${left} room(s) left for these dates.`
        );
        err.statusCode = 400;
        throw err;
      }
      let doc;
      if (coupon) {
        const [created] = await Booking.create([bookingData], { session: sess });
        await applyCouponAtomic({ coupon, userId: String(bookingData.user), bookingId: created._id, discount, session: sess });
        doc = created;
      } else if (sess) {
        const [created] = await Booking.create([bookingData], { session: sess });
        doc = created;
      } else {
        doc = await Booking.create(bookingData);
      }
      return doc;
    };

    let booking;
    try {
      let createdId = null;
      await session.withTransaction(async () => {
        const doc = await writeOnce(session);
        createdId = doc._id;
      });
      booking = await Booking.findById(createdId);
    } catch (txErr) {
      if (txErr.statusCode) throw txErr;
      if (/transaction|replica set|session/i.test(txErr.message || '')) {
        const doc = await writeOnce(null); // fallback: direct write
        booking = await Booking.findById(doc._id);
      } else {
        throw txErr;
      }
    }

    // Deterministic, unique reference derived from the ObjectId (no race).
    booking.bookingRef = `HF-${new Date().getFullYear()}-${String(booking._id).slice(-6).toUpperCase()}`;
    await booking.save();
    await booking.populate('room');

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    await session.abortTransaction().catch(() => {});
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
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

    const ALLOWED = ['pending', 'approved', 'rejected', 'cancelled', 'completed'];
    if (!ALLOWED.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

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

// Get my bookings (protected): only the logged-in user's bookings,
// newest first, with room details populated.
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id || req.user._id })
      .populate('room')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching bookings', error: error.message });
  }
};

// Get single booking (protected): only the owner or an admin (403 otherwise).
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    const isOwner = booking.user && String(booking.user) === String(req.user.id || req.user._id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'You cannot view this booking' });
    }
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching booking', error: error.message });
  }
};

// Cancel own booking (protected): allowed while pending/approved and before
// check-in (same rules as utils/policies canCancelBooking).
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    const isOwner = booking.user && String(booking.user) === String(req.user.id || req.user._id);
    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'You cannot cancel this booking' });
    }
    const { canCancelBooking } = require('../utils/policies');
    const check = canCancelBooking(booking, Date.now());
    if (!check.ok) {
      return res.status(400).json({ success: false, message: `Cannot cancel: ${check.reason}` });
    }
    booking.status = 'cancelled';
    await booking.save();
    await booking.populate('room');
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error cancelling booking', error: error.message });
  }
};
