const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  getModelVersions,
  getModelVersionById,
  activateModel,
  getModelComparison,
  getDataDriftMetrics
} = require('../controllers/modelController');

// All model registry and governance routes require auth + admin role
router.use(protect);
router.use(adminMiddleware);

// Comparison & drift metrics (placed before :id route to avoid param collision)
router.get('/performance/comparison', getModelComparison);
router.get('/monitoring/drift', getDataDriftMetrics);

// Model registry CRUD & activation
router.get('/', getModelVersions);
router.get('/:id', getModelVersionById);
router.post('/:id/activate', activateModel);

module.exports = router;
