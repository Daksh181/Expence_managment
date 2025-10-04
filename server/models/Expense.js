const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Expense title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Travel',
      'Meals',
      'Accommodation',
      'Transportation',
      'Office Supplies',
      'Software',
      'Training',
      'Marketing',
      'Entertainment',
      'Utilities',
      'Other'
    ]
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    uppercase: true,
    length: [3, 'Currency must be 3 characters (ISO code)']
  },
  convertedAmount: {
    type: Number,
    required: true
  },
  baseCurrency: {
    type: String,
    required: true,
    uppercase: true,
    length: [3, 'Base currency must be 3 characters (ISO code)']
  },
  exchangeRate: {
    type: Number,
    required: true
  },
  expenseDate: {
    type: Date,
    required: [true, 'Expense date is required']
  },
  submissionDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected', 'cancelled'],
    default: 'draft'
  },
  receipts: [{
    filename: String,
    originalName: String,
    url: String,
    size: Number,
    mimetype: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  approvalFlow: [{
    approverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    comments: String,
    actionDate: Date,
    order: Number
  }],
  currentApprover: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  rejectionReason: String,
  tags: [String],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'yearly']
    },
    endDate: Date
  },
  metadata: {
    ocrData: {
      extractedAmount: Number,
      extractedDate: Date,
      extractedMerchant: String,
      confidence: Number
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
expenseSchema.index({ employeeId: 1, status: 1 });
expenseSchema.index({ companyId: 1, status: 1 });
expenseSchema.index({ expenseDate: -1 });
expenseSchema.index({ submissionDate: -1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ 'approvalFlow.approverId': 1, 'approvalFlow.status': 1 });

// Virtual for total approval count
expenseSchema.virtual('totalApprovals').get(function() {
  return this.approvalFlow.length;
});

// Virtual for completed approvals
expenseSchema.virtual('completedApprovals').get(function() {
  return this.approvalFlow.filter(approval => 
    approval.status === 'approved' || approval.status === 'rejected'
  ).length;
});

// Method to get next approver
expenseSchema.methods.getNextApprover = function() {
  const pendingApproval = this.approvalFlow.find(approval => 
    approval.status === 'pending'
  );
  return pendingApproval ? pendingApproval.approverId : null;
};

// Method to check if expense is fully approved
expenseSchema.methods.isFullyApproved = function() {
  return this.approvalFlow.every(approval => approval.status === 'approved');
};

// Method to check if expense is rejected
expenseSchema.methods.isRejected = function() {
  return this.approvalFlow.some(approval => approval.status === 'rejected');
};

module.exports = mongoose.model('Expense', expenseSchema);

