const mongoose = require('mongoose');

const userBehaviorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true,
    index: true
  },
  averageTransactionAmount: {
    type: Number,
    default: 1250,
    min: 0
  },
  maximumNormalAmount: {
    type: Number,
    default: 5000,
    min: 0
  },
  averageDailyTransactions: {
    type: Number,
    default: 4,
    min: 0
  },
  usualTransactionHours: {
    type: [Number],
    default: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]
  },
  usualLocations: {
    type: [String],
    default: ['Bhubaneswar', 'Delhi', 'Bangalore', 'Mumbai', 'Kolkata']
  },
  knownReceivers: {
    type: [String],
    default: ['rahul@upi', 'amit@upi', 'shop_a@upi', 'shop_b@upi', 'grocery@upi', 'electricity@upi']
  },
  knownDevices: {
    type: [String],
    default: ['device_win_11', 'device_android_primary']
  },
  averageTransactionFrequency: {
    type: Number,
    default: 2,
    min: 0
  },
  lastTransactionAt: {
    type: Date,
    default: Date.now
  },
  lastKnownLocation: {
    type: String,
    default: 'Bhubaneswar'
  }
}, {
  timestamps: true
});

userBehaviorSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const UserBehavior = mongoose.model('UserBehavior', userBehaviorSchema);
module.exports = UserBehavior;
