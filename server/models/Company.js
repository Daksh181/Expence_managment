const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    uppercase: true,
    length: [3, 'Currency must be 3 characters (ISO code)']
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  settings: {
    allowMultiCurrency: {
      type: Boolean,
      default: true
    },
    requireReceipt: {
      type: Boolean,
      default: true
    },
    maxExpenseAmount: {
      type: Number,
      default: 10000
    },
    approvalRequired: {
      type: Boolean,
      default: true
    },
    autoApprovalLimit: {
      type: Number,
      default: 100
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
companySchema.index({ name: 1 });
companySchema.index({ country: 1 });

module.exports = mongoose.model('Company', companySchema);

