// One-off cleanup of integration-test artifacts (testtwo@example.com).
// Usage: node scripts/cleanup-test-data.js
const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('../models/User');
  const Booking = require('../models/Booking');
  const Review = require('../models/Review');
  const Favorite = require('../models/Favorite');
  const Coupon = require('../models/Coupon');
  const CouponRedemption = require('../models/CouponRedemption');
  const LoyaltyTransaction = require('../models/LoyaltyTransaction');
  const SupportTicket = require('../models/SupportTicket');
  const ChatMessage = require('../models/ChatMessage');
  const Notification = require('../models/Notification');

  const user = await User.findOne({ email: 'testtwo@example.com' });
  if (!user) {
    console.log('No test user found — nothing to clean');
    await mongoose.disconnect();
    return;
  }

  const bookings = await Booking.find({ $or: [{ user: user._id }, { guestEmail: user.email }] });
  const bookingIds = bookings.map((b) => b._id);
  console.log(`Removing ${bookings.length} test booking(s)`);

  // Restore coupon usage counters for redemptions tied to these bookings
  const redemptions = await CouponRedemption.find({ booking: { $in: bookingIds } });
  for (const r of redemptions) {
    await Coupon.updateOne({ _id: r.coupon }, { $inc: { usedCount: -1 } });
  }
  // Also drop the admin verify booking created during testing
  const adminTest = await Booking.find({ guestEmail: 'admin@hotelflow.com', checkIn: { $gte: new Date('2027-01-01') } });
  for (const b of adminTest) {
    const reds = await CouponRedemption.find({ booking: b._id });
    for (const r of reds) await Coupon.updateOne({ _id: r.coupon }, { $inc: { usedCount: -1 } });
    await CouponRedemption.deleteMany({ booking: b._id });
    console.log(`Removing admin verify booking ${b._id}`);
    await Booking.deleteOne({ _id: b._id });
  }

  await CouponRedemption.deleteMany({ booking: { $in: bookingIds } });
  await Booking.deleteMany({ _id: { $in: bookingIds } });
  const tickets = await SupportTicket.find({ user: user._id });
  await ChatMessage.deleteMany({ ticket: { $in: tickets.map((t) => t._id) } });
  await SupportTicket.deleteMany({ user: user._id });
  await Favorite.deleteMany({ user: user._id });
  await Review.deleteMany({ user: user._id });
  await LoyaltyTransaction.deleteMany({ user: user._id });
  await Notification.deleteMany({ user: user._id });
  await User.deleteOne({ _id: user._id });

  // Clamp counters at zero (safety)
  await Coupon.updateMany({ usedCount: { $lt: 0 } }, { $set: { usedCount: 0 } });
  console.log('Cleanup complete');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Cleanup error:', err);
  process.exit(1);
});
