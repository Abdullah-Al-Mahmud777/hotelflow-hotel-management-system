const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String, required: true, unique: true, uppercase: true, trim: true,
    minlength: 3, maxlength: 32,
  },
  kind: { type: String, enum: ['percent', 'fixed'], required: true },
  value: { type: Number, required: true, min: 0 }, // percent (0-100) or fixed $
  maxDiscount: { type: Number, default: null, min: 0 }, // cap for percent coupons
  minSpend: { type: Number, default: 0, min: 0 },
  maxUses: { type: Number, default: null, min: 1 }, // null = unlimited
  usedCount: { type: Number, default: 0, min: 0 },
  perUserLimit: { type: Number, default: 1, min: 1 },
  expiresAt: { type: Date, default: null },
  active: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

couponSchema.index({ active: 1, expiresAt: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
