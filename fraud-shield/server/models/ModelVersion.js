const mongoose = require('mongoose');

const ModelVersionSchema = new mongoose.Schema({
  version: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  name: {
    type: String,
    default: 'Fraud Shield Core Model'
  },
  modelType: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['TRAINING', 'VALIDATION', 'CANDIDATE', 'ACTIVE', 'RETIRED'],
    default: 'VALIDATION',
    index: true
  },
  trainingDate: {
    type: Date,
    default: Date.now
  },
  datasetVersion: {
    type: String,
    default: 'v2.0'
  },
  datasetSize: {
    type: Number,
    default: 6000
  },
  classDistribution: {
    legitimatePercent: { type: Number, default: 82.7 },
    fraudPercent: { type: Number, default: 17.3 },
    fraudCount: { type: Number, default: 1038 },
    totalCount: { type: Number, default: 6000 }
  },
  metrics: {
    accuracy: { type: Number, required: true },
    precision: { type: Number, required: true },
    recall: { type: Number, required: true },
    f1Score: { type: Number, required: true },
    rocAuc: { type: Number, required: true },
    prAuc: { type: Number, required: true }
  },
  calibration: {
    calibrated: { type: Boolean, default: true },
    method: { type: String, default: 'sigmoid_platt_scaling' },
    brierScoreBefore: { type: Number, default: 0.18 },
    brierScoreAfter: { type: Number, default: 0.11 }
  },
  optimalThreshold: {
    type: Number,
    default: 0.40
  },
  thresholdAnalysis: [{
    threshold: Number,
    precision: Number,
    recall: Number,
    f1: Number,
    falsePositiveRate: Number
  }],
  featureImportances: [{
    feature: String,
    importance: Number
  }],
  features: [{
    type: String
  }],
  trainingDistributions: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvalNotes: {
    type: String,
    default: ''
  },
  activeSince: {
    type: Date,
    default: null
  },
  retiredAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ModelVersion', ModelVersionSchema);
