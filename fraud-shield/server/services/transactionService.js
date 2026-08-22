const Transaction = require('../models/Transaction');
const RiskEvent = require('../models/RiskEvent');
const { updateUserBehavior } = require('./behaviorService');

/**
 * Create a new simulated transaction with default safe risk values (Phase 1)
 * @param {Object} transactionData - Details of the transaction
 * @param {string} userId - ID of the authenticated user
 * @returns {Promise<Object>} Created transaction document
 */
const createTransaction = async (transactionData, userId) => {
  const transaction = new Transaction({
    ...transactionData,
    userId,
    riskScore: 0,
    riskLevel: 'LOW',
    status: 'PENDING',
    fraudReasons: []
  });

  return await transaction.save();
};

/**
 * Retrieve all transactions belonging to a specific user
 * @param {string} userId - ID of the authenticated user
 * @returns {Promise<Array>} List of transactions
 */
const getUserTransactions = async (userId) => {
  return await Transaction.find({ userId }).sort({ createdAt: -1 });
};

/**
 * Retrieve a specific transaction after verifying user ownership
 * @param {string} transactionId - ID of the transaction
 * @param {string} userId - ID of the authenticated user
 * @returns {Promise<Object>} Transaction document
 * @throws {Error} If not found (404) or access is forbidden (403)
 */
const mongoose = require('mongoose');

const getTransactionById = async (transactionId, userId) => {
  if (!transactionId || transactionId === 'undefined' || transactionId === 'null' || !mongoose.Types.ObjectId.isValid(transactionId)) {
    const error = new Error('Invalid or missing transaction ID');
    error.statusCode = 400;
    throw error;
  }

  const transaction = await Transaction.findById(transactionId);
  
  if (!transaction) {
    const error = new Error('Transaction not found');
    error.statusCode = 404;
    throw error;
  }

  if (transaction.userId.toString() !== userId) {
    const error = new Error('Access forbidden: This transaction belongs to another user');
    error.statusCode = 403;
    throw error;
  }

  return transaction;
};

/**
 * Generates human-readable explainable reasons for risk detection
 * @param {Object} data - Transaction inputs (handles camelCase or snake_case)
 * @returns {Array<string>} List of risk reasons
 */
const generateExplainableReasons = (data) => {
  const reasons = [];

  const amount = data.amount;
  const isNewReceiver = data.isNewReceiver !== undefined ? data.isNewReceiver : data.is_new_receiver;
  const isNewDevice = data.isNewDevice !== undefined ? data.isNewDevice : data.is_new_device;
  const locationChange = data.locationChange !== undefined ? data.locationChange : data.location_change;
  const transactionHour = data.transactionHour !== undefined ? data.transactionHour : data.transaction_hour;
  const failedTransactions = data.failedTransactions !== undefined ? data.failedTransactions : data.failed_transactions;

  if (amount > 20000) {
    reasons.push("Transaction amount is unusually high");
  }
  if (isNewReceiver === true || isNewReceiver === 1 || String(isNewReceiver).toLowerCase() === 'true') {
    reasons.push("Receiver is new");
  }
  if (isNewDevice === true || isNewDevice === 1 || String(isNewDevice).toLowerCase() === 'true') {
    reasons.push("Transaction is being made from a new device");
  }
  if (locationChange === true || locationChange === 1 || String(locationChange).toLowerCase() === 'true') {
    reasons.push("Transaction location is unusual");
  }
  if (transactionHour !== undefined && transactionHour !== null && transactionHour < 5) {
    reasons.push("Transaction occurred at an unusual time");
  }
  if (failedTransactions !== undefined && failedTransactions !== null && failedTransactions >= 3) {
    reasons.push("Multiple recent transaction failures detected");
  }

  return reasons;
};

/**
 * Map risk level to recommended action
 * @param {string} riskLevel - LOW, MEDIUM, or HIGH
 * @returns {string} ALLOW, WARN_AND_CONFIRM, or STRONG_WARNING
 */
const getRecommendedAction = (riskLevel) => {
  switch (riskLevel) {
    case 'HIGH':
      return 'STRONG_WARNING';
    case 'MEDIUM':
      return 'WARN_AND_CONFIRM';
    case 'LOW':
    default:
      return 'ALLOW';
  }
};

/**
 * Creates and saves a transaction to MongoDB after processing with the ML model
 * @param {Object} transactionData - User inputs
 * @param {string} userId - Authorized user ID
 * @param {Object} prediction - Output from python ML prediction
 * @returns {Promise<Object>} Created and saved transaction document
 */
const createCheckedTransaction = async (transactionData, userId, prediction) => {
  const { fraud_probability, risk_score } = prediction;

  // Determine risk level based on score thresholds (0-29 LOW, 30-69 MEDIUM, 70-100 HIGH)
  let riskLevel = 'LOW';
  if (risk_score >= 70) {
    riskLevel = 'HIGH';
  } else if (risk_score >= 30) {
    riskLevel = 'MEDIUM';
  }

  // Determine status (HIGH -> FLAGGED, LOW/MEDIUM -> PENDING)
  const status = riskLevel === 'HIGH' ? 'FLAGGED' : 'PENDING';

  // Generate explainable reasons
  const fraudReasons = generateExplainableReasons(transactionData);

  // Build model instance
  const transaction = new Transaction({
    userId,
    amount: transactionData.amount,
    receiverId: transactionData.receiverId,
    receiverName: transactionData.receiverName,
    transactionType: transactionData.transactionType || 'UPI',
    deviceId: transactionData.deviceId,
    location: transactionData.location,
    transactionHour: transactionData.transactionHour,
    isNewReceiver: transactionData.isNewReceiver ?? false,
    isNewDevice: transactionData.isNewDevice ?? false,
    status,
    riskScore: risk_score,
    riskLevel,
    fraudProbability: fraud_probability,
    fraudReasons
  });

  return await transaction.save();
};

/**
 * Confirms a transaction by setting its status to COMPLETED and updating user behavior baseline
 * @param {string} transactionId - ID of transaction to confirm
 * @param {string} userId - Authorized user ID
 * @returns {Promise<Object>} Updated transaction document
 */
const confirmTransaction = async (transactionId, userId) => {
  const transaction = await getTransactionById(transactionId, userId);
  transaction.status = 'COMPLETED';
  const saved = await transaction.save();

  // Update user behavioral baseline
  try {
    await updateUserBehavior(userId, {
      amount: transaction.amount,
      receiverId: transaction.receiverId,
      deviceId: transaction.deviceId,
      location: transaction.location,
      transactionHour: transaction.transactionHour
    });
  } catch (err) {
    console.warn('Failed to update user behavior baseline:', err.message);
  }

  // Record user decision in risk timeline
  try {
    await RiskEvent.create({
      userId,
      transactionId: transaction._id,
      eventType: 'TRANSACTION',
      riskScore: transaction.riskScore,
      riskLevel: transaction.riskLevel,
      signals: ['USER_CONFIRMED'],
      reasons: [`User verified and confirmed ₹${transaction.amount} transaction to ${transaction.receiverName}.`],
      metadata: { action: 'CONFIRMED', amount: transaction.amount, receiverId: transaction.receiverId },
      timestamp: new Date()
    });
  } catch (err) {
    console.warn('Failed to log risk event for confirmed transaction:', err.message);
  }

  return saved;
};

/**
 * Cancels a transaction by setting its status to CANCELLED and recording event
 * @param {string} transactionId - ID of transaction to cancel
 * @param {string} userId - Authorized user ID
 * @returns {Promise<Object>} Updated transaction document
 */
const cancelTransaction = async (transactionId, userId) => {
  const transaction = await getTransactionById(transactionId, userId);
  transaction.status = 'CANCELLED';
  const saved = await transaction.save();

  // Record user cancellation in risk timeline
  try {
    await RiskEvent.create({
      userId,
      transactionId: transaction._id,
      eventType: 'TRANSACTION',
      riskScore: transaction.riskScore,
      riskLevel: transaction.riskLevel,
      signals: ['USER_CANCELLED'],
      reasons: [`User aborted/cancelled ₹${transaction.amount} payment after safety warning.`],
      metadata: { action: 'CANCELLED', amount: transaction.amount, receiverId: transaction.receiverId },
      timestamp: new Date()
    });
  } catch (err) {
    console.warn('Failed to log risk event for cancelled transaction:', err.message);
  }

  return saved;
};

module.exports = {
  createTransaction,
  getUserTransactions,
  getTransactionById,
  generateExplainableReasons,
  getRecommendedAction,
  createCheckedTransaction,
  confirmTransaction,
  cancelTransaction
};
