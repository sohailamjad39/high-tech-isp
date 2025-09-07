// models/Ticket.js
import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  category: {
    type: String,
    enum: ['technical', 'billing', 'installation', 'service', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'closed', 'on_hold'],
    default: 'pending',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  messages: [{
    sender: {
      type: String,
      enum: ['customer', 'agent'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    attachments: [{
      url: {
        type: String,
        required: true
      },
      filename: {
        type: String,
        required: true
      },
      size: {
        type: Number
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

TicketSchema.index({ customerId: 1, createdAt: -1 });
TicketSchema.index({ code: 1 }, { unique: true });
TicketSchema.index({ status: 1 });

export default mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);