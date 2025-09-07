// models/Order.js
import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
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
  addons: [{
    addonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Addon'
    },
    priceAtPurchase: {
      type: Number,
      required: true
    }
  }],
  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'
  },
  coverageAreaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CoverageArea'
  },
  installationSlot: {
    start: { type: Date },
    end: { type: Date }
  },
  status: {
    type: String,
    enum: ['initiated', 'awaiting_payment', 'paid', 'scheduled', 'installed', 'cancelled', 'failed'],
    default: 'initiated',
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'refunded'],
    default: 'pending'
  },
  totals: {
    subtotal: {
      type: Number,
      required: true
    },
    tax: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      required: true
    },
    grandTotal: {
      type: Number,
      required: true
    }
  },
  gateway: {
    type: String,
    enum: ['stripe'],
    required: true
  },
  gatewaySessionId: {
    type: String,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
OrderSchema.index({ customerId: 1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ gatewaySessionId: 1 });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);