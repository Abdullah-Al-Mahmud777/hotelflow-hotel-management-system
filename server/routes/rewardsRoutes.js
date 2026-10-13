const express = require('express');
const router = express.Router();
const rewardsController = require('../controllers/rewardsController');
const { protect, restrictTo } = require('../middlewares/auth');

router.get('/coupons', protect, rewardsController.listCoupons);
router.post('/coupons/validate', protect, rewardsController.validateCoupon);
router.post('/coupons', protect, restrictTo('admin'), rewardsController.createCoupon);
router.get('/loyalty', protect, rewardsController.loyaltySummary);
router.post('/loyalty/redeem', protect, rewardsController.redeemLoyalty);

module.exports = router;
