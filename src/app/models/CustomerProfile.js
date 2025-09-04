// models/CustomerProfile.js
import mongoose from 'mongoose';

// Customer Profile Schema
const CustomerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  defaultAddressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'
  },
  kyc: {
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    documents: [{
      type: {
        type: String,
        enum: ['id_card', 'passport', 'driver_license', 'utility_bill'],
        required: true
      },
      url: {
        type: String,
        required: true
      },
      verifiedAt: {
        type: Date
      },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rejectionReason: {
        type: String,
        maxlength: [500]
      }
    }],
    verifiedAt: {
      type: Date
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  preferredContactMethod: {
    type: String,
    enum: ['email', 'phone', 'sms'],
    default: 'email'
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomerProfile'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { 
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Index as per blueprint
CustomerProfileSchema.index({ userId: 1 });

// Virtual for user
CustomerProfileSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual for default address
CustomerProfileSchema.virtual('defaultAddress', {
  ref: 'Address',
  localField: 'defaultAddressId',
  foreignField: '_id',
  justOne: true
});

export default mongoose.models.CustomerProfile || mongoose.model('CustomerProfile', CustomerProfileSchema);