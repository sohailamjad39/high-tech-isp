// models/Invoice.js
import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  issuedAt: {
    type: Date,
    required: true
  },
  dueAt: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'issued', 'paid', 'overdue', 'void', 'refunded', 'partial'],
    default: 'issued',
    required: true
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
  items: [{
    description: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      default: 1
    }
  }],
  pdfUrl: {
    type: String
  },
  gateway: {
    type: String,
    enum: ['stripe']
  },
  gatewayInvoiceId: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

InvoiceSchema.index({ customerId: 1, issuedAt: -1 });
InvoiceSchema.index({ invoiceNumber: 1 }, { unique: true });

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);