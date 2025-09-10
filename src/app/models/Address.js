// models/Address.js
import mongoose from 'mongoose';

// Address Schema
const AddressSchema = new mongoose.Schema({
  label: {
    type: String,
    required: [true, 'Address label is required'],
    trim: true,
    maxlength: [50, 'Label cannot exceed 50 characters']
  },
  line1: {
    type: String,
    required: [true, 'Address line 1 is required'],
    trim: true,
    maxlength: [100, 'Address line 1 cannot exceed 100 characters']
  },
  line2: {
    type: String,
    trim: true,
    maxlength: [100, 'Address line 2 cannot exceed 100 characters'],
    default: ''
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [50, 'City cannot exceed 50 characters']
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    maxlength: [50, 'State cannot exceed 50 characters']
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required'],
    trim: true,
    maxlength: [20, 'Postal code cannot exceed 20 characters']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    uppercase: true,
    length: 2
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  verified: {
    type: Boolean,
    default: false
  },
  verificationMethod: {
    type: String,
    enum: ['manual', 'geocoding', 'customer_confirmation']
  },
  verificationDate: {
    type: Date
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

AddressSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'addressId',
  justOne: false
});

export default mongoose.models.Address || mongoose.model('Address', AddressSchema);