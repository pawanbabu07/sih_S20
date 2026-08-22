const mongoose = require('mongoose');

const riskEventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    default: () => `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    default: null,
    index: true
  },
  voiceAnalysisId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VoiceAnalysis',
    default: null
  },
  eventType: {
    type: String,
    enum: [
      'TRANSACTION',
      'DEVICE_CHANGE',
      'BEHAVIOR_ANOMALY',
      'VOICE_RISK',
      'COMBINED_RISK',
      'HIGH_RISK_TRANSACTION',
      'VOICE_RISK_DETECTED',
      'DEVICE_CHANGE_DETECTED',
      'SECURITY_ALERT',
      'TRANSACTION_STATUS_CHANGED',
      'FRAUD_CASE_CREATED',
      'FRAUD_CASE_UPDATED',
      'FRAUD_RISK_UPDATED'
    ],
    required: [true, 'Event type is required'],
    index: true
  },
  riskScore: {
    type: Number,
    required: [true, 'Risk score is required'],
    min: 0,
    max: 100
  },
  riskLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    required: [true, 'Risk level is required']
  },
  amount: {
    type: Number,
    default: 0
  },
  receiverId: {
    type: String,
    default: ''
  },
  signals: {
    type: [String],
    default: []
  },
  reasons: {
    type: [String],
    default: []
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

riskEventSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const RiskEvent = mongoose.model('RiskEvent', riskEventSchema);
module.exports = RiskEvent;
