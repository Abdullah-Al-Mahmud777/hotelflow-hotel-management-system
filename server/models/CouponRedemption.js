const mongoose = require('mongoose');

// One row per (coupon, user, booking) — blocks double-applying the same
// coupon to the same booking; per-user limits enforced by count query.
const redemptionSchema = new mongoose.Schema({
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  discount: { type: Number, required: true, min: 0 },
}, { timestamps: true });

redemptionSchema.index({ coupon: 1, user: 1, booking: 1 }, { unique: true });
redemptionSchema.index({ coupon: 1, user: 1 });

module.exports = mongoose.model('CouponRedemption', redemptionSchema);
