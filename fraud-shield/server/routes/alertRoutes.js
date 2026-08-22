const express = require('express');
const router = express.Router();
const { getAlerts, markRead, markAllRead } = require('../controllers/alertController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAlerts);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);

module.exports = router;
