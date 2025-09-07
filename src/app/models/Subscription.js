// models/Subscription.js
import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServicePlan',
    required: true
  },
  status: {
    type: String,
    enum: ['trial', 'active', 'past_due', 'paused', 'cancelled', 'pending_change'],
    default: 'trial',
    required: true
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly',
    required: true
  },
  currentPeriodStart: {
    type: Date,
    required: true
  },
  currentPeriodEnd: {
    type: Date,
    required: true
  },
  trialEnd: {
    type: Date
  },
  pausedUntil: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  gateway: {
    type: String,
    enum: ['stripe'],
    required: true
  },
  gatewayCustomerId: {
    type: String,
    index: true
  },
  gatewaySubscriptionId: {
    type: String,
    index: true
  },
  addons: [{
    addonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Addon'
    },
    priceMonthly: {
      type: Number,
      required: true
    }
  }],
  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
SubscriptionSchema.index({ customerId: 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ gatewayCustomerId: 1 });
SubscriptionSchema.index({ gatewaySubscriptionId: 1 });

// Virtual for customer
SubscriptionSchema.virtual('customer', {
  ref: 'User',
  localField: 'customerId',
  foreignField: '_id',
  justOne: true
});

// Virtual for plan
SubscriptionSchema.virtual('plan', {
  ref: 'ServicePlan',
  localField: 'planId',
  foreignField: '_id',
  justOne: true
});

export default mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);