const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  type: {
    type: String,
    enum: ['SECURITY', 'FRAUD_WARNING', 'DEVICE_CHANGE', 'VOICE_WARNING'],
    default: 'SECURITY',
    required: [true, 'Alert type is required']
  },
  title: {
    type: String,
    required: [true, 'Alert title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Alert message is required'],
    trim: true
  },
  riskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

alertSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Alert = mongoose.model('Alert', alertSchema);
module.exports = Alert;
