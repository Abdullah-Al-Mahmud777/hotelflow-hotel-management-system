const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middlewares/auth');

// All routes are protected and restricted to admin
router.use(protect);
router.use(restrictTo('admin'));

// User management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);

// Review management
router.get('/reviews', adminController.getAllReviews);
router.put('/reviews/:id/status', adminController.updateReviewStatus);

// Contact management
router.get('/contacts', adminController.getAllContacts);
router.put('/contacts/:id/status', adminController.updateContactStatus);
router.delete('/contacts/:id', adminController.deleteContact);

// Analytics
router.get('/analytics', adminController.getAnalytics);

module.exports = router;
