const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getTransactions,
  getTransactionById,
  confirmTransaction,
  cancelTransaction
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

// Protect all transaction routes
router.use(protect);

router.post('/', createTransaction);
router.get('/', getTransactions);
router.get('/:id', getTransactionById);
router.post('/:id/confirm', confirmTransaction);
router.post('/:id/cancel', cancelTransaction);

module.exports = router;
