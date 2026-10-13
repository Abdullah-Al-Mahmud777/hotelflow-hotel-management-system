const mongoose = require('mongoose');

// Immutable ledger. idempotencyKey (e.g. `earn:<bookingId>`) blocks
// duplicate reward claims even under retries/concurrency.
const loyaltySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  kind: { type: String, enum: ['earn', 'redeem'], required: true },
  points: { type: Number, required: true, min: 1 },
  ref: { type: String, default: null }, // booking id / coupon code
  idempotencyKey: { type: String, required: true, unique: true },
}, { timestamps: true });

loyaltySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('LoyaltyTransaction', loyaltySchema);
