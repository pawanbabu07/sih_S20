const express = require('express');
const router = express.Router();
const { checkFraud } = require('../controllers/fraudController');
const { protect } = require('../middleware/authMiddleware');

// Protect fraud routes with JWT authentication
router.post('/check', protect, checkFraud);

module.exports = router;
