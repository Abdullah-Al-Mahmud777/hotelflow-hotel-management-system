const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { getInvoicePdf } = require('../controllers/invoiceController');
const {
  getDashboardMetrics,
  getRecentBookings,
  getMyBookings,
  getBookingDetail,
  cancelBooking,
  modifyBooking,
  getBookingCalendar,
  getRecommendations,
  getPreferences,
  updatePreferences,
  getInvoice,
  getPaymentsHistory,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getReviewStatusCount,
  getUserProfile,
  logout,
} = require('../controllers/dashboardController');

// All paths below are mounted under /api/v1 in server.js,
// so the full URLs become e.g. GET /api/v1/dashboard/metrics
router.get('/dashboard/metrics', protect, getDashboardMetrics);
router.get('/bookings/recent', protect, getRecentBookings);
router.get('/bookings', protect, getMyBookings);
router.get('/bookings/calendar', protect, getBookingCalendar);
router.get('/bookings/:id/invoice', protect, getInvoice);
router.get('/bookings/:id/invoice.pdf', protect, getInvoicePdf);
router.get('/bookings/:id', protect, getBookingDetail);
router.put('/bookings/:id/modify', protect, modifyBooking);
router.post('/bookings/:id/cancel', protect, cancelBooking);
router.get('/recommendations', protect, getRecommendations);
router.get('/preferences', protect, getPreferences);
router.put('/preferences', protect, updatePreferences);
router.get('/payments/history', protect, getPaymentsHistory);
router.get('/notifications', protect, getNotifications);
router.patch('/notifications/:id/read', protect, markNotificationRead);
router.post('/notifications/read-all', protect, markAllNotificationsRead);
router.get('/reviews/status-count', protect, getReviewStatusCount);
router.get('/user/profile', protect, getUserProfile);
router.post('/auth/logout', protect, logout);

module.exports = router;
