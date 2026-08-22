/**
 * Centralized Socket.IO Event Constants (Phase 9)
 * Used to ensure consistency across backend emitters and frontend listeners.
 */

const SOCKET_EVENTS = {
  // Real-time risk scoring updates sent to user room
  FRAUD_RISK_UPDATED: 'FRAUD_RISK_UPDATED',

  // Real-time institutional high-risk transaction alerts sent to admin room
  HIGH_RISK_TRANSACTION: 'HIGH_RISK_TRANSACTION',

  // Real-time voice phishing / social engineering scam alerts
  VOICE_RISK_DETECTED: 'VOICE_RISK_DETECTED',

  // Device signature change alert sent to user room
  DEVICE_CHANGE_DETECTED: 'DEVICE_CHANGE_DETECTED',

  // General persistent security notifications
  SECURITY_ALERT: 'SECURITY_ALERT',

  // Payment status transitions (e.g. CANCELLED, CONFIRMED, COMPLETED)
  TRANSACTION_STATUS_CHANGED: 'TRANSACTION_STATUS_CHANGED',

  // Fraud case created for admin investigation
  FRAUD_CASE_CREATED: 'FRAUD_CASE_CREATED',

  // Fraud case updated or resolved by compliance
  FRAUD_CASE_UPDATED: 'FRAUD_CASE_UPDATED'
};

module.exports = SOCKET_EVENTS;
