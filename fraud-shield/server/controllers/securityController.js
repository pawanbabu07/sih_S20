const { getUserDevices, markDeviceAsTrusted } = require('../services/deviceService');
const { getOrCreateUserBehavior } = require('../services/behaviorService');
const { getUserAlerts } = require('../services/alertService');
const RiskProfile = require('../models/RiskProfile');
const RiskEvent = require('../models/RiskEvent');
const Device = require('../models/Device');

/**
 * @desc    Get comprehensive security center overview
 * @route   GET /api/security/overview
 * @access  Private
 */
const getSecurityOverview = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [devices, behavior, profile, recentEvents, recentAlerts] = await Promise.all([
      getUserDevices(userId),
      getOrCreateUserBehavior(userId),
      RiskProfile.findOne({ userId }),
      RiskEvent.find({ userId }).sort({ timestamp: -1 }).limit(8),
      getUserAlerts(userId, 5)
    ]);

    const trustedDevicesCount = devices.filter(d => d.isTrusted).length;
    const knownReceiversCount = (behavior.knownReceivers || []).length;
    const suspiciousEventsCount = await RiskEvent.countDocuments({
      userId,
      riskLevel: { $in: ['MEDIUM', 'HIGH'] }
    });

    const currentRiskScore = profile ? profile.currentRiskScore : 15;
    const currentRiskLevel = profile ? profile.currentRiskLevel : 'LOW';
    const isProtected = currentRiskLevel !== 'HIGH';

    const recentScores = profile && profile.recentScores && profile.recentScores.length > 0
      ? profile.recentScores.map(s => ({ date: s.date, riskScore: s.riskScore, riskLevel: s.riskLevel }))
      : [{ date: new Date().toISOString().split('T')[0], riskScore: currentRiskScore, riskLevel: currentRiskLevel }];

    res.status(200).json({
      success: true,
      securityStatus: {
        isProtected,
        statusText: isProtected ? 'Account Protected' : 'Action Required / Elevated Risk',
        currentRiskScore,
        currentRiskLevel,
        trustedDevicesCount,
        totalDevicesCount: devices.length,
        knownReceiversCount,
        suspiciousEventsCount
      },
      devices,
      recentScores,
      recentEvents: recentEvents.map(e => ({
        id: e.id || e._id.toString(),
        eventType: e.eventType,
        riskScore: e.riskScore,
        riskLevel: e.riskLevel,
        signals: e.signals,
        reasons: e.reasons,
        timestamp: e.timestamp
      })),
      recentAlerts: recentAlerts.map(a => ({
        id: a.id || a._id.toString(),
        type: a.type,
        title: a.title,
        message: a.message,
        riskScore: a.riskScore,
        isRead: a.isRead,
        createdAt: a.createdAt
      }))
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's registered devices list
 * @route   GET /api/security/devices
 * @access  Private
 */
const getDevices = async (req, res, next) => {
  try {
    const devices = await getUserDevices(req.user.id);
    res.status(200).json({
      success: true,
      count: devices.length,
      devices
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a device as trusted
 * @route   PATCH /api/security/devices/:deviceId/trust
 * @access  Private
 */
const trustDevice = async (req, res, next) => {
  try {
    const updatedDevice = await markDeviceAsTrusted(req.user.id, req.params.deviceId);
    res.status(200).json({
      success: true,
      message: 'Device has been marked as trusted.',
      device: updatedDevice
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSecurityOverview,
  getDevices,
  trustDevice
};
