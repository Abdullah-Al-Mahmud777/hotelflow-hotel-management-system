const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { protect } = require('../middlewares/auth');

router.get('/tickets', protect, supportController.listTickets);
router.post('/tickets', protect, supportController.createTicket);
router.get('/tickets/:id', protect, supportController.getTicket);
router.patch('/tickets/:id', protect, supportController.updateTicketStatus);
router.get('/tickets/:id/messages', protect, supportController.listMessages);
router.post('/tickets/:id/messages', protect, supportController.postMessage);

module.exports = router;
