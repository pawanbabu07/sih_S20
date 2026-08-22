const express = require('express');
const router = express.Router();
const { getSecurityOverview, getDevices, trustDevice } = require('../controllers/securityController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/overview', getSecurityOverview);
router.get('/devices', getDevices);
router.patch('/devices/:deviceId/trust', trustDevice);

module.exports = router;
