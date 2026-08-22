const transactionService = require('../services/transactionService');

/**
 * @desc    Create a new simulated transaction
 * @route   POST /api/transactions
 * @access  Private
 */
const createTransaction = async (req, res, next) => {
  try {
    const {
      amount,
      receiverId,
      receiverName,
      transactionType,
      deviceId,
      location,
      transactionHour,
      isNewReceiver,
      isNewDevice
    } = req.body;

    // Basic request body validation
    if (amount === undefined || !receiverId || !receiverName || !deviceId || !location || transactionHour === undefined) {
      res.status(400);
      throw new Error('Missing required fields: amount, receiverId, receiverName, deviceId, location, and transactionHour are required');
    }

    const transaction = await transactionService.createTransaction(
      {
        amount,
        receiverId,
        receiverName,
        transactionType: transactionType || 'UPI',
        deviceId,
        location,
        transactionHour,
        isNewReceiver: isNewReceiver ?? false,
        isNewDevice: isNewDevice ?? false
      },
      req.user.id
    );

    res.status(201).json({
      success: true,
      transaction
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's transactions
 * @route   GET /api/transactions
 * @access  Private
 */
const getTransactions = async (req, res, next) => {
  try {
    const transactions = await transactionService.getUserTransactions(req.user.id);

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single transaction by ID
 * @route   GET /api/transactions/:id
 * @access  Private
 */
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await transactionService.getTransactionById(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      transaction
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

/**
 * @desc    Confirm a transaction (marks status as COMPLETED)
 * @route   POST /api/transactions/:id/confirm
 * @access  Private
 */
const confirmTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionService.confirmTransaction(
      req.params.id,
      req.user.id
    );

    try {
      const socketService = require('../services/socketService');
      socketService.emitTransactionStatusChanged(req.user.id, {
        transactionId: transaction.id || transaction._id.toString(),
        status: transaction.status,
        amount: transaction.amount,
        receiverName: transaction.receiverName
      });
    } catch (sErr) {
      console.warn('Socket emit error on confirmTransaction:', sErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Transaction confirmed successfully',
      transaction
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

/**
 * @desc    Cancel a transaction (marks status as CANCELLED)
 * @route   POST /api/transactions/:id/cancel
 * @access  Private
 */
const cancelTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionService.cancelTransaction(
      req.params.id,
      req.user.id
    );

    try {
      const socketService = require('../services/socketService');
      socketService.emitTransactionStatusChanged(req.user.id, {
        transactionId: transaction.id || transaction._id.toString(),
        status: transaction.status,
        amount: transaction.amount,
        receiverName: transaction.receiverName
      });
    } catch (sErr) {
      console.warn('Socket emit error on cancelTransaction:', sErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Transaction cancelled successfully',
      transaction
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  confirmTransaction,
  cancelTransaction
};
