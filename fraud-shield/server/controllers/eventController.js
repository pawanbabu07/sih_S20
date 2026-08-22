const RiskEvent = require('../models/RiskEvent');
const { emitHighRiskTransaction } = require('../services/socketService');

/**
 * @desc    Get real-time risk events history
 * @route   GET /api/events
 * @access  Private (User gets own events, Admin gets filtered institutional feed)
 */
const getEvents = async (req, res) => {
  try {
    const { eventType, riskLevel, timeRange, limit = 50 } = req.query;
    const query = {};

    // Normal users strictly only get their own events
    if (req.user.role !== 'admin') {
      query.userId = req.user.id;
    } else if (req.query.userId) {
      query.userId = req.query.userId;
    }

    if (eventType) {
      query.eventType = eventType;
    }

    if (riskLevel) {
      query.riskLevel = riskLevel;
    }

    if (timeRange) {
      const now = Date.now();
      if (timeRange === '5m') {
        query.timestamp = { $gte: new Date(now - 5 * 60 * 1000) };
      } else if (timeRange === '15m') {
        query.timestamp = { $gte: new Date(now - 15 * 60 * 1000) };
      } else if (timeRange === '1h') {
        query.timestamp = { $gte: new Date(now - 60 * 60 * 1000) };
      } else if (timeRange === '24h') {
        query.timestamp = { $gte: new Date(now - 24 * 60 * 60 * 1000) };
      }
    }

    const events = await RiskEvent.find(query)
      .sort({ timestamp: -1 })
      .limit(Number(limit) || 50)
      .populate('userId', 'name email phone')
      .populate('transactionId', 'amount receiverName receiverId status deviceId location');

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve risk events history',
      error: error.message
    });
  }
};

/**
 * @desc    Broadcast simulated test event to admin live monitor (Demo Mode)
 * @route   POST /api/events/broadcast-test
 * @access  Public / Demo Presentation
 */
const broadcastTestEvent = async (req, res) => {
  try {
    const { title, riskScore = 90, riskLevel = 'HIGH', message } = req.body;
    const event = emitHighRiskTransaction({
      title: title || 'SIH Live Demo High-Risk Alert',
      riskScore: Number(riskScore) || 90,
      riskLevel: riskLevel || 'HIGH',
      message: message || 'Simulated transaction event triggered from Demo Mode',
      eventType: 'HIGH_RISK_TRANSACTION',
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: 'Test event broadcasted successfully to admin monitor',
      event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to broadcast test event',
      error: error.message
    });
  }
};

module.exports = {
  getEvents,
  broadcastTestEvent
};
