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
    enum: ['trial', 'active', 'past_due', 'paused', 'cancelled'],
    default: 'trial',
    required: true
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
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
  gateway: {
    type: String,
    enum: ['stripe'],
    required: true
  },
  gatewayCustomerId: {
    type: String,
    required: true
  },
  gatewaySubscriptionId: {
    type: String,
    required: true
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
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
SubscriptionSchema.index({ customerId: 1 });
SubscriptionSchema.index({ status: 1 });

export default mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);