const { evaluateContextualRisk } = require('../services/riskEngine');
const RiskProfile = require('../models/RiskProfile');
const RiskEvent = require('../models/RiskEvent');
const Transaction = require('../models/Transaction');

/**
 * @desc    Evaluate real-time transaction + device + behavior + voice risk
 * @route   POST /api/risk/evaluate
 * @access  Private
 */
const evaluateRisk = async (req, res, next) => {
  try {
    const {
      transactionId,
      amount,
      receiverId,
      receiverName,
      transactionType,
      deviceId,
      deviceInfo = {},
      location,
      transactionHour,
      isNewReceiver,
      isNewDevice,
      locationChange,
      failedTransactions,
      transactionFrequency,
      accountAgeDays,
      voiceAnalysisId
    } = req.body;

    let txData = {
      transactionId,
      amount: Number(amount) || 0,
      receiverId: receiverId || '',
      receiverName: receiverName || '',
      transactionType: transactionType || 'UPI',
      deviceId: deviceId || deviceInfo.deviceId || 'device_default',
      location: location || 'Bhubaneswar',
      transactionHour: transactionHour !== undefined ? Number(transactionHour) : new Date().getHours(),
      isNewReceiver,
      isNewDevice,
      locationChange,
      failedTransactions: Number(failedTransactions) || 0,
      transactionFrequency: Number(transactionFrequency) || 1,
      accountAgeDays: Number(accountAgeDays) || 365
    };

    // If transactionId is provided, pull transaction document fields if missing
    if (transactionId) {
      const existingTx = await Transaction.findById(transactionId);
      if (existingTx && existingTx.userId.toString() === req.user.id) {
        txData.amount = txData.amount || existingTx.amount;
        txData.receiverId = txData.receiverId || existingTx.receiverId;
        txData.receiverName = txData.receiverName || existingTx.receiverName;
        txData.deviceId = txData.deviceId || existingTx.deviceId;
        txData.location = txData.location || existingTx.location;
      }
    }

    // Call Central Real-Time Risk Engine
    const evaluation = await evaluateContextualRisk({
      userId: req.user.id,
      transactionData: txData,
      deviceInfo: {
        ...deviceInfo,
        deviceId: txData.deviceId,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || ''
      },
      voiceAnalysisId: voiceAnalysisId || null
    });

    res.status(200).json({
      success: true,
      transactionId: transactionId || null,
      riskScore: evaluation.riskScore,
      riskLevel: evaluation.riskLevel,
      recommendedAction: evaluation.recommendedAction,
      fraudProbability: evaluation.fraudProbability,
      signals: evaluation.signals,
      reasons: evaluation.reasons,
      componentScores: evaluation.componentScores,
      device: evaluation.device,
      riskEventId: evaluation.riskEventId
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user historical risk trend scores
 * @route   GET /api/users/risk-history, GET /api/risk/history
 * @access  Private
 */
const getRiskHistory = async (req, res, next) => {
  try {
    const profile = await RiskProfile.findOne({ userId: req.user.id });

    if (!profile || !profile.recentScores || profile.recentScores.length === 0) {
      // Return default baseline if no evaluations recorded yet
      const today = new Date().toISOString().split('T')[0];
      return res.status(200).json({
        success: true,
        currentRiskScore: 15,
        currentRiskLevel: 'LOW',
        history: [
          { date: today, riskScore: 15, riskLevel: 'LOW' }
        ]
      });
    }

    // Format history entries
    const history = profile.recentScores.map(entry => ({
      date: entry.date,
      riskScore: entry.riskScore,
      riskLevel: entry.riskLevel || (entry.riskScore >= 70 ? 'HIGH' : entry.riskScore >= 30 ? 'MEDIUM' : 'LOW')
    }));

    res.status(200).json({
      success: true,
      currentRiskScore: profile.currentRiskScore,
      currentRiskLevel: profile.currentRiskLevel,
      totalEvaluations: profile.totalEvaluations,
      highRiskCount: profile.highRiskCount,
      history
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  evaluateRisk,
  getRiskHistory
};
