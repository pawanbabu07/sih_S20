const mongoose = require('mongoose');

const voiceFeedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  voiceAnalysisId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VoiceAnalysis',
    required: true
  },
  feedback: {
    type: String,
    enum: ['FALSE_POSITIVE', 'CORRECT_WARNING'],
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'UNDER_REVIEW', 'RESOLVED'],
    default: 'PENDING'
  },
  resolution: {
    type: String,
    enum: ['LEGITIMATE_TRANSACTION', 'CONFIRMED_FRAUD', 'INSUFFICIENT_INFORMATION'],
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

voiceFeedbackSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('VoiceFeedback', voiceFeedbackSchema);
