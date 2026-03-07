const express = require('express');
const router = express.Router();
const { createContact } = require('../controllers/contactController');
const { optionalAuth } = require('../middlewares/auth');

// Public route with optional auth
router.post('/', optionalAuth, createContact);

module.exports = router;
