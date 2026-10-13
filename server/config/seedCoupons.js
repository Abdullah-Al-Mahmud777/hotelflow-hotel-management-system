// Seed default promo coupons. Usage: npm run seed:coupons
// Idempotent: existing codes are left untouched.
const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');
require('dotenv').config();

const DEFAULTS = [
  { code: 'WELCOME10', kind: 'percent', value: 10, maxDiscount: 50, minSpend: 100, maxUses: 500, perUserLimit: 1, expiresAt: null },
  { code: 'STAY20', kind: 'percent', value: 20, maxDiscount: 120, minSpend: 300, maxUses: 200, perUserLimit: 1, expiresAt: null },
  { code: 'FLAT25', kind: 'fixed', value: 25, minSpend: 150, maxUses: 300, perUserLimit: 2, expiresAt: null },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  for (const c of DEFAULTS) {
    const exists = await Coupon.findOne({ code: c.code });
    if (exists) {
      console.log(`Coupon ${c.code} already exists — skipped`);
      continue;
    }
    await Coupon.create(c);
    console.log(`Coupon ${c.code} created`);
  }
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed coupons error:', err);
  process.exit(1);
});
