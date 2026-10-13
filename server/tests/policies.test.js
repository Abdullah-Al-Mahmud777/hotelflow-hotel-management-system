// Pure policy-helper tests — no database required.
// Run: npm test  (node --test tests/)
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  nightsBetween,
  validateStayDates,
  quotePrice,
  couponDiscount,
  loyaltyEarned,
  redeemValue,
  canCancelBooking,
  canModifyBooking,
} = require('../utils/policies');

describe('stay date validation', () => {
  it('accepts a future range', () => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    const ci = new Date(base.getTime() + 86400000).toISOString();
    const co = new Date(base.getTime() + 3 * 86400000).toISOString();
    const r = validateStayDates(ci, co);
    assert.equal(r.ok, true);
    assert.equal(r.nights, 2);
  });
  it('rejects past check-in', () => {
    const r = validateStayDates('2020-01-01', '2020-01-03');
    assert.equal(r.ok, false);
  });
  it('rejects checkout before checkin', () => {
    const ci = new Date(Date.now() + 86400000).toISOString();
    const r = validateStayDates(ci, ci);
    assert.equal(r.ok, false);
  });
  it('nightsBetween counts calendar nights', () => {
    assert.equal(nightsBetween('2026-05-30', '2026-06-02'), 3);
  });
});

describe('pricing', () => {
  it('quotes nightly rate x nights', () => {
    assert.deepEqual(quotePrice(100, 3, 2, 2), { ok: true, total: 300 });
  });
  it('rejects over-capacity guests', () => {
    assert.equal(quotePrice(100, 3, 5, 2).ok, false);
  });
});

describe('coupon math', () => {
  it('percent with cap', () => {
    assert.deepEqual(couponDiscount({ kind: 'percent', value: 20, maxDiscount: 50 }, 500), { ok: true, discount: 50, total: 450 });
  });
  it('percent without cap', () => {
    assert.deepEqual(couponDiscount({ kind: 'percent', value: 10 }, 200), { ok: true, discount: 20, total: 180 });
  });
  it('fixed capped at subtotal', () => {
    assert.deepEqual(couponDiscount({ kind: 'fixed', value: 500 }, 120), { ok: true, discount: 120, total: 0 });
  });
});

describe('loyalty math', () => {
  it('earns 1pt per ৳500', () => {
    assert.equal(loyaltyEarned(12500), 25);
    assert.equal(loyaltyEarned(499), 0);
  });
  it('redeem requires 100pt minimum', () => {
    assert.equal(redeemValue(50).ok, false);
    assert.deepEqual(redeemValue(250), { ok: true, pointsUsed: 200, couponValue: 1000 });
  });
});

describe('cancellation policy', () => {
  it('pending always cancellable', () => {
    assert.equal(canCancelBooking({ status: 'pending', checkIn: new Date() }).ok, true);
  });
  it('cancelled never re-cancellable', () => {
    assert.equal(canCancelBooking({ status: 'cancelled' }).ok, false);
  });
  it('approved blocks inside 24h', () => {
    const soon = new Date(Date.now() + 2 * 3600000);
    assert.equal(canCancelBooking({ status: 'approved', checkIn: soon }).ok, false);
    const later = new Date(Date.now() + 72 * 3600000);
    assert.equal(canCancelBooking({ status: 'approved', checkIn: later }).ok, true);
  });
});

describe('modification policy', () => {
  it('pending modifiable', () => {
    assert.equal(canModifyBooking({ status: 'pending', checkIn: new Date() }).ok, true);
  });
  it('approved needs 48h+', () => {
    const soon = new Date(Date.now() + 30 * 3600000);
    assert.equal(canModifyBooking({ status: 'approved', checkIn: soon }).ok, false);
    const later = new Date(Date.now() + 72 * 3600000);
    assert.equal(canModifyBooking({ status: 'approved', checkIn: later }).ok, true);
  });
});
