const express = require('express');
const router = express.Router();
const { evaluateRisk, getRiskHistory } = require('../controllers/riskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/evaluate', evaluateRisk);
router.get('/history', getRiskHistory);

module.exports = router;
