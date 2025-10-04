const mongoose = require('mongoose');

const approvalRuleSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Rule name is required'],
    trim: true,
    maxlength: [100, 'Rule name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  ruleType: {
    type: String,
    enum: ['sequential', 'percentage', 'conditional', 'hybrid'],
    required: [true, 'Rule type is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  conditions: {
    amountThreshold: {
      type: Number,
      default: 0
    },
    categories: [String],
    departments: [String],
    currencies: [String]
  },
  approvers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['manager', 'finance', 'director', 'admin'],
      required: true
    },
    order: {
      type: Number,
      required: true
    },
    isRequired: {
      type: Boolean,
      default: true
    },
    canDelegate: {
      type: Boolean,
      default: false
    }
  }],
  percentageRules: {
    minPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 60
    },
    requireAll: {
      type: Boolean,
      default: false
    }
  },
  conditionalRules: [{
    condition: {
      type: String,
      enum: ['amount_greater_than', 'amount_less_than', 'category_equals', 'department_equals']
    },
    value: mongoose.Schema.Types.Mixed,
    action: {
      type: String,
      enum: ['auto_approve', 'auto_reject', 'skip_approver', 'add_approver']
    },
    targetApprover: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  escalationRules: {
    enabled: {
      type: Boolean,
      default: false
    },
    escalationTime: {
      type: Number, // in hours
      default: 24
    },
    escalateTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
approvalRuleSchema.index({ companyId: 1, isActive: 1 });
approvalRuleSchema.index({ 'conditions.amountThreshold': 1 });
approvalRuleSchema.index({ 'conditions.categories': 1 });

// Method to get applicable approvers for an expense
approvalRuleSchema.methods.getApplicableApprovers = function(expense) {
  // Check if rule applies to this expense
  if (!this.isActive) return [];
  
  // Check amount threshold
  if (this.conditions.amountThreshold > 0 && 
      expense.convertedAmount < this.conditions.amountThreshold) {
    return [];
  }
  
  // Check categories
  if (this.conditions.categories.length > 0 && 
      !this.conditions.categories.includes(expense.category)) {
    return [];
  }
  
  // Return approvers based on rule type
  switch (this.ruleType) {
    case 'sequential':
      return this.approvers.sort((a, b) => a.order - b.order);
    case 'percentage':
      return this.approvers;
    case 'conditional':
      return this.approvers.filter(approver => 
        this.checkConditionalRules(expense, approver)
      );
    default:
      return this.approvers;
  }
};

// Method to check conditional rules
approvalRuleSchema.methods.checkConditionalRules = function(expense, approver) {
  return this.conditionalRules.every(rule => {
    switch (rule.condition) {
      case 'amount_greater_than':
        return expense.convertedAmount > rule.value;
      case 'amount_less_than':
        return expense.convertedAmount < rule.value;
      case 'category_equals':
        return expense.category === rule.value;
      default:
        return true;
    }
  });
};

module.exports = mongoose.model('ApprovalRule', approvalRuleSchema);

