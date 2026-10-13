const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Room = require('../models/Room');
const Favorite = require('../models/Favorite');
const Notification = require('../models/Notification');
const { notify } = require('../utils/notify');
const {
  validateStayDates,
  quotePrice,
  overlaps,
  canModifyBooking,
  couponDiscount,
} = require('../utils/policies');
const { findActiveCoupon, checkCouponEligibility, applyCouponAtomic } = require('./couponService');

// Scope bookings to the logged-in user (by user id, fallback to guest email)
function bookingFilter(req) {
  if (req.user) {
    return {
      $or: [{ user: req.user._id }, { guestEmail: req.user.email }],
    };
  }
  return {};
}

// GET /api/v1/dashboard/metrics
// -> 200 { totalBookings, approved, pending, reviews }
// e.g. { totalBookings: 1, approved: 0, pending: 1, reviews: 0 }
exports.getDashboardMetrics = async (req, res) => {
  try {
    const filter = bookingFilter(req);
    const [totalBookings, approved, pending, reviews] = await Promise.all([
      Booking.countDocuments(filter),
      Booking.countDocuments({ ...filter, status: 'approved' }),
      Booking.countDocuments({ ...filter, status: 'pending' }),
      Review.countDocuments({ user: req.user._id }),
    ]);
    return res.status(200).json({ totalBookings, approved, pending, reviews });
  } catch (err) {
    console.error('[dashboardController.getDashboardMetrics]', err);
    return res.status(500).json({ success: false, message: 'Failed to load metrics' });
  }
};

// GET /api/v1/bookings/recent
// -> 200 [ { id, title, date, status } ]
exports.getRecentBookings = async (req, res) => {
  try {
    const filter = bookingFilter(req);
    const bookings = await Booking.find(filter)
      .populate('room', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    const mapped = bookings.map((b) => ({
      id: String(b._id),
      title: b.room?.name || 'ww',
      date: b.checkIn
        ? new Date(b.checkIn).toISOString().slice(0, 10)
        : new Date(b.createdAt).toISOString().slice(0, 10),
      status: b.status,
    }));
    return res.status(200).json(mapped);
  } catch (err) {
    console.error('[dashboardController.getRecentBookings]', err);
    return res.status(500).json({ success: false, message: 'Failed to load recent bookings' });
  }
};

// GET /api/v1/reviews/status-count
// -> 200 { approved, pending, rejected }
exports.getReviewStatusCount = async (req, res) => {
  try {
    const uid = req.user._id;
    const [approved, pending, rejected] = await Promise.all([
      Review.countDocuments({ user: uid, status: 'approved' }),
      Review.countDocuments({ user: uid, status: 'pending' }),
      Review.countDocuments({ user: uid, status: 'rejected' }),
    ]);
    return res.status(200).json({ approved, pending, rejected });
  } catch (err) {
    console.error('[dashboardController.getReviewStatusCount]', err);
    return res.status(500).json({ success: false, message: 'Failed to load review counts' });
  }
};

// GET /api/v1/user/profile
// -> 200 { name, email, avatar }
exports.getUserProfile = async (req, res) => {
  try {
    const u = req.user;
    return res.status(200).json({
      name: u.name || 'Admin',
      email: u.email || 'admin@hotelflow.com',
      avatar: u.avatar || (u.name ? u.name.charAt(0).toUpperCase() : 'A'),
    });
  } catch (err) {
    console.error('[dashboardController.getUserProfile]', err);
    return res.status(500).json({ success: false, message: 'Failed to load profile' });
  }
};

// GET /api/v1/bookings
// -> 200 { success: true, count, data: [full bookings w/ room] } (user-scoped)
exports.getMyBookings = async (req, res) => {
  try {
    const filter = bookingFilter(req);
    const bookings = await Booking.find(filter)
      .populate('room', 'name type image price')
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    console.error('[dashboardController.getMyBookings]', err);
    return res.status(500).json({ success: false, message: 'Failed to load bookings' });
  }
};

// GET /api/v1/bookings/:id — detail with ownership check
exports.getBookingDetail = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room', 'name type image price capacity').lean();
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    const owns =
      (booking.user && String(booking.user) === String(req.user._id)) ||
      booking.guestEmail === req.user.email;
    if (!owns) return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    return res.status(200).json({ success: true, data: booking });
  } catch (err) {
    console.error('[dashboardController.getBookingDetail]', err);
    return res.status(500).json({ success: false, message: 'Failed to load booking' });
  }
};

// POST /api/v1/bookings/:id/cancel — secure user cancellation
// Rules: owner only; status must be pending OR (approved + checkIn > 24h away).
// Rejected/cancelled/past stays cannot be cancelled.
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    const owns =
      (booking.user && String(booking.user) === String(req.user._id)) ||
      booking.guestEmail === req.user.email;
    if (!owns) return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    if (['cancelled', 'rejected'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: `Booking is already ${booking.status}` });
    }
    if (booking.status === 'approved') {
      const msLeft = new Date(booking.checkIn).getTime() - Date.now();
      if (Number.isNaN(msLeft) || msLeft <= 0) {
        return res.status(400).json({ success: false, message: 'Cannot cancel a stay that already started' });
      }
      if (msLeft < 24 * 60 * 60 * 1000) {
        return res.status(400).json({ success: false, message: 'Approved stays can only be cancelled 24h+ before check-in' });
      }
    }
    booking.status = 'cancelled';
    await booking.save();
    await booking.populate('room', 'name type image price');
    await notify(req.user._id, 'booking-cancelled', `Booking cancelled: ${booking.room?.name || 'Room'} — refund in progress`);
    return res.status(200).json({ success: true, message: 'Booking cancelled', data: booking });
  } catch (err) {
    console.error('[dashboardController.cancelBooking]', err);
    return res.status(500).json({ success: false, message: 'Failed to cancel booking' });
  }
};

// GET /api/v1/bookings/:id/invoice — real booking payload for invoice rendering
exports.getInvoice = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room', 'name type price').lean();
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    const owns =
      (booking.user && String(booking.user) === String(req.user._id)) ||
      booking.guestEmail === req.user.email;
    if (!owns) return res.status(403).json({ success: false, message: 'Not authorized to view this invoice' });
    return res.status(200).json({ success: true, data: booking });
  } catch (err) {
    console.error('[dashboardController.getInvoice]', err);
    return res.status(500).json({ success: false, message: 'Failed to load invoice' });
  }
};

// GET /api/v1/payments/history — derived from REAL bookings (no invented charges)
// approved → paid, pending → pending, cancelled → refund-pending, rejected → none
exports.getPaymentsHistory = async (req, res) => {
  try {
    const filter = bookingFilter(req);
    const bookings = await Booking.find(filter)
      .populate('room', 'name type')
      .sort({ createdAt: -1 })
      .lean();
    const data = bookings.map((b) => ({
      id: String(b._id),
      bookingId: String(b._id),
      room: b.room?.name || 'Room',
      date: b.createdAt,
      checkIn: b.checkIn,
      amount: Number(b.totalPrice) || 0,
      paymentStatus:
        b.status === 'approved' ? 'paid' : b.status === 'pending' ? 'pending' : b.status === 'cancelled' ? 'refund-pending' : 'none',
      bookingStatus: b.status,
    }));
    const totals = {
      paid: data.filter((t) => t.paymentStatus === 'paid').reduce((s, t) => s + t.amount, 0),
      pending: data.filter((t) => t.paymentStatus === 'pending').reduce((s, t) => s + t.amount, 0),
      refundPending: data.filter((t) => t.paymentStatus === 'refund-pending').reduce((s, t) => s + t.amount, 0),
    };
    return res.status(200).json({ success: true, count: data.length, totals, data });
  } catch (err) {
    console.error('[dashboardController.getPaymentsHistory]', err);
    return res.status(500).json({ success: false, message: 'Failed to load payment history' });
  }
};

// GET /api/v1/notifications — persistent notifications first, then live derived activity
exports.getNotifications = async (req, res) => {
  try {
    const filter = bookingFilter(req);
    const [stored, bookings, reviews] = await Promise.all([
      Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20).lean(),
      Booking.find(filter).populate('room', 'name').sort({ updatedAt: -1 }).limit(10).lean(),
      Review.find({ user: req.user._id }).populate('room', 'name').sort({ updatedAt: -1 }).limit(10).lean(),
    ]);
    const derived = [
      ...bookings.map((b) => ({
        id: `b-${String(b._id)}-${b.status}`,
        kind: b.status === 'approved' ? 'booking-approved' : b.status === 'pending' ? 'booking-pending' : b.status === 'cancelled' ? 'booking-cancelled' : 'booking-rejected',
        title:
          b.status === 'approved' ? `Booking approved: ${b.room?.name || 'Room'}`
          : b.status === 'pending' ? `Booking pending review: ${b.room?.name || 'Room'}`
          : b.status === 'cancelled' ? `Booking cancelled: ${b.room?.name || 'Room'}`
          : `Booking update: ${b.room?.name || 'Room'}`,
        date: b.updatedAt || b.createdAt,
        read: !['pending'].includes(b.status),
        source: 'activity',
      })),
      ...reviews.map((r) => ({
        id: `r-${String(r._id)}-${r.status}`,
        kind: r.status === 'approved' ? 'review-approved' : r.status === 'rejected' ? 'review-rejected' : 'review-pending',
        title:
          r.status === 'approved' ? `Review published: ${r.room?.name || 'Room'}`
          : r.status === 'rejected' ? `Review not approved: ${r.room?.name || 'Room'}`
          : `Review awaiting approval: ${r.room?.name || 'Room'}`,
        date: r.updatedAt || r.createdAt,
        read: r.status !== 'pending',
        source: 'activity',
      })),
    ];
    const items = [
      ...stored.map((n) => ({
        id: String(n._id), nid: String(n._id), kind: n.kind, title: n.title,
        date: n.createdAt, read: n.read, source: 'stored',
      })),
      ...derived,
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 20);
    return res.status(200).json({ success: true, count: items.length, unread: items.filter((i) => !i.read).length, data: items });
  } catch (err) {
    console.error('[dashboardController.getNotifications]', err);
    return res.status(500).json({ success: false, message: 'Failed to load notifications' });
  }
};

// PATCH /api/v1/notifications/:id/read — mark a stored notification read (owner only)
exports.markNotificationRead = async (req, res) => {
  try {
    const n = await Notification.findOne({ _id: req.params.id, user: req.user._id });
    if (!n) return res.status(404).json({ success: false, message: 'Notification not found' });
    n.read = true;
    await n.save();
    return res.json({ success: true, data: n });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
};

// POST /api/v1/notifications/read-all
exports.markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    return res.json({ success: true, message: 'All notifications marked read' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update notifications' });
  }
};

// PUT /api/v1/bookings/:id/modify — owner edits dates/guests/requests/coupon
// Policy: pending anytime; approved only 48h+ before check-in. Transaction-safe.
exports.modifyBooking = async (req, res) => {
  const mongoose = require('mongoose');
  const { runTransaction } = require('../utils/txn');
  const session = await mongoose.startSession();
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    const owns =
      (booking.user && String(booking.user) === String(req.user._id)) ||
      booking.guestEmail === req.user.email;
    if (!owns) return res.status(403).json({ success: false, message: 'Not authorized to modify this booking' });

    const policy = canModifyBooking(booking);
    if (!policy.ok) return res.status(400).json({ success: false, message: `Cannot modify: ${policy.reason}` });

    const { checkIn, checkOut, numberOfGuests, specialRequests, couponCode } = req.body;
    const room = await Room.findById(booking.room);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    let newCheckIn = booking.checkIn;
    let newCheckOut = booking.checkOut;
    if (checkIn || checkOut) {
      const v = validateStayDates(checkIn || booking.checkIn, checkOut || booking.checkOut);
      if (!v.ok) return res.status(400).json({ success: false, message: v.message });
      newCheckIn = v.checkIn;
      newCheckOut = v.checkOut;
      const clash = await Booking.findOne({
        _id: { $ne: booking._id },
        room: booking.room,
        status: { $in: ['pending', 'approved'] },
        ...overlaps(newCheckIn, newCheckOut),
      });
      if (clash) {
        return res.status(400).json({ success: false, message: 'Room is not available for the new dates' });
      }
    }

    const guests = numberOfGuests != null ? Number(numberOfGuests) : booking.numberOfGuests;
    const nights = Math.ceil((new Date(newCheckOut) - new Date(newCheckIn)) / (24 * 60 * 60 * 1000));
    const q = quotePrice(room.price, nights, guests, room.capacity);
    if (!q.ok) return res.status(400).json({ success: false, message: q.message });

    // Coupon handling: undefined = keep, null/'' = remove, string = (re)apply
    const CouponRedemption = require('../models/CouponRedemption');
    const Coupon = require('../models/Coupon');
    let discount = booking.discount || 0;
    let code = booking.couponCode || null;

    await runTransaction(session, async () => {
      if (couponCode !== undefined) {
        await CouponRedemption.deleteOne({ user: req.user._id, booking: booking._id }).session(session);
        if (code) {
          const prev = await Coupon.findOne({ code }).session(session);
          if (prev) { prev.usedCount = Math.max(0, prev.usedCount - 1); await prev.save({ session }); }
        }
        discount = 0;
        code = null;
        if (couponCode) {
          const coupon = await findActiveCoupon(couponCode);
          const check = await checkCouponEligibility(coupon, req.user._id, q.total);
          if (!check.ok) throw Object.assign(new Error(check.message), { status: 400 });
          await applyCouponAtomic({ coupon, userId: req.user._id, bookingId: booking._id, discount: check.discount, session });
          discount = check.discount;
          code = coupon.code;
        }
      } else if (code) {
        // Keep existing coupon: revalidate against new subtotal
        const coupon = await Coupon.findOne({ code }).session(session);
        let keep = false;
        if (coupon) {
          try {
            const check = await checkCouponEligibility(coupon, req.user._id, q.total, booking._id);
            keep = check.ok;
          } catch { keep = false; }
        }
        if (!keep) {
          await CouponRedemption.deleteOne({ user: req.user._id, booking: booking._id }).session(session);
          if (coupon) { coupon.usedCount = Math.max(0, coupon.usedCount - 1); await coupon.save({ session }); }
          discount = 0;
          code = null;
        } else {
          const math = couponDiscount(coupon, q.total);
          discount = math.discount;
          await CouponRedemption.updateOne(
            { user: req.user._id, booking: booking._id },
            { discount, coupon: coupon._id },
          ).session(session);
        }
      }

      booking.checkIn = newCheckIn;
      booking.checkOut = newCheckOut;
      booking.numberOfGuests = guests;
      if (specialRequests !== undefined) booking.specialRequests = String(specialRequests).slice(0, 1000);
      booking.couponCode = code;
      booking.discount = discount;
      booking.totalPrice = Math.round((q.total - discount) * 100) / 100;
      await booking.save({ session });
    });

    await booking.populate('room', 'name type image price');
    await notify(req.user._id, 'booking-modified', `Booking updated: ${booking.room?.name || 'Room'}`);
    return res.json({ success: true, message: 'Booking updated', data: booking });
  } catch (err) {
    console.error('[dashboardController.modifyBooking]', err);
    const status = err.status || 500;
    return res.status(status).json({ success: false, message: err.message || 'Failed to modify booking' });
  } finally {
    await session.endSession();
  }
};

// GET /api/v1/bookings/calendar?month=YYYY-MM — bookings intersecting the month
exports.getBookingCalendar = async (req, res) => {
  try {
    const m = /^\d{4}-(0[1-9]|1[0-2])$/.test(req.query.month || '') ? req.query.month : new Date().toISOString().slice(0, 7);
    const [y, mo] = m.split('-').map(Number);
    const start = new Date(Date.UTC(y, mo - 1, 1));
    const end = new Date(Date.UTC(y, mo, 1));
    const filter = req.user
      ? { $or: [{ user: req.user._id }, { guestEmail: req.user.email }] }
      : {};
    const bookings = await Booking.find({
      ...filter,
      checkIn: { $lt: end },
      checkOut: { $gt: start },
    }).populate('room', 'name type price').sort({ checkIn: 1 }).lean();
    return res.json({
      success: true,
      data: {
        month: m,
        bookings: bookings.map((b) => ({
          id: String(b._id),
          room: b.room?.name || 'Room',
          roomId: b.room?._id || b.room,
          checkIn: b.checkIn,
          checkOut: b.checkOut,
          status: b.status,
          totalPrice: b.totalPrice,
        })),
      },
    });
  } catch (err) {
    console.error('[dashboardController.getBookingCalendar]', err);
    return res.status(500).json({ success: false, message: 'Failed to load calendar' });
  }
};

// GET /api/v1/recommendations?limit= — from real stay history + wishlist
exports.getRecommendations = async (req, res) => {
  try {
    const limit = Math.min(12, Math.max(1, parseInt(req.query.limit, 10) || 6));
    const [mine, favs] = await Promise.all([
      Booking.find({ $or: [{ user: req.user._id }, { guestEmail: req.user.email }] })
        .populate('room', 'type price').lean(),
      Favorite.find({ user: req.user._id }).lean(),
    ]);
    const favRoomIds = new Set(favs.map((f) => String(f.room)));
    const typeCounts = {};
    let spend = 0;
    mine.forEach((b) => {
      const t = b.room?.type || 'Standard';
      typeCounts[t] = (typeCounts[t] || 0) + 1;
      spend += Number(b.totalPrice) || 0;
    });
    const favType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || req.user.preferences?.roomType || 'Deluxe';
    const avgPrice = mine.length ? spend / mine.length : null;
    const candidates = await Room.find({ availability: true }).lean();
    const scored = candidates
      .filter((r) => !favRoomIds.has(String(r._id)))
      .map((r) => {
        let score = 0;
        const reasons = [];
        if (r.type === favType) { score += 3; reasons.push(`Matches your ${favType} stays`); }
        if (avgPrice && Math.abs(r.price - avgPrice) / avgPrice <= 0.3) { score += 2; reasons.push('Near your usual price'); }
        if ((req.user.preferences?.amenities || []).some((a) => (r.amenities || []).includes(a))) { score += 2; reasons.push('Has your preferred amenities'); }
        if (r.featured) { score += 1; reasons.push('Featured stay'); }
        return { room: r, score, reason: reasons[0] || 'Popular right now' };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ room, reason }) => ({ ...room, reason }));
    return res.json({ success: true, count: scored.length, data: scored });
  } catch (err) {
    console.error('[dashboardController.getRecommendations]', err);
    return res.status(500).json({ success: false, message: 'Failed to load recommendations' });
  }
};

// GET /api/v1/preferences — room preferences stored on the user record
exports.getPreferences = async (req, res) => {
  try {
    return res.json({ success: true, data: req.user.preferences || {} });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load preferences' });
  }
};

// PUT /api/v1/preferences — { roomType, amenities[], bedType, dietary, notes }
exports.updatePreferences = async (req, res) => {
  try {
    const User = require('../models/User');
    const { roomType, amenities, bedType, dietary, notes } = req.body;
    const patch = {};
    if (roomType !== undefined) {
      if (!['Standard', 'Deluxe', 'Suite', 'Any'].includes(roomType)) {
        return res.status(400).json({ success: false, message: 'Invalid roomType' });
      }
      patch['preferences.roomType'] = roomType;
    }
    if (amenities !== undefined) {
      if (!Array.isArray(amenities) || amenities.length > 20 || amenities.some((a) => typeof a !== 'string' || a.length > 60)) {
        return res.status(400).json({ success: false, message: 'Amenities must be an array of ≤20 short strings' });
      }
      patch['preferences.amenities'] = amenities;
    }
    if (bedType !== undefined) patch['preferences.bedType'] = String(bedType).slice(0, 100);
    if (dietary !== undefined) patch['preferences.dietary'] = String(dietary).slice(0, 100);
    if (notes !== undefined) patch['preferences.notes'] = String(notes).slice(0, 500);
    const user = await User.findByIdAndUpdate(req.user._id, { $set: patch }, { new: true, runValidators: true });
    return res.json({ success: true, data: user.preferences });
  } catch (err) {
    console.error('[dashboardController.updatePreferences]', err);
    return res.status(500).json({ success: false, message: 'Failed to save preferences' });
  }
};
// -> 200 { success: true, message: "Logged out" }
// JWT is stateless — client discards the token; this endpoint exists for contract/logging.
exports.logout = async (req, res) => {
  try {
    return res.status(200).json({ success: true, message: 'Logged out' });
  } catch (err) {
    console.error('[dashboardController.logout]', err);
    return res.status(500).json({ success: false, message: 'Logout failed' });
  }
};
