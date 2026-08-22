const { evaluateContextualRisk } = require('../services/riskEngine');
const transactionService = require('../services/transactionService');
const Transaction = require('../models/Transaction');
const RiskEvent = require('../models/RiskEvent');
const Alert = require('../models/Alert');
const socketService = require('../services/socketService');

/**
 * @desc    Analyze a transaction for fraud using Real-Time Risk Engine + ML + Device & Behavioral Intelligence
 * @route   POST /api/fraud/check
 * @access  Private
 */
const checkFraud = async (req, res, next) => {
  try {
    const {
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

    // Validate Input
    if (
      amount === undefined ||
      !receiverId ||
      !receiverName ||
      !deviceId ||
      !location ||
      transactionHour === undefined
    ) {
      res.status(400);
      throw new Error('Invalid input: Basic payment attributes (amount, receiver, device, location, hour) are required.');
    }

    // Call Central Real-Time Risk Engine (which evaluates ML + Device Intelligence + Behavioral Baseline + Voice + Graph)
    const riskEvaluation = await evaluateContextualRisk({
      userId: req.user.id,
      transactionData: {
        amount: Number(amount),
        receiverId,
        receiverName,
        transactionType: transactionType || 'UPI',
        deviceId,
        location,
        transactionHour: Number(transactionHour),
        isNewReceiver,
        isNewDevice,
        locationChange,
        failedTransactions: Number(failedTransactions || 0),
        transactionFrequency: Number(transactionFrequency || 1),
        accountAgeDays: Number(accountAgeDays || 365)
      },
      deviceInfo: {
        ...deviceInfo,
        deviceId,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || ''
      },
      voiceAnalysisId: voiceAnalysisId || null
    });

    // Create & save Transaction document in MongoDB
    const status = riskEvaluation.riskLevel === 'HIGH' ? 'FLAGGED' : 'PENDING';
    const transaction = new Transaction({
      userId: req.user.id,
      amount: Number(amount),
      receiverId,
      receiverName,
      transactionType: transactionType || 'UPI',
      deviceId,
      location,
      transactionHour: Number(transactionHour),
      isNewReceiver: riskEvaluation.signals.includes('NEW_RECEIVER'),
      isNewDevice: riskEvaluation.signals.includes('NEW_DEVICE'),
      status,
      riskScore: riskEvaluation.riskScore,
      riskLevel: riskEvaluation.riskLevel,
      fraudProbability: riskEvaluation.fraudProbability,
      fraudReasons: riskEvaluation.reasons
    });

    const savedTransaction = await transaction.save();
    const eventId = riskEvaluation.eventId || socketService.generateEventId();

    // Link transactionId to the RiskEvent created by the risk engine
    if (riskEvaluation.riskEventId) {
      try {
        await RiskEvent.findByIdAndUpdate(riskEvaluation.riskEventId, {
          transactionId: savedTransaction._id
        });
      } catch (evtErr) {
        console.warn('Could not update RiskEvent transactionId:', evtErr.message);
      }
    }

    // 2. Log model prediction for versioning, evaluation, and feedback loop
    try {
      const ModelPrediction = require('../models/ModelPrediction');
      const { recordTransactionRelationships } = require('../services/graphBuilderService');

      await ModelPrediction.create({
        modelVersion: 'fraud-rf-v1.0',
        transactionId: savedTransaction._id,
        userId: req.user.id,
        prediction: riskEvaluation.riskLevel === 'HIGH' ? 1 : 0,
        probability: riskEvaluation.fraudProbability || 0,
        riskScore: savedTransaction.riskScore,
        features: {
          amount: Number(amount),
          receiverId,
          deviceId,
          location,
          signals: riskEvaluation.signals
        }
      });

      // Record graph edges
      await recordTransactionRelationships({
        userId: req.user.id,
        transactionId: savedTransaction._id,
        receiverId,
        deviceId,
        location,
        voiceAnalysisId,
        riskScore: savedTransaction.riskScore
      });
    } catch (logErr) {
      console.warn('Could not log model prediction or graph edges:', logErr.message);
    }

    // 3. Real-Time Socket.IO Streaming Emissions (Phase 9)
    try {
      // User real-time risk updated event
      socketService.emitFraudRiskUpdated(req.user.id, {
        eventId,
        transactionId: savedTransaction._id.toString(),
        amount: Number(amount),
        receiverName,
        receiverId,
        riskScore: savedTransaction.riskScore,
        riskLevel: savedTransaction.riskLevel,
        recommendedAction: riskEvaluation.recommendedAction,
        reasons: savedTransaction.fraudReasons,
        signals: riskEvaluation.signals
      });

      // If High-Risk Transaction: emit institutional alert to admin
      if (riskEvaluation.riskLevel === 'HIGH') {
        socketService.emitHighRiskTransaction({
          eventId,
          transactionId: savedTransaction._id.toString(),
          userId: req.user.id,
          userName: req.user.name || 'User',
          amount: Number(amount),
          receiverName,
          receiverId,
          deviceId,
          location,
          riskScore: savedTransaction.riskScore,
          riskLevel: savedTransaction.riskLevel,
          reasons: savedTransaction.fraudReasons,
          signals: riskEvaluation.signals,
          timestamp: savedTransaction.createdAt
        });

        // Emit FRAUD_CASE_CREATED to admin
        socketService.emitFraudCaseCreated({
          caseId: savedTransaction._id.toString(),
          transactionId: savedTransaction._id.toString(),
          userId: req.user.id,
          userName: req.user.name || 'User',
          amount: Number(amount),
          receiverName,
          riskScore: savedTransaction.riskScore,
          riskLevel: savedTransaction.riskLevel,
          reasons: savedTransaction.fraudReasons,
          status: 'FLAGGED',
          createdAt: savedTransaction.createdAt
        });
      }

      // If New Device Detected: emit user alert & save persistent alert
      if (riskEvaluation.signals.includes('NEW_DEVICE')) {
        socketService.emitDeviceChangeDetected(req.user.id, {
          eventId: socketService.generateEventId(),
          deviceId,
          location,
          riskScore: savedTransaction.riskScore,
          message: `A transaction was initiated from an unrecognized device (${deviceId}) in ${location}.`
        });

        await Alert.create({
          userId: req.user.id,
          type: 'DEVICE_CHANGE',
          title: 'New Device Detected',
          message: `Payment initiated from an unrecognized device (${deviceId}) at ${location}.`,
          riskScore: savedTransaction.riskScore
        });
      }
    } catch (sEmitErr) {
      console.warn('Real-time socket emission error in checkFraud:', sEmitErr.message);
    }

    // Compute UI fields
    const isSuspicious = savedTransaction.riskLevel !== 'LOW';
    const recommendedAction = riskEvaluation.recommendedAction;

    const txId = (savedTransaction._id || savedTransaction.id)?.toString();

    res.status(200).json({
      success: true,
      transactionId: txId,
      _id: txId,
      id: txId,
      riskScore: savedTransaction.riskScore,
      riskLevel: savedTransaction.riskLevel,
      fraudProbability: savedTransaction.fraudProbability,
      isSuspicious,
      recommendedAction,
      signals: riskEvaluation.signals,
      reasons: savedTransaction.fraudReasons,
      patterns: riskEvaluation.patterns || [],
      componentScores: riskEvaluation.componentScores,
      device: riskEvaluation.device,
      graphRisk: riskEvaluation.graphRisk
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkFraud
};
