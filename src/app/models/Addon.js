// models/Addon.js
import mongoose from 'mongoose';

// Addon Schema
const AddonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Addon name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  priceMonthly: {
    type: Number,
    required: [true, 'Monthly price is required'],
    min: [0, 'Price cannot be negative']
  },
  priceOneTime: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative']
  },
  active: {
    type: Boolean,
    default: true,
    required: true
  },
  applicablePlanIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServicePlan'
  }],
  category: {
    type: String,
    enum: ['equipment', 'service', 'feature', 'protection'],
    default: 'service'
  },
  requiresInstallation: {
    type: Boolean,
    default: false
  },
  maxPerAccount: {
    type: Number,
    default: 1,
    min: 1
  },
  setupFee: {
    type: Number,
    default: 0,
    min: 0
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

export default mongoose.models.Addon || mongoose.model('Addon', AddonSchema);