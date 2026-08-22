const mongoose = require('mongoose');

const voiceAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: false
  },
  riskScore: {
    type: Number,
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    required: true
  },
  indicators: [{
    type: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      required: true
    },
    explanation: {
      type: String,
      required: true
    }
  }],
  explanation: [{
    type: String
  }],
  recommendedAction: {
    type: String,
    enum: ['CONTINUE_WITH_CAUTION', 'VERIFY_CALLER', 'DO_NOT_PAY'],
    required: true
  },
  transcriptAvailable: {
    type: Boolean,
    default: false
  },
  transcript: {
    type: String,
    required: false
  },
  feedback: {
    type: String,
    enum: ['FALSE_POSITIVE', 'CORRECT_WARNING', 'PENDING'],
    default: 'PENDING'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Configure JSON formatting
voiceAnalysisSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('VoiceAnalysis', voiceAnalysisSchema);
