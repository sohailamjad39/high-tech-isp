// models/Office.js
import mongoose from 'mongoose';

// Office Schema
const OfficeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Office name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  address: {
    line1: {
      type: String,
      required: [true, 'Address line 1 is required'],
      trim: true
    },
    line2: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      uppercase: true,
      length: 2
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  hours: [{
    day: {
      type: Number,
      required: true,
      min: 0,
      max: 6
    },
    open: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
    },
    close: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
    },
    closed: {
      type: Boolean,
      default: false
    }
  }],
  services: [{
    type: String,
    enum: ['sales', 'billing', 'technical_support', 'installation', 'equipment_return']
  }],
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  capacity: {
    type: Number,
    default: 10
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'under_construction'],
    default: 'active'
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

// 2dsphere index for geospatial queries as per blueprint
OfficeSchema.index({ location: '2dsphere' });

export default mongoose.models.Office || mongoose.model('Office', OfficeSchema);