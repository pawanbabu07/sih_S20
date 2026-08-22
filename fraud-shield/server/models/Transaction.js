const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be greater than or equal to 0']
  },
  receiverId: {
    type: String,
    required: [true, 'Receiver ID is required'],
    trim: true
  },
  receiverName: {
    type: String,
    required: [true, 'Receiver Name is required'],
    trim: true
  },
  transactionType: {
    type: String,
    enum: ['UPI'],
    default: 'UPI'
  },
  deviceId: {
    type: String,
    required: [true, 'Device ID is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  transactionHour: {
    type: Number,
    required: [true, 'Transaction hour is required'],
    min: [0, 'Hour must be between 0 and 23'],
    max: [23, 'Hour must be between 0 and 23']
  },
  isNewReceiver: {
    type: Boolean,
    default: false
  },
  isNewDevice: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'CANCELLED', 'FLAGGED', 'UNDER_REVIEW', 'CONFIRMED_FRAUD', 'FALSE_POSITIVE', 'RESOLVED'],
    default: 'PENDING'
  },
  riskScore: {
    type: Number,
    default: 0,
    min: [0, 'Risk score must be at least 0'],
    max: [100, 'Risk score cannot exceed 100']
  },
  riskLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'LOW'
  },
  fraudProbability: {
    type: Number,
    default: 0
  },
  fraudReasons: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

// Configure JSON serialization
transactionSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
