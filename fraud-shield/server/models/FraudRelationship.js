const mongoose = require('mongoose');

const FraudRelationshipSchema = new mongoose.Schema({
  sourceType: {
    type: String,
    enum: ['USER', 'DEVICE', 'RECEIVER', 'TRANSACTION', 'LOCATION', 'VOICE_EVENT'],
    required: true,
    index: true
  },
  sourceId: {
    type: String,
    required: true,
    index: true
  },
  relationship: {
    type: String,
    enum: [
      'USES',             // USER -> DEVICE
      'SENDS',            // USER -> TRANSACTION
      'TO',               // TRANSACTION -> RECEIVER
      'FROM',             // TRANSACTION -> DEVICE
      'LOCATED_AT',       // USER/TRANSACTION -> LOCATION
      'ASSOCIATED_WITH'   // TRANSACTION -> VOICE_EVENT
    ],
    required: true,
    index: true
  },
  targetType: {
    type: String,
    enum: ['USER', 'DEVICE', 'RECEIVER', 'TRANSACTION', 'LOCATION', 'VOICE_EVENT'],
    required: true,
    index: true
  },
  targetId: {
    type: String,
    required: true,
    index: true
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    default: null,
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound indexes for graph edge lookups and multi-hop traversals
FraudRelationshipSchema.index({ sourceId: 1, relationship: 1 });
FraudRelationshipSchema.index({ targetId: 1, relationship: 1 });
FraudRelationshipSchema.index({ sourceType: 1, sourceId: 1, targetType: 1, targetId: 1 });

module.exports = mongoose.model('FraudRelationship', FraudRelationshipSchema);
