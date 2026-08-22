const express = require('express');
const router = express.Router();
const { getEvents, broadcastTestEvent } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

// Demo mode broadcast endpoint (accessible for live presentation simulation)
router.post('/broadcast-test', broadcastTestEvent);

// Authenticated events history
router.use(protect);
router.get('/', getEvents);

module.exports = router;
