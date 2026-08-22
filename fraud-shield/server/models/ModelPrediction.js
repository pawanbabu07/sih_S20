const mongoose = require('mongoose');

const ModelPredictionSchema = new mongoose.Schema({
  modelVersion: {
    type: String,
    default: 'fraud-rf-v1.0',
    index: true
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    default: null,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  prediction: {
    type: Number, // 0 = Legitimate, 1 = Fraud
    required: true
  },
  probability: {
    type: Number, // 0.0 to 1.0
    required: true
  },
  riskScore: {
    type: Number, // 0 to 100
    required: true
  },
  actualLabel: {
    type: Number, // null initially, 1 = Confirmed Fraud, 0 = False Positive / Legitimate
    default: null,
    index: true
  },
  features: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

ModelPredictionSchema.index({ modelVersion: 1, createdAt: -1 });

module.exports = mongoose.model('ModelPrediction', ModelPredictionSchema);
