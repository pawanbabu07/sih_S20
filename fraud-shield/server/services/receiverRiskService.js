const Transaction = require('../models/Transaction');
const FraudRelationship = require('../models/FraudRelationship');

/**
 * Calculates a network risk score for a specific receiver UPI ID.
 * @param {string} receiverId - Recipient UPI identifier
 * @returns {Promise<Object>} Receiver network risk evaluation
 */
const calculateReceiverRisk = async (receiverId) => {
  if (!receiverId) {
    return {
      receiverRiskScore: 0,
      riskLevel: 'LOW',
      metrics: { distinctUsers: 0, totalTransactions: 0, highRiskCount: 0, confirmedFraudCount: 0 },
      reasons: []
    };
  }

  const cleanRxId = String(receiverId).trim();
  const reasons = [];
  let score = 0;

  try {
    // 1. Fetch transactions for this receiver
    const transactions = await Transaction.find({ receiverId: cleanRxId })
      .select('userId amount riskScore status createdAt')
      .lean();

    const totalTransactions = transactions.length;

    if (totalTransactions === 0) {
      return {
        receiverRiskScore: 0,
        riskLevel: 'LOW',
        metrics: { distinctUsers: 0, totalTransactions: 0, highRiskCount: 0, confirmedFraudCount: 0 },
        reasons: []
      };
    }

    // 2. Count distinct sender users
    const distinctUsers = new Set(transactions.map(t => String(t.userId))).size;

    // 3. Count high-risk and confirmed fraud cases
    const highRiskCount = transactions.filter(t => (t.riskScore || 0) >= 70).length;
    const confirmedFraudCount = transactions.filter(t => t.status === 'CONFIRMED_FRAUD').length;

    // 4. Compute risk factors
    // Multiple distinct users sending money to same receiver (+15 to +35)
    if (distinctUsers >= 5) {
      score += 35;
      reasons.push(`Receiver has received funds from ${distinctUsers} distinct accounts`);
    } else if (distinctUsers >= 3) {
      score += 20;
      reasons.push(`Receiver is connected to ${distinctUsers} distinct user accounts`);
    }

    // High-risk transaction ratio (+25 to +40)
    if (highRiskCount >= 3) {
      score += 35;
      reasons.push(`${highRiskCount} previous transactions to this receiver were flagged as high risk`);
    } else if (highRiskCount >= 1) {
      score += 15;
      reasons.push(`Receiver has been associated with previous suspicious payments`);
    }

    // Confirmed fraud history (+40)
    if (confirmedFraudCount > 0) {
      score += 45;
      reasons.push(`Receiver is confirmed to be associated with ${confirmedFraudCount} past fraud case(s)`);
    }

    // High volume burst check (transactions within last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentTxCount = transactions.filter(t => new Date(t.createdAt) >= oneDayAgo).length;
    if (recentTxCount >= 5) {
      score += 15;
      reasons.push(`High payment frequency: ${recentTxCount} payments received in the last 24 hours`);
    }

    const receiverRiskScore = Math.min(score, 100);
    const riskLevel = receiverRiskScore >= 70 ? 'HIGH' : (receiverRiskScore >= 30 ? 'MEDIUM' : 'LOW');

    return {
      receiverRiskScore,
      riskLevel,
      metrics: {
        distinctUsers,
        totalTransactions,
        highRiskCount,
        confirmedFraudCount,
        recentTxCount
      },
      reasons
    };
  } catch (err) {
    console.error('Error calculating receiver risk:', err.message);
    return {
      receiverRiskScore: 0,
      riskLevel: 'LOW',
      metrics: { distinctUsers: 0, totalTransactions: 0, highRiskCount: 0, confirmedFraudCount: 0 },
      reasons: []
    };
  }
};

module.exports = {
  calculateReceiverRisk
};
