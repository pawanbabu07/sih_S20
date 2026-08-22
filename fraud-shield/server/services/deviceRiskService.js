const FraudRelationship = require('../models/FraudRelationship');
const Transaction = require('../models/Transaction');

/**
 * Evaluates the cross-account network risk for a given physical device ID.
 * @param {string} deviceId - Device identifier
 * @returns {Promise<Object>} Device network risk evaluation
 */
const calculateDeviceRisk = async (deviceId) => {
  if (!deviceId) {
    return {
      deviceRiskScore: 0,
      riskLevel: 'LOW',
      metrics: { distinctUsers: 0, totalTransactions: 0, highRiskCount: 0, confirmedFraudCount: 0 },
      reasons: []
    };
  }

  const cleanDevId = String(deviceId).trim();
  const reasons = [];
  let score = 0;

  try {
    // 1. Find all users using this device via FraudRelationship
    const userRelDocs = await FraudRelationship.find({
      targetType: 'DEVICE',
      targetId: cleanDevId,
      relationship: 'USES'
    }).select('sourceId riskScore createdAt').lean();

    const distinctUsers = new Set(userRelDocs.map(r => r.sourceId)).size;

    // 2. Fetch all transactions associated with this device
    const txRelDocs = await FraudRelationship.find({
      targetType: 'DEVICE',
      targetId: cleanDevId,
      relationship: 'FROM'
    }).select('sourceId transactionId riskScore createdAt').lean();

    const txIds = txRelDocs.map(r => r.transactionId).filter(Boolean);
    const transactions = txIds.length > 0
      ? await Transaction.find({ _id: { $in: txIds } }).select('riskScore status createdAt').lean()
      : [];

    const totalTransactions = transactions.length;
    const highRiskCount = transactions.filter(t => (t.riskScore || 0) >= 70).length;
    const confirmedFraudCount = transactions.filter(t => t.status === 'CONFIRMED_FRAUD').length;

    // 3. Compute device risk signals
    // Device shared across multiple accounts
    if (distinctUsers >= 4) {
      score += 40;
      reasons.push(`Device is shared across ${distinctUsers} different user accounts`);
    } else if (distinctUsers >= 2) {
      score += 20;
      reasons.push(`Device is associated with ${distinctUsers} separate user accounts`);
    }

    // High risk transactions from this device
    if (highRiskCount >= 3) {
      score += 35;
      reasons.push(`${highRiskCount} previous transactions from this device were flagged as high risk`);
    } else if (highRiskCount >= 1) {
      score += 15;
      reasons.push(`Device has originated previous suspicious transactions`);
    }

    // Confirmed fraud on this device
    if (confirmedFraudCount > 0) {
      score += 45;
      reasons.push(`Device was used in ${confirmedFraudCount} confirmed fraud case(s)`);
    }

    const deviceRiskScore = Math.min(score, 100);
    const riskLevel = deviceRiskScore >= 70 ? 'HIGH' : (deviceRiskScore >= 30 ? 'MEDIUM' : 'LOW');

    return {
      deviceRiskScore,
      riskLevel,
      metrics: {
        distinctUsers,
        totalTransactions,
        highRiskCount,
        confirmedFraudCount
      },
      reasons
    };
  } catch (err) {
    console.error('Error calculating device risk:', err.message);
    return {
      deviceRiskScore: 0,
      riskLevel: 'LOW',
      metrics: { distinctUsers: 0, totalTransactions: 0, highRiskCount: 0, confirmedFraudCount: 0 },
      reasons: []
    };
  }
};

module.exports = {
  calculateDeviceRisk
};
