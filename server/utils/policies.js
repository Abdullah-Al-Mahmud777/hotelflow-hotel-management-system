// Pure, dependency-free booking/loyalty/coupon policy helpers.
// Used by controllers AND unit tests (server/tests/policies.test.js).

const MS_DAY = 24 * 60 * 60 * 1000;

function nightsBetween(checkIn, checkOut) {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.ceil(ms / MS_DAY);
}

// Validates stay dates. Returns { ok, checkIn, checkOut, nights, message }
function validateStayDates(checkIn, checkOut, { minNights = 1, maxNights = 60 } = {}) {
  const ci = new Date(checkIn);
  const co = new Date(checkOut);
  if (Number.isNaN(ci.getTime()) || Number.isNaN(co.getTime())) {
    return { ok: false, message: 'Invalid check-in or check-out date' };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (ci < today) return { ok: false, message: 'Check-in cannot be in the past' };
  if (co <= ci) return { ok: false, message: 'Check-out must be after check-in' };
  const nights = nightsBetween(ci, co);
  if (nights < minNights) return { ok: false, message: `Minimum stay is ${minNights} night(s)` };
  if (nights > maxNights) return { ok: false, message: `Maximum stay is ${maxNights} nights` };
  return { ok: true, checkIn: ci, checkOut: co, nights };
}

function quotePrice(nightlyRate, nights, guests = 1, capacity = 1) {
  if (guests > capacity) return { ok: false, message: `Room capacity is ${capacity} guest(s)` };
  return { ok: true, total: Math.round(Number(nightlyRate) * nights * 100) / 100 };
}

// Overlap predicate reused by create/modify availability checks.
function overlaps(checkIn, checkOut) {
  return { checkIn: { $lte: new Date(checkOut) }, checkOut: { $gte: new Date(checkIn) } };
}

// Cancellation policy mirror (client also previews with this logic).
function canCancelBooking(booking, now = Date.now()) {
  if (!booking) return { ok: false, reason: 'Booking not found' };
  if (['cancelled', 'rejected'].includes(booking.status)) return { ok: false, reason: `Already ${booking.status}` };
  if (booking.status === 'pending') return { ok: true };
  if (booking.status === 'approved') {
    const ms = new Date(booking.checkIn).getTime() - now;
    if (Number.isNaN(ms) || ms <= 0) return { ok: false, reason: 'Stay already started' };
    if (ms < MS_DAY) return { ok: false, reason: 'Only 24h+ before check-in' };
    return { ok: true };
  }
  return { ok: false, reason: 'Not cancellable' };
}

// Modification policy: pending anytime; approved only 48h+ before check-in.
function canModifyBooking(booking, now = Date.now()) {
  if (!booking) return { ok: false, reason: 'Booking not found' };
  if (['cancelled', 'rejected'].includes(booking.status)) return { ok: false, reason: `Booking is ${booking.status}` };
  if (booking.status === 'pending') return { ok: true };
  const ms = new Date(booking.checkIn).getTime() - now;
  if (Number.isNaN(ms) || ms <= 0) return { ok: false, reason: 'Stay already started' };
  if (ms < 2 * MS_DAY) return { ok: false, reason: 'Only 48h+ before check-in' };
  return { ok: true };
}

// Coupon discount math (pure — server re-validates eligibility separately).
// coupon: { kind: 'percent'|'fixed', value, maxDiscount }
function couponDiscount(coupon, subtotal) {
  const base = Number(subtotal) || 0;
  if (!coupon || base <= 0) return { ok: true, discount: 0, total: base };
  let discount = 0;
  if (coupon.kind === 'percent') {
    discount = (base * Number(coupon.value)) / 100;
    if (coupon.maxDiscount != null) discount = Math.min(discount, Number(coupon.maxDiscount));
  } else {
    discount = Math.min(Number(coupon.value), base);
  }
  discount = Math.round(discount * 100) / 100;
  return { ok: true, discount, total: Math.round((base - discount) * 100) / 100 };
}

// Loyalty: 1 point per ৳500 of approved spend.
function loyaltyEarned(amount) {
  return Math.floor((Number(amount) || 0) / 500);
}

// Points → coupon value mapping for redemptions (100 pts = ৳500 off, min 100).
function redeemValue(points) {
  const p = Math.floor(Number(points) || 0);
  if (p < 100) return { ok: false, message: 'Minimum redemption is 100 points' };
  const units = Math.floor(p / 100);
  return { ok: true, pointsUsed: units * 100, couponValue: units * 500 };
}

module.exports = {
  MS_DAY,
  nightsBetween,
  validateStayDates,
  quotePrice,
  overlaps,
  canCancelBooking,
  canModifyBooking,
  couponDiscount,
  loyaltyEarned,
  redeemValue,
};
