const mongoose = require('mongoose');

const riskProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true,
    index: true
  },
  currentRiskScore: {
    type: Number,
    default: 15,
    min: 0,
    max: 100
  },
  currentRiskLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'LOW'
  },
  totalEvaluations: {
    type: Number,
    default: 0
  },
  highRiskCount: {
    type: Number,
    default: 0
  },
  lastEvaluatedAt: {
    type: Date,
    default: Date.now
  },
  recentScores: [{
    date: {
      type: String, // e.g. "2026-08-20" or ISO String
      required: true
    },
    riskScore: {
      type: Number,
      required: true
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'LOW'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

riskProfileSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const RiskProfile = mongoose.model('RiskProfile', riskProfileSchema);
module.exports = RiskProfile;
