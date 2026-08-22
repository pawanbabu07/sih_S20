const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  deviceId: {
    type: String,
    required: [true, 'Device ID is required'],
    trim: true,
    index: true
  },
  deviceType: {
    type: String,
    default: 'Desktop',
    trim: true
  },
  browser: {
    type: String,
    default: 'Chrome',
    trim: true
  },
  operatingSystem: {
    type: String,
    default: 'Windows',
    trim: true
  },
  ipAddressHash: {
    type: String,
    default: '',
    trim: true
  },
  firstSeen: {
    type: Date,
    default: Date.now
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  transactionCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isTrusted: {
    type: Boolean,
    default: false
  },
  trustScore: {
    type: Number,
    default: 20,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Compound index on userId and deviceId for quick lookups
deviceSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

deviceSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Device = mongoose.model('Device', deviceSchema);
module.exports = Device;
