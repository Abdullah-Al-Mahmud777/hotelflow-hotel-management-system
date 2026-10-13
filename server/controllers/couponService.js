// Shared coupon validation + atomic apply logic.
// Pure eligibility checks live here so booking create/modify reuse them.
const Coupon = require('../models/Coupon');
const CouponRedemption = require('../models/CouponRedemption');
const { couponDiscount } = require('../utils/policies');

async function findActiveCoupon(code) {
  if (!code || typeof code !== 'string') return null;
  return Coupon.findOne({ code: code.toUpperCase().trim(), active: true });
}

// Returns { ok, coupon, discount, total, message } — no side effects.
// excludeBookingId: ignore this booking's own redemption (coupon "keep" on modify).
async function checkCouponEligibility(coupon, userId, subtotal, excludeBookingId = null) {
  if (!coupon) return { ok: false, message: 'Invalid coupon code' };
  if (!coupon.active) return { ok: false, message: 'Coupon is inactive' };
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { ok: false, message: 'Coupon has expired' };
  }
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return { ok: false, message: 'Coupon usage limit reached' };
  }
  if (Number(subtotal) < Number(coupon.minSpend || 0)) {
    return { ok: false, message: `Minimum spend is $${coupon.minSpend}` };
  }
  if (coupon.kind === 'percent' && (coupon.value <= 0 || coupon.value > 100)) {
    return { ok: false, message: 'Coupon misconfigured' };
  }
  const redemptionFilter = excludeBookingId
    ? { coupon: coupon._id, user: userId, booking: { $ne: excludeBookingId } }
    : { coupon: coupon._id, user: userId };
  const usedByUser = await CouponRedemption.countDocuments(redemptionFilter);
  if (usedByUser >= (coupon.perUserLimit || 1)) {
    return { ok: false, message: 'You have already used this coupon' };
  }
  const math = couponDiscount(coupon, subtotal);
  return { ok: true, coupon, discount: math.discount, total: math.total };
}

// Atomic apply inside a caller-owned session: re-checks limits, bumps
// usedCount, writes redemption. Throws on violation (caller aborts).
async function applyCouponAtomic({ coupon, userId, bookingId, discount, session }) {
  const fresh = await Coupon.findById(coupon._id).session(session);
  if (!fresh || !fresh.active) throw new Error('Coupon is no longer available');
  if (fresh.expiresAt && new Date(fresh.expiresAt) < new Date()) throw new Error('Coupon has expired');
  if (fresh.maxUses != null && fresh.usedCount >= fresh.maxUses) throw new Error('Coupon usage limit reached');
  const usedByUser = await CouponRedemption.countDocuments({ coupon: fresh._id, user: userId }).session(session);
  if (usedByUser >= (fresh.perUserLimit || 1)) throw new Error('Coupon already used');
  fresh.usedCount += 1;
  await fresh.save({ session });
  await CouponRedemption.create([{
    coupon: fresh._id, user: userId, booking: bookingId, discount,
  }], { session });
}

module.exports = { findActiveCoupon, checkCouponEligibility, applyCouponAtomic };
