// models/InstallationJob.js
import mongoose from 'mongoose';

const InstallationJobSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  scheduledStart: {
    type: Date,
    required: true
  },
  scheduledEnd: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'enroute', 'in_progress', 'completed', 'failed', 'no_show', 'cancelled'],
    default: 'scheduled',
    required: true
  },
  notes: {
    type: String
  },
  photos: [{
    type: String
  }],
  devices: [{
    inventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DeviceInventory'
    },
    mac: {
      type: String
    },
    serial: {
      type: String
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

InstallationJobSchema.index({ technicianId: 1, scheduledStart: 1 });
InstallationJobSchema.index({ orderId: 1 });

export default mongoose.models.InstallationJob || mongoose.model('InstallationJob', InstallationJobSchema);