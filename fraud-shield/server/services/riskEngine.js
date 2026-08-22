const RiskEvent = require('../models/RiskEvent');
const RiskProfile = require('../models/RiskProfile');
const { getOrCreateDevice } = require('./deviceService');
const { getOrCreateUserBehavior, detectBehaviorAnomalies } = require('./behaviorService');
const { createSecurityAlert } = require('./alertService');
const mlService = require('./mlService');
const VoiceAnalysis = require('../models/VoiceAnalysis');
const { evaluateGraphRisk } = require('./graphRiskService');
const { recordTransactionRelationships } = require('./graphBuilderService');

/**
 * Configurable weights for the multi-signal risk engine (5 Signals in Phase 8).
 * Never hardcode weights throughout the codebase.
 */
const DEFAULT_WEIGHTS = {
  transactionML: 0.30,
  behavioral: 0.20,
  device: 0.15,
  voice: 0.15,
  graph: 0.20
};

/**
 * Pure calculation function to evaluate composite risk score.
 * Deterministic and easily unit-testable.
 * 
 * @param {Object} params
 * @param {number} [params.transactionML=0] - ML risk score (0-100)
 * @param {number} [params.behavioral=0] - Behavioral anomaly risk score (0-100)
 * @param {number} [params.deviceTrust=100] - Device trust score (0-100) [device risk = 100 - deviceTrust]
 * @param {number|null} [params.voice=null] - Optional Voice risk score (0-100)
 * @param {number|null} [params.graph=null] - Optional Graph risk score (0-100)
 * @param {Object} [params.customWeights] - Optional override for weights
 * @returns {{ finalScore: number, riskLevel: string, recommendedAction: string, componentScores: Object }}
 */
const calculateRisk = ({
  transactionML = 0,
  behavioral = 0,
  deviceTrust = 100,
  voice = null,
  graph = null,
  customWeights = DEFAULT_WEIGHTS
}) => {
  const tScore = Math.max(0, Math.min(100, Number(transactionML) || 0));
  const bScore = Math.max(0, Math.min(100, Number(behavioral) || 0));
  const dRisk = Math.max(0, Math.min(100, 100 - (Number(deviceTrust) || 0)));
  const vScore = voice !== null && voice !== undefined ? Math.max(0, Math.min(100, Number(voice) || 0)) : null;
  const gScore = graph !== null && graph !== undefined ? Math.max(0, Math.min(100, Number(graph) || 0)) : null;

  const wML = customWeights.transactionML ?? DEFAULT_WEIGHTS.transactionML;
  const wBeh = customWeights.behavioral ?? DEFAULT_WEIGHTS.behavioral;
  const wDev = customWeights.device ?? DEFAULT_WEIGHTS.device;
  const wVoice = customWeights.voice ?? DEFAULT_WEIGHTS.voice;
  const wGraph = customWeights.graph ?? DEFAULT_WEIGHTS.graph;

  let finalScore = 0;

  // Dynamically calculate active components and normalize weights
  let activeWeightSum = wML + wBeh + wDev;
  let weightedScoreSum = (tScore * wML) + (bScore * wBeh) + (dRisk * wDev);

  if (vScore !== null) {
    activeWeightSum += wVoice;
    weightedScoreSum += (vScore * wVoice);
  }

  if (gScore !== null) {
    activeWeightSum += wGraph;
    weightedScoreSum += (gScore * wGraph);
  }

  if (activeWeightSum > 0) {
    finalScore = Math.round(weightedScoreSum / activeWeightSum);
  } else {
    finalScore = Math.round(tScore);
  }

  // Bound final score between 0 and 100
  finalScore = Math.max(0, Math.min(100, finalScore));

  // Determine Risk Level: 0–29 LOW, 30–69 MEDIUM, 70–100 HIGH
  let riskLevel = 'LOW';
  if (finalScore >= 70) {
    riskLevel = 'HIGH';
  } else if (finalScore >= 30) {
    riskLevel = 'MEDIUM';
  }

  // Determine Recommended Action
  let recommendedAction = 'ALLOW';
  if (riskLevel === 'HIGH') {
    recommendedAction = 'STRONG_WARNING';
  } else if (riskLevel === 'MEDIUM') {
    recommendedAction = 'WARN_AND_CONFIRM';
  }

  return {
    finalScore,
    riskLevel,
    recommendedAction,
    componentScores: {
      transactionML: tScore,
      behavioral: bScore,
      deviceRisk: dRisk,
      deviceTrust: Number(deviceTrust) || 0,
      voice: vScore,
      graph: gScore
    }
  };
};

/**
 * Evaluates contextual real-time risk for a user transaction.
 * Integrates database lookup for Device, UserBehavior, ML prediction, Voice analysis, and Fraud Graph.
 * 
 * @param {Object} params
 * @param {string} params.userId - User Object ID
 * @param {Object} params.transactionData - Raw transaction inputs (amount, receiverId, location, etc.)
 * @param {Object} [params.deviceInfo] - Device details (deviceId, browser, os, ipAddress)
 * @param {string} [params.voiceAnalysisId] - Optional linked voice analysis ID
 * @returns {Promise<Object>} Comprehensive risk evaluation response
 */
const evaluateContextualRisk = async ({
  userId,
  transactionData = {},
  deviceInfo = {},
  voiceAnalysisId = null
}) => {
  // 1. Device Intelligence check
  const devId = deviceInfo.deviceId || transactionData.deviceId || 'device_default';
  const deviceResult = await getOrCreateDevice(userId, {
    deviceId: devId,
    browser: deviceInfo.browser || 'Chrome',
    operatingSystem: deviceInfo.operatingSystem || 'Windows',
    deviceType: deviceInfo.deviceType || 'Desktop',
    ipAddress: deviceInfo.ipAddress || ''
  });

  const isNewDevice = deviceResult.isNew || !deviceResult.isTrusted;
  const deviceTrustScore = deviceResult.trustScore;

  // 2. Behavioral Baseline check
  const userBaseline = await getOrCreateUserBehavior(userId);
  const behaviorAnalysis = detectBehaviorAnomalies(userBaseline, {
    ...transactionData,
    deviceId: devId
  }, deviceResult.isNew);

  // 3. Machine Learning Transaction Risk Prediction
  let mlScore = 15;
  let fraudProb = 0.15;
  let mlModelVersion = 'fraud-model-v2.0';
  let mlModelType = 'LogisticRegression';
  let mlOptimalThreshold = 0.40;

  try {
    const mlPrediction = await mlService.predictFraud({
      amount: transactionData.amount || 0,
      transaction_hour: transactionData.transactionHour !== undefined ? transactionData.transactionHour : new Date().getHours(),
      is_new_receiver: behaviorAnalysis.signals.includes('NEW_RECEIVER'),
      is_new_device: isNewDevice,
      location_change: behaviorAnalysis.signals.includes('LOCATION_ANOMALY'),
      failed_transactions: transactionData.failedTransactions || 0,
      transaction_frequency: transactionData.transactionFrequency || 1,
      account_age_days: transactionData.accountAgeDays || 365
    });
    mlScore = mlPrediction.risk_score;
    fraudProb = mlPrediction.fraud_probability;
    if (mlPrediction.modelVersion) mlModelVersion = mlPrediction.modelVersion;
    if (mlPrediction.modelType) mlModelType = mlPrediction.modelType;
    if (mlPrediction.optimal_threshold) mlOptimalThreshold = mlPrediction.optimal_threshold;
  } catch (mlErr) {
    console.warn('ML Service unavailable, computing heuristic baseline transaction score:', mlErr.message);
    mlScore = Math.min(95, (transactionData.amount > 20000 ? 50 : 15) + (behaviorAnalysis.signals.length * 12));
    fraudProb = Number((mlScore / 100).toFixed(2));
  }

  // 4. Voice / Social Engineering Risk Signal check
  let voiceScore = null;
  let voiceDoc = null;
  if (voiceAnalysisId) {
    try {
      voiceDoc = await VoiceAnalysis.findById(voiceAnalysisId);
      if (voiceDoc) {
        voiceScore = voiceDoc.riskScore;
      }
    } catch (err) {
      console.warn('Could not fetch voice analysis document:', err.message);
    }
  }

  // 5. Fraud Relationship Graph & Network Risk check (Phase 8)
  let graphResult = { graphRiskScore: 0, riskLevel: 'LOW', reasons: [], patterns: [] };
  try {
    graphResult = await evaluateGraphRisk({
      userId,
      receiverId: transactionData.receiverId,
      deviceId: devId,
      amount: transactionData.amount,
      transactionFrequency: transactionData.transactionFrequency || 1,
      voiceRiskScore: voiceScore || 0
    });
  } catch (gErr) {
    console.warn('Graph evaluation failed:', gErr.message);
  }

  // 6. Central Calculation across all 5 Signals
  const calculation = calculateRisk({
    transactionML: mlScore,
    behavioral: behaviorAnalysis.score,
    deviceTrust: deviceTrustScore,
    voice: voiceScore,
    graph: graphResult.graphRiskScore
  });

  // 7. Aggregate Signals and Explainable Reasons
  const signals = [...new Set([...behaviorAnalysis.signals])];
  const reasons = [...new Set([...behaviorAnalysis.reasons, ...graphResult.reasons])];

  if (deviceResult.isNew && !signals.includes('NEW_DEVICE')) {
    signals.push('NEW_DEVICE');
    reasons.push('This transaction originated from a device not previously associated with this account.');
  }

  if (voiceScore !== null && voiceScore >= 50) {
    signals.push('VOICE_RISK');
    reasons.push('Voice analysis detected payment urgency or social engineering indicators.');
  }

  if (graphResult.graphRiskScore >= 40) {
    signals.push('GRAPH_NETWORK_RISK');
  }

  // Add detected graph patterns to signals
  graphResult.patterns.forEach(p => {
    if (!signals.includes(p.type)) {
      signals.push(p.type);
    }
  });

  if (calculation.finalScore >= 70 && reasons.length === 0) {
    reasons.push('Combined risk indicators exceed acceptable safety threshold.');
  }

  // Determine Event Type
  let eventType = 'TRANSACTION';
  if (voiceAnalysisId) {
    eventType = 'COMBINED_RISK';
  } else if (graphResult.graphRiskScore >= 50) {
    eventType = 'COMBINED_RISK';
  } else if (behaviorAnalysis.signals.length > 0) {
    eventType = 'BEHAVIOR_ANOMALY';
  } else if (deviceResult.isNew) {
    eventType = 'DEVICE_CHANGE';
  }

  // 8. Store RiskEvent in Database for investigation timeline
  const socketService = require('./socketService');
  const eventId = socketService.generateEventId();

  const riskEvent = new RiskEvent({
    eventId,
    userId,
    transactionId: transactionData.transactionId || null,
    voiceAnalysisId: voiceAnalysisId || null,
    eventType: calculation.riskLevel === 'HIGH' ? 'HIGH_RISK_TRANSACTION' : eventType,
    riskScore: calculation.finalScore,
    riskLevel: calculation.riskLevel,
    amount: Number(transactionData.amount) || 0,
    receiverId: transactionData.receiverId || '',
    signals,
    reasons,
    metadata: {
      deviceId: devId,
      amount: transactionData.amount,
      receiverId: transactionData.receiverId,
      location: transactionData.location,
      componentScores: calculation.componentScores,
      patterns: graphResult.patterns
    },
    timestamp: new Date()
  });
  await riskEvent.save();

  // 9. Record Graph Edges
  if (transactionData.transactionId || riskEvent.id) {
    try {
      await recordTransactionRelationships({
        userId,
        transactionId: transactionData.transactionId || riskEvent.id,
        receiverId: transactionData.receiverId,
        deviceId: devId,
        location: transactionData.location,
        voiceAnalysisId,
        riskScore: calculation.finalScore
      });
    } catch (edgeErr) {
      console.warn('Failed to record graph edges:', edgeErr.message);
    }
  }

  // 10. Update User's RiskProfile
  let profile = await RiskProfile.findOne({ userId });
  if (!profile) {
    profile = new RiskProfile({
      userId,
      currentRiskScore: calculation.finalScore,
      currentRiskLevel: calculation.riskLevel,
      totalEvaluations: 1,
      highRiskCount: calculation.riskLevel === 'HIGH' ? 1 : 0,
      lastEvaluatedAt: new Date(),
      recentScores: []
    });
  } else {
    profile.currentRiskScore = calculation.finalScore;
    profile.currentRiskLevel = calculation.riskLevel;
    profile.totalEvaluations += 1;
    if (calculation.riskLevel === 'HIGH') profile.highRiskCount += 1;
    profile.lastEvaluatedAt = new Date();
  }

  const todayStr = new Date().toISOString().split('T')[0];
  profile.recentScores.push({
    date: todayStr,
    riskScore: calculation.finalScore,
    riskLevel: calculation.riskLevel,
    timestamp: new Date()
  });

  if (profile.recentScores.length > 20) {
    profile.recentScores = profile.recentScores.slice(-20);
  }
  await profile.save();

  // 11. Create User Security Alert if High risk, graph risk, or new device
  if (calculation.riskLevel === 'HIGH' || deviceResult.isNew || graphResult.graphRiskScore >= 70) {
    let alertType = 'FRAUD_WARNING';
    let alertTitle = 'Suspicious Payment Detected';
    let alertMsg = `A transaction for ₹${transactionData.amount || 0} triggered elevated fraud risk warnings.`;

    if (deviceResult.isNew) {
      alertType = 'DEVICE_CHANGE';
      alertTitle = 'New Device Detected';
      alertMsg = `A transaction was initiated from a device (${devId}) not previously associated with your account.`;
    } else if (voiceScore && voiceScore >= 70) {
      alertType = 'VOICE_WARNING';
      alertTitle = 'Voice Phishing Risk';
      alertMsg = 'Call transcript analysis identified high-pressure social engineering tactics.';
    }

    try {
      await createSecurityAlert(userId, {
        type: alertType,
        title: alertTitle,
        message: alertMsg,
        riskScore: calculation.finalScore
      });
    } catch (alertErr) {
      console.warn('Failed to dispatch security alert:', alertErr.message);
    }
  }

  return {
    success: true,
    eventId,
    riskEventId: riskEvent.id || riskEvent._id.toString(),
    riskScore: calculation.finalScore,
    riskLevel: calculation.riskLevel,
    recommendedAction: calculation.recommendedAction,
    fraudProbability: fraudProb,
    signals,
    reasons,
    patterns: graphResult.patterns,
    componentScores: calculation.componentScores,
    device: {
      deviceId: devId,
      isNew: deviceResult.isNew,
      trustScore: deviceTrustScore,
      trustCategory: deviceResult.trustCategory
    },
    graphRisk: {
      graphRiskScore: graphResult.graphRiskScore,
      patterns: graphResult.patterns,
      metrics: graphResult.metrics
    },
    model: {
      version: mlModelVersion,
      modelType: mlModelType,
      optimalThreshold: mlOptimalThreshold,
      calibrated: true
    }
  };
};

module.exports = {
  DEFAULT_WEIGHTS,
  calculateRisk,
  evaluateContextualRisk
};
