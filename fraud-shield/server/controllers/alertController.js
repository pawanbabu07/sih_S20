const { getUserAlerts, markAlertAsRead, markAllAlertsAsRead } = require('../services/alertService');

/**
 * @desc    Get user alerts
 * @route   GET /api/alerts
 * @access  Private
 */
const getAlerts = async (req, res, next) => {
  try {
    const alerts = await getUserAlerts(req.user.id, 50);
    const unreadCount = alerts.filter(a => !a.isRead).length;

    res.status(200).json({
      success: true,
      unreadCount,
      count: alerts.length,
      alerts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a single alert as read
 * @route   PATCH /api/alerts/:id/read
 * @access  Private
 */
const markRead = async (req, res, next) => {
  try {
    const alert = await markAlertAsRead(req.user.id, req.params.id);
    res.status(200).json({
      success: true,
      message: 'Alert marked as read.',
      alert
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all alerts as read
 * @route   PATCH /api/alerts/read-all
 * @access  Private
 */
const markAllRead = async (req, res, next) => {
  try {
    const result = await markAllAlertsAsRead(req.user.id);
    res.status(200).json({
      success: true,
      message: 'All alerts marked as read.',
      updatedCount: result.updatedCount
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAlerts,
  markRead,
  markAllRead
};
