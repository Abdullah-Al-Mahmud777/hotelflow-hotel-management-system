const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');
const LoyaltyTransaction = require('../models/LoyaltyTransaction');
const Booking = require('../models/Booking');
const { findActiveCoupon, checkCouponEligibility } = require('./couponService');
const { loyaltyEarned, redeemValue } = require('../utils/policies');

// GET /api/rewards/coupons — active public promos (paginated)
exports.listCoupons = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const now = new Date();
    const filter = { active: true, $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] };
    const [items, total] = await Promise.all([
      Coupon.find(filter).select('-usedCount').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Coupon.countDocuments(filter),
    ]);
    res.json({ success: true, count: items.length, total, page, pages: Math.ceil(total / limit), data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load coupons', error: error.message });
  }
};

// POST /api/rewards/coupons/validate — { code, subtotal } (no side effects)
exports.validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Coupon code is required' });
    const coupon = await findActiveCoupon(code);
    const result = await checkCouponEligibility(coupon, req.user._id, Number(subtotal) || 0);
    if (!result.ok) return res.status(400).json({ success: false, message: result.message });
    res.json({ success: true, data: { code: coupon.code, kind: coupon.kind, value: coupon.value, discount: result.discount, total: result.total } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to validate coupon', error: error.message });
  }
};

// POST /api/rewards/coupons — admin creates promos
exports.createCoupon = async (req, res) => {
  try {
    const { code, kind, value, maxDiscount, minSpend, maxUses, perUserLimit, expiresAt } = req.body;
    if (!code || !kind || value == null) {
      return res.status(400).json({ success: false, message: 'code, kind and value are required' });
    }
    if (!['percent', 'fixed'].includes(kind)) {
      return res.status(400).json({ success: false, message: 'kind must be percent or fixed' });
    }
    if (kind === 'percent' && (value <= 0 || value > 100)) {
      return res.status(400).json({ success: false, message: 'percent value must be 1–100' });
    }
    const coupon = await Coupon.create({
      code, kind, value, maxDiscount: maxDiscount ?? null,
      minSpend: minSpend || 0, maxUses: maxUses ?? null,
      perUserLimit: perUserLimit || 1,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'Coupon code already exists' });
    res.status(400).json({ success: false, message: 'Failed to create coupon', error: error.message });
  }
};

// GET /api/rewards/loyalty — balance + ledger from REAL approved spend
exports.loyaltySummary = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const approved = await Booking.find({
      $or: [{ user: req.user._id }, { guestEmail: req.user.email }],
      status: 'approved',
    }).lean();
    const earnedLifetime = approved.reduce((s, b) => s + loyaltyEarned(b.totalPrice), 0);
    const [txns, total] = await Promise.all([
      LoyaltyTransaction.find({ user: req.user._id }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      LoyaltyTransaction.countDocuments({ user: req.user._id }),
    ]);
    const redeemed = txns.concat([]); // page slice irrelevant for balance; recompute below
    const allTxns = await LoyaltyTransaction.find({ user: req.user._id }).lean();
    const redeemedTotal = allTxns.filter((t) => t.kind === 'redeem').reduce((s, t) => s + t.points, 0);
    const adjustedEarn = allTxns.filter((t) => t.kind === 'earn').reduce((s, t) => s + t.points, 0);
    // Balance = lifetime earned from stays + manual earns − redeems (floor 0)
    const balance = Math.max(0, earnedLifetime + adjustedEarn - redeemedTotal);
    void redeemed;
    res.json({
      success: true,
      data: { balance, earnedLifetime, redeemedTotal, page, pages: Math.ceil(total / limit), history: txns },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load loyalty summary', error: error.message });
  }
};

// POST /api/rewards/loyalty/redeem — { points, idempotencyKey } → issues single-use coupon
// Transaction-safe: ledger write + coupon creation commit atomically.
exports.redeemLoyalty = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { points, idempotencyKey } = req.body;
    const calc = redeemValue(points);
    if (!calc.ok) return res.status(400).json({ success: false, message: calc.message });
    if (!idempotencyKey || typeof idempotencyKey !== 'string') {
      return res.status(400).json({ success: false, message: 'idempotencyKey is required' });
    }

    let result;
    await session.withTransaction(async () => {
      const approved = await Booking.find({
        $or: [{ user: req.user._id }, { guestEmail: req.user.email }],
        status: 'approved',
      }).session(session).lean();
      const earnedLifetime = approved.reduce((s, b) => s + loyaltyEarned(b.totalPrice), 0);
      const prior = await LoyaltyTransaction.find({ user: req.user._id }).session(session).lean();
      const balance = Math.max(0,
        earnedLifetime
        + prior.filter((t) => t.kind === 'earn').reduce((s, t) => s + t.points, 0)
        - prior.filter((t) => t.kind === 'redeem').reduce((s, t) => s + t.points, 0));
      if (balance < calc.pointsUsed) throw Object.assign(new Error('Insufficient points balance'), { status: 400 });

      const code = `LOYAL-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 1296).toString(36).toUpperCase()}`;
      const [coupon] = await Coupon.create([{
        code, kind: 'fixed', value: calc.couponValue, minSpend: 50,
        maxUses: 1, perUserLimit: 1, active: true, createdBy: req.user._id,
      }], { session });
      await LoyaltyTransaction.create([{
        user: req.user._id, kind: 'redeem', points: calc.pointsUsed,
        ref: code, idempotencyKey: String(idempotencyKey),
      }], { session });
      result = { coupon, pointsUsed: calc.pointsUsed };
    });

    const { notify } = require('../utils/notify');
    await notify(req.user._id, 'loyalty', `Redeemed ${result.pointsUsed} pts → coupon ${result.coupon.code} ($${result.coupon.value} off)`);

    res.status(201).json({ success: true, message: 'Points redeemed', data: result });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Duplicate redemption — this request was already processed' });
    }
    const status = error.status || 500;
    res.status(status).json({ success: false, message: error.message || 'Failed to redeem points' });
  } finally {
    await session.endSession();
  }
};
