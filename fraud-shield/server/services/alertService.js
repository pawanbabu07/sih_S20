const Alert = require('../models/Alert');

/**
 * Create a new security alert for a user
 * @param {string} userId - User Object ID
 * @param {Object} alertData - { type, title, message, riskScore }
 * @returns {Promise<Object>} Created alert document
 */
const createSecurityAlert = async (userId, { type = 'SECURITY', title, message, riskScore = 0 }) => {
  const alert = new Alert({
    userId,
    type,
    title,
    message,
    riskScore: Number(riskScore) || 0,
    isRead: false
  });
  return await alert.save();
};

/**
 * Retrieve recent alerts for a user
 * @param {string} userId - User Object ID
 * @param {number} limit - Maximum alerts to return
 * @returns {Promise<Array>}
 */
const getUserAlerts = async (userId, limit = 20) => {
  return await Alert.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

/**
 * Mark a single alert as read
 * @param {string} userId - User Object ID
 * @param {string} alertId - Alert Object ID
 * @returns {Promise<Object>}
 */
const markAlertAsRead = async (userId, alertId) => {
  const alert = await Alert.findOne({ _id: alertId, userId });
  if (!alert) {
    const error = new Error('Alert notification not found.');
    error.statusCode = 404;
    throw error;
  }
  alert.isRead = true;
  return await alert.save();
};

/**
 * Mark all alerts as read for a user
 * @param {string} userId - User Object ID
 * @returns {Promise<{updatedCount: number}>}
 */
const markAllAlertsAsRead = async (userId) => {
  const result = await Alert.updateMany({ userId, isRead: false }, { isRead: true });
  return { updatedCount: result.modifiedCount };
};

module.exports = {
  createSecurityAlert,
  getUserAlerts,
  markAlertAsRead,
  markAllAlertsAsRead
};
