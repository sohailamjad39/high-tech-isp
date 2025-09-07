// models/ServicePlan.js
import mongoose from 'mongoose';

const ServicePlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase and contain only letters, numbers, and hyphens']
  },
  speedMbps: {
    download: {
      type: Number,
      required: [true, 'Download speed is required'],
      min: [1, 'Download speed must be at least 1 Mbps'],
      max: [10000, 'Download speed cannot exceed 10,000 Mbps']
    },
    upload: {
      type: Number,
      required: [true, 'Upload speed is required'],
      min: [1, 'Upload speed must be at least 1 Mbps'],
      max: [10000, 'Upload speed cannot exceed 10,000 Mbps']
    }
  },
  dataCapGB: {
    type: Number,
    default: null,
    min: [0, 'Data cap cannot be negative']
  },
  priceMonthly: {
    type: Number,
    required: [true, 'Monthly price is required'],
    min: [0, 'Price cannot be negative']
  },
  priceYearly: {
    type: Number,
    required: [true, 'Yearly price is required'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    uppercase: true,
    length: 3,
    default: 'USD'
  },
  contractMonths: {
    type: Number,
    required: [true, 'Contract length is required'],
    min: [0, 'Contract length cannot be negative'],
    max: [36, 'Contract length cannot exceed 36 months']
  },
  features: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  active: {
    type: Boolean,
    default: true,
    required: true
  },
  gatewayPriceIds: {
    stripe: {
      monthly: { type: String },
      yearly: { type: String }
    }
  },
  tags: [{
    type: String,
    enum: ['popular', 'best-value', 'premium', 'basic', 'business', 'enterprise', 'featured']
  }],
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 11
  },
  trialDays: {
    type: Number,
    default: 0,
    min: 0,
    max: 30
  },
  setupFee: {
    type: Number,
    default: 0,
    min: 0
  },
  equipmentIncluded: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes
ServicePlanSchema.index({ slug: 1 }, { unique: true });
ServicePlanSchema.index({ active: 1 });

// Pre-save middleware
ServicePlanSchema.pre('save', function(next) {
  // Fix priority if out of range
  if (this.priority > 11) this.priority = 11;
  if (this.priority < 0) this.priority = 0;
  
  // Clean up invalid tags
  const validTags = ['popular', 'best-value', 'premium', 'basic', 'business', 'enterprise', 'featured'];
  if (this.tags && Array.isArray(this.tags)) {
    this.tags = this.tags.filter(tag => validTags.includes(tag));
  }
  
  next();
});

// Virtuals
ServicePlanSchema.virtual('addons', {
  ref: 'Addon',
  localField: '_id',
  foreignField: 'applicablePlanIds',
  justOne: false
});

ServicePlanSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'planId',
  justOne: false
});

ServicePlanSchema.virtual('subscriptions', {
  ref: 'Subscription',
  localField: '_id',
  foreignField: 'planId',
  justOne: false
});

export default mongoose.models.ServicePlan || mongoose.model('ServicePlan', ServicePlanSchema);