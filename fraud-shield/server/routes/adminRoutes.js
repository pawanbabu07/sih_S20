const express = require('express');
const router = express.Router();
const {
  getStatistics,
  getDashboardOverview,
  getFraudCases,
  getFraudCaseById,
  updateFraudCaseStatus,
  getFalsePositives,
  resolveFalsePositive,
  getVoiceCases,
  getAuditLogs,
  getTransactionsList,
  getUserRiskTimeline,
  getBehavioralInsights,
  getFraudGraph,
  getFraudClustersList,
  getFraudClusterById,
  getModelHealth,
  getSystemHealth
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// All admin endpoints require auth + admin role
router.use(protect);
router.use(adminMiddleware);

router.get('/dashboard', getDashboardOverview);
router.get('/statistics', getStatistics);
router.get('/behavioral-insights', getBehavioralInsights);
router.get('/users/:userId/risk-timeline', getUserRiskTimeline);
router.get('/transactions', getTransactionsList);
router.get('/fraud-cases', getFraudCases);
router.get('/fraud-cases/:id', getFraudCaseById);
router.patch('/fraud-cases/:id/status', updateFraudCaseStatus);
router.get('/voice-cases', getVoiceCases);
router.get('/false-positives', getFalsePositives);
router.patch('/false-positives/:id', resolveFalsePositive);
router.get('/audit-logs', getAuditLogs);

// Phase 8: Advanced Fraud Intelligence Routes
router.get('/fraud-graph/:type/:id', getFraudGraph);
router.get('/fraud-graph', (req, res) => res.redirect('/api/admin/fraud-graph/DEVICE/device_sih_demo_b99'));
router.get('/fraud-clusters', getFraudClustersList);
router.get('/fraud-clusters/:id', getFraudClusterById);
router.get('/model-health', getModelHealth);

// Phase 9: Real-Time Telemetry & System Monitoring
router.get('/system-health', getSystemHealth);

module.exports = router;
