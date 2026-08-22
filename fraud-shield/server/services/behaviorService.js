const UserBehavior = require('../models/UserBehavior');

/**
 * Retrieves the user's behavioral baseline or creates default baseline profile.
 * @param {string} userId - User Object ID
 * @returns {Promise<Object>} UserBehavior document
 */
const getOrCreateUserBehavior = async (userId) => {
  let behavior = await UserBehavior.findOne({ userId });
  if (!behavior) {
    behavior = new UserBehavior({
      userId,
      averageTransactionAmount: 1250,
      maximumNormalAmount: 5000,
      averageDailyTransactions: 4,
      usualTransactionHours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
      usualLocations: ['Bhubaneswar', 'Delhi', 'Bangalore', 'Mumbai', 'Kolkata'],
      knownReceivers: ['rahul@upi', 'amit@upi', 'shop_a@upi', 'shop_b@upi', 'grocery@upi', 'electricity@upi'],
      knownDevices: ['device_win_11', 'device_android_primary'],
      averageTransactionFrequency: 2,
      lastTransactionAt: new Date(),
      lastKnownLocation: 'Bhubaneswar'
    });
    await behavior.save();
  }
  return behavior;
};

/**
 * Detects behavioral anomalies by comparing the incoming transaction against the user's baseline profile.
 * Signals:
 * - AMOUNT_ANOMALY
 * - TIME_ANOMALY
 * - FREQUENCY_ANOMALY
 * - NEW_RECEIVER
 * - NEW_DEVICE
 * - LOCATION_ANOMALY
 * 
 * @param {Object} baseline - User's UserBehavior document
 * @param {Object} transactionData - Incoming transaction attributes
 * @param {boolean} isNewDevice - Whether the device is newly detected
 * @returns {{ signals: string[], reasons: string[], score: number }}
 */
const detectBehaviorAnomalies = (baseline, transactionData = {}, isNewDevice = false) => {
  const signals = [];
  const reasons = [];
  let anomalyWeightSum = 0;

  const amount = Number(transactionData.amount || 0);
  const transactionHour = transactionData.transactionHour !== undefined ? Number(transactionData.transactionHour) : new Date().getHours();
  const receiverId = (transactionData.receiverId || '').trim().toLowerCase();
  const location = (transactionData.location || '').trim();
  const locationChange = transactionData.locationChange === true || String(transactionData.locationChange).toLowerCase() === 'true';
  const transactionFrequency = Number(transactionData.transactionFrequency || 1);
  const failedTransactions = Number(transactionData.failedTransactions || 0);
  const isExplicitNewReceiver = transactionData.isNewReceiver === true || String(transactionData.isNewReceiver).toLowerCase() === 'true';
  const isExplicitNewDevice = transactionData.isNewDevice === true || String(transactionData.isNewDevice).toLowerCase() === 'true';

  // 1. AMOUNT_ANOMALY check
  const maxNormal = baseline.maximumNormalAmount || 5000;
  const avgAmount = baseline.averageTransactionAmount || 1250;
  if (amount > maxNormal || (avgAmount > 0 && amount >= avgAmount * 3)) {
    signals.push('AMOUNT_ANOMALY');
    reasons.push("Transaction amount is significantly above the user's normal pattern.");
    anomalyWeightSum += 35;
  }

  // 2. TIME_ANOMALY check
  const usualHours = baseline.usualTransactionHours && baseline.usualTransactionHours.length > 0
    ? baseline.usualTransactionHours
    : [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
  
  if (!usualHours.includes(transactionHour) || transactionHour < 5) {
    signals.push('TIME_ANOMALY');
    reasons.push("The transaction occurred outside the user's usual transaction hours.");
    anomalyWeightSum += 20;
  }

  // 3. FREQUENCY_ANOMALY check
  const avgFreq = baseline.averageTransactionFrequency || 2;
  if (transactionFrequency > avgFreq * 3 || failedTransactions >= 3) {
    signals.push('FREQUENCY_ANOMALY');
    if (failedTransactions >= 3) {
      reasons.push("Multiple recent transaction failures detected before this payment.");
    } else {
      reasons.push("Transaction frequency is unusually high compared to historical baseline.");
    }
    anomalyWeightSum += 25;
  }

  // 4. NEW_RECEIVER check
  const knownReceivers = (baseline.knownReceivers || []).map(r => r.toLowerCase());
  if (isExplicitNewReceiver || (receiverId && !knownReceivers.includes(receiverId))) {
    signals.push('NEW_RECEIVER');
    reasons.push("The recipient has not previously appeared in this user's transaction history.");
    anomalyWeightSum += 20;
  }

  // 5. LOCATION_ANOMALY check
  const usualLocations = (baseline.usualLocations || []).map(l => l.toLowerCase());
  if (locationChange || (location && !usualLocations.includes(location.toLowerCase()))) {
    signals.push('LOCATION_ANOMALY');
    reasons.push("Transaction location differs from the user's usual transacting locations.");
    anomalyWeightSum += 20;
  }

  // 6. NEW_DEVICE check
  const knownDevices = baseline.knownDevices || [];
  const deviceId = transactionData.deviceId;
  if (isNewDevice || isExplicitNewDevice || (deviceId && !knownDevices.includes(deviceId))) {
    signals.push('NEW_DEVICE');
    reasons.push("This transaction originated from a device not previously associated with this account.");
    anomalyWeightSum += 25;
  }

  // Cap behavior score at 100
  const behavioralScore = Math.min(100, Math.max(0, anomalyWeightSum));

  return {
    signals,
    reasons,
    score: behavioralScore
  };
};

/**
 * Updates the user's baseline behavior profile upon completed transaction.
 * @param {string} userId - User Object ID
 * @param {Object} transactionData - Successfully completed transaction details
 */
const updateUserBehavior = async (userId, transactionData = {}) => {
  const behavior = await getOrCreateUserBehavior(userId);

  const amount = Number(transactionData.amount || 0);
  const receiverId = (transactionData.receiverId || '').trim();
  const deviceId = (transactionData.deviceId || '').trim();
  const location = (transactionData.location || '').trim();
  const transactionHour = transactionData.transactionHour !== undefined ? Number(transactionData.transactionHour) : new Date().getHours();

  if (amount > 0) {
    // Exponential moving average for average transaction amount
    behavior.averageTransactionAmount = Math.round((behavior.averageTransactionAmount * 0.8) + (amount * 0.2));
    if (amount > behavior.maximumNormalAmount) {
      // Gradually adjust max normal amount if legitimate higher payments occur
      behavior.maximumNormalAmount = Math.round((behavior.maximumNormalAmount * 0.85) + (amount * 0.15));
    }
  }

  if (receiverId && !behavior.knownReceivers.includes(receiverId)) {
    behavior.knownReceivers.push(receiverId);
  }

  if (deviceId && !behavior.knownDevices.includes(deviceId)) {
    behavior.knownDevices.push(deviceId);
  }

  if (location && !behavior.usualLocations.includes(location)) {
    behavior.usualLocations.push(location);
    behavior.lastKnownLocation = location;
  }

  if (!behavior.usualTransactionHours.includes(transactionHour)) {
    behavior.usualTransactionHours.push(transactionHour);
    behavior.usualTransactionHours.sort((a, b) => a - b);
  }

  behavior.lastTransactionAt = new Date();
  await behavior.save();
};

module.exports = {
  getOrCreateUserBehavior,
  detectBehaviorAnomalies,
  updateUserBehavior
};
